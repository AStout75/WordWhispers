import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../shared-types/socket-types";
import { Account } from "../../shared-types/account-types";
import lobbies from "../Store/lobbies";
import { GameLogEntry, GameRole } from "../../shared-types/game-types";
import { LobbyPhase } from "../../shared-types/lobby-types";

export function handleMakeBidRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string, value: number): void {
    console.log("*Incoming Request*\n<Make Bid> - Socket ID", socket.id, "Player ID", id, "Lobby ID", lobbyID, "Value", value)
    if (!(lobbyID in lobbies))
        throw new Error("Lobby " + lobbyID + " doesn't exist")
    const lobby = lobbies[lobbyID].lobby
    const location : number | string = lobbies[lobbyID].locations[id]
    const player = lobby.gameSettings.teams[location as number].players.find(player => player.account.id == id)
    if (lobby.lobbySettings.phase != LobbyPhase.Game)
        throw new Error("Lobby " + lobbyID + " is not in the game phase")
    if (!lobby.lobbySettings.members.some(member => member.id == id))
        throw new Error("Account " + id + " is not in lobby " + lobbyID)
    if (!player)
        throw new Error("Player " + id + " is not in team specified " + location)
    if (location == "lounge")
        throw new Error("Player submitted bid from lounge")
    if (player.role != GameRole.Captain)
        throw new Error("Non-captain player submitted bid")
    if (value < 1)
        throw new Error('Bid made was less than 1')
    if (value > 50)
        throw new Error('Bid made was greater than 50')
    if (value == lobby.gameState.teamStates[location as number].currentBid)
        throw new Error('Bid made was equal to current bid')
    
    lobby.gameState.teamStates[location as number].currentBid = value
    lobby.gameState.teamStates.forEach((team) => {
        team.log.push({type: "bid", value: value.toString(), origin: player.account} as GameLogEntry)
    })
    io.to(lobbyID).emit("player-made-bid", id, value.toString())
}

export function handleSubmitClueRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string, value: string): void {
    console.log("*Incoming Request*\n<Submit Clue> - Socket ID", socket.id, "Player ID", id, "Lobby ID", lobbyID, "Value", value)
    if (!(lobbyID in lobbies))
        throw new Error("Lobby " + lobbyID + " doesn't exist")
    const lobby = lobbies[lobbyID].lobby
    const location : number | string = lobbies[lobbyID].locations[id]
    const player = lobby.gameSettings.teams[location as number].players.find(player => player.account.id == id)
    value = value.trim()
    let splitBySpace = value.split(" ")
    if (lobby.lobbySettings.phase != LobbyPhase.Game)
        throw new Error("Lobby " + lobbyID + " is not in the game phase")
    if (!lobby.lobbySettings.members.some(member => member.id == id))
        throw new Error("Account " + id + " is not in lobby " + lobbyID)
    if (!player)
        throw new Error("Player " + id + " is not in team specified " + location)
    if (location == "lounge")
        throw new Error("Player submitted clue from lounge")
    if (player.role != GameRole.Captain)
        throw new Error("Non-captain player submitted clue")
    if (value.length == 0)
        throw new Error("Player submitted empty clue")
    if (value.length > 64)
        throw new Error("Player submitted clue that was too long")
    if (splitBySpace.length == 0)
        throw new Error("Player submitted empty clue")
    console.log("before filtering", splitBySpace)
    splitBySpace = splitBySpace.filter((word) => !lobby.gameState.teamStates[location as number].cluesGiven.includes(word) && word != "")
    console.log("after filtering", splitBySpace)
    if (splitBySpace.length + lobby.gameState.teamStates[location as number].cluesGiven.length > lobby.gameState.teamStates[location as number].currentBid)
        throw new Error("Player submitted too many clues")
    lobby.gameState.teamStates[location as number].log.push({type: "clue", value: value, origin: player.account} as GameLogEntry)
    lobby.gameState.teamStates[location as number].cluesGiven.push(...splitBySpace)
    console.log("clues given", lobby.gameState.teamStates[location as number].cluesGiven)
    io.to(lobbyID + "-team" + location).emit("player-gave-clue", id, value)
    io.to(lobbyID).emit("player-gave-clue-social", id)
}

export function handleSubmitGuessRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string, value: string): void {
    console.log("*Incoming Request*\n<Submit Guess> - Socket ID", socket.id, "Player ID", id, "Lobby ID", lobbyID, "Value", value)
    if (!(lobbyID in lobbies))
        throw new Error("Lobby " + lobbyID + " doesn't exist")
    const lobby = lobbies[lobbyID].lobby
    const location : number | string = lobbies[lobbyID].locations[id]
    const player = lobby.gameSettings.teams[location as number].players.find(player => player.account.id == id)
    if (lobby.lobbySettings.phase != LobbyPhase.Game)
        throw new Error("Lobby " + lobbyID + " is not in the game phase")
    if (!lobby.lobbySettings.members.some(member => member.id == id))
        throw new Error("Account " + id + " is not in lobby " + lobbyID)
    if (!player)
        throw new Error("Player " + id + " is not in team specified " + location)
    if (location == "lounge")
        throw new Error("Player submitted guess from lounge")
    if (player.role != GameRole.Crew)
        throw new Error("Non-crew player submitted clue")
    if (value.length > 32)
        throw new Error("Player submitted guess that was too long")

    if (!lobby.gameState.teamStates[location as number].wordsGuessed.some((word) => word == value.toUpperCase())) { //word hasn't already been guessed
        const wordIndex = lobby.gameState.words.findIndex(word => word.word.toUpperCase() === value.toUpperCase())
        if (wordIndex != -1) {
            io.to(lobbyID).emit("player-gave-guess-hit-social", id)
            lobby.gameState.teamStates[location as number].wordsGuessed.push(value.toUpperCase())
        } else 
            io.to(lobbyID).emit("player-gave-guess-miss-social", id)
        lobby.gameState.teamStates[location as number].log.push({type: wordIndex != -1 ? "hit" : "miss", value: value, origin: player.account} as GameLogEntry)
        io.to(lobbyID + "-team" + location).emit("player-gave-guess", id, value, wordIndex, wordIndex != -1)
    }
}

