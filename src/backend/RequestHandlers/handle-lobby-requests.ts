import { Server, Socket } from "socket.io";
import { Account } from "../../shared-types/account-types";
import { GameLogEntry, GamePhase, GameRole, GameState, TeamState, Word, WordVisibility } from "../../shared-types/game-types";
import { defaultGameState, defaultLobby, defaultPlayer, GameSettings, Lobby, LobbyPhase, Lounge, Player, PlayerSpeechAction, Team } from "../../shared-types/lobby-types";
import { ClientToServerEvents, ServerToClientEvents } from "../../shared-types/socket-types";
import { LobbyStore } from "../backend-types/backend-types";
import lobbies, { wordBank } from "../Store/lobbies";
import { connected } from "process";
import e from "express";

const MAX_LOBBIES = 900;
const MAX_PLAYERS_PER_LOBBY:number = 16;
const DEFAULT_BID:number = 25;
const DEFAULT_BID_TIME:number = 10000;
const DEFAULT_GUESS_TIME:number = 120000;

export function handleViewLobbiesRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>): void {
    console.log("*Incoming Request*\n<View Lobbies> - Socket ID", socket.id);
    const lobbiesArray = [] as Lobby[];
    Object.values(lobbies).forEach((lobbyStore : LobbyStore) => {
        lobbiesArray.push(lobbyStore.lobby);
    });
    socket.emit('lobbies', lobbiesArray);
}

export function handleCreateLobbyRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, account: Account): void {
    console.log("*Incoming Request*\n<Create Lobby> - Socket ID", socket.id, "Account ID", account)
    if (Object.keys(lobbies).length == MAX_LOBBIES) 
        throw new Error('Lobby count exceeded maximum')
    if (Object.keys(lobbies).some(lobbyID => lobbies[lobbyID].lobby.lobbySettings.members.some(member => member.id == account.id)))
        throw new Error("Account " + account.id + " is already in a lobby")
    
    let lobby:Lobby = JSON.parse(JSON.stringify(defaultLobby))
    lobby.lobbySettings.id = Date.now().toString().slice(7, 11)
    while (lobby.lobbySettings.id in lobbies) 
        lobby.lobbySettings.id = Date.now().toString().slice(7, 11)
    lobby.lobbySettings.owner = account
    lobbies[lobby.lobbySettings.id] = {lobby: lobby, locations: {}}
    addAccountToLobbyAndReturnNewPlayer(io, socket, account, lobby) //ignore return
    socket.join(lobby.lobbySettings.id)
    socket.emit('create-lobby-success', lobby)
}

export function handleJoinLobbyRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, account:Account, lobbyID: string): void {
    console.log("*Incoming Request*\n<Join Lobby> - Socket ID", socket.id, "Account ID", account, "Lobby ID", lobbyID)
    if (!(lobbyID in lobbies))
        throw new Error("Lobby " + lobbyID + " doesn't exist")
    const lobby = lobbies[lobbyID].lobby
    if (Object.keys(lobbies).some(lobbyID => lobbies[lobbyID].lobby.lobbySettings.members.some(member => member.id == account.id)))
        throw new Error("Account " + account.id + " is already in a lobby")
    if (lobby.lobbySettings.members.length == MAX_PLAYERS_PER_LOBBY)
        throw new Error("Lobby" + lobbyID + " is full")
    
    const createdPlayer = addAccountToLobbyAndReturnNewPlayer(io, socket, account, lobby)
    io.to(lobbyID).except(socket.id).emit('player-joined-lobby', createdPlayer)
    socket.emit('join-lobby-success', lobby)
    socket.join(lobbyID)
}

export function handleLeaveLobbyRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string): void {
    console.log("*Incoming Request*\n<Leave Lobby> - Socket ID", socket.id, "Account ID", id, "Lobby ID", lobbyID)
    if (!(lobbyID in lobbies))
        throw new Error("Lobby " + lobbyID + " doesn't exist")
    const lobby = lobbies[lobbyID].lobby
    if (!lobby.lobbySettings.members.find(member => member.id == id))
        throw new Error("Account " + id + " is not in lobby " + lobbyID)
    
    removeAccountFromLobby(socket, id, lobby)
    socket.rooms.forEach((room) => {
        socket.leave(room)
    })
    socket.emit('leave-lobby-success')
    io.to(lobbyID).except(socket.id).emit('player-left-lobby', id)
    if (lobby.lobbySettings.members.length == 0) 
        delete lobbies[lobbyID]
}

export function handleChangeLocationRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string, location: string | number): void {
    console.log("*Incoming Request*\n<Change Location> - Socket ID", socket.id, "Account ID", id, "Lobby ID", lobbyID, "Location", location)
    if (!(lobbyID in lobbies))
        throw new Error("Lobby " + lobbyID + " doesn't exist")
    const lobby = lobbies[lobbyID].lobby
    if (!lobby.lobbySettings.members.find(member => member.id == id))
        throw new Error("Account " + id + " is not in lobby " + lobbyID)
    if (lobby.lobbySettings.phase != LobbyPhase.Waiting)
        throw new Error("Lobby " + lobbyID + " is not in the waiting phase")

    const player = removeAccountFromLobbyLocation(socket, id, lobby)
    addPlayerToLocation(socket, lobby, player, location)
    io.to(lobbyID).emit('player-changed-location', id, location)


}

export function handleChangeRoleRequest(io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string, role: GameRole): void {
    console.log("*Incoming Request*\n<Change Role> - Socket ID", socket.id, "Account ID", id, "Lobby ID", lobbyID, "Role", role)
    if (!(lobbyID in lobbies))
        throw new Error("Lobby " + lobbyID + " doesn't exist")
    const lobby = lobbies[lobbyID].lobby
    const location = lobbies[lobbyID].locations[id]
    if (!lobby.lobbySettings.members.find(member => member.id == id))
        throw new Error("Account " + id + " is not in lobby " + lobbyID)
    if (lobby.lobbySettings.phase != LobbyPhase.Waiting)
        throw new Error("Lobby " + lobbyID + " is not in the waiting phase")
    
    let player
    if (location == "lounge")
        player = lobby.gameSettings.lounge.players.find(player => player.account.id == id)
    else
        player = lobby.gameSettings.teams[location as number].players.find(player => player.account.id == id)
    if (!player)
        throw new Error("Account " + id + " is not in the expected location - " + location)
    player.role = role
    io.to(lobbyID).emit('player-changed-role', id, role)
}

export function handleChangeReadyRequest(io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string): void {
    console.log("*Incoming Request*\n<Change Ready> - Socket ID", socket.id, "Account ID", id, "Lobby ID", lobbyID)
    if (!(lobbyID in lobbies))
        throw new Error("Lobby " + lobbyID + " doesn't exist")
    const lobby = lobbies[lobbyID].lobby
    const location = lobbies[lobbyID].locations[id]
    if (!lobby.lobbySettings.members.find(member => member.id == id))
        throw new Error("Account " + id + " is not in lobby " + lobbyID)
    if (lobby.lobbySettings.phase != LobbyPhase.Waiting)
        throw new Error("Lobby " + lobbyID + " is not in the waiting phase")

    let player
    if (location == "lounge")
        player = lobby.gameSettings.lounge.players.find(player => player.account.id == id)
    else
        player = lobby.gameSettings.teams[location as number].players.find(player => player.account.id == id)
    if (!player)
        throw new Error("Account " + id + " is not in the expected location - " + location)
    player.ready = !player.ready
    io.to(lobbyID).emit('player-changed-ready', id)
}

export function handleAddTeamRequest(io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string): void {
    console.log("*Incoming Request*\n<Add team> - Socket ID", socket.id, "Account ID", id, "Lobby ID", lobbyID)
    if (!(lobbyID in lobbies))
        throw new Error("Lobby " + lobbyID + " doesn't exist")
    const lobby = lobbies[lobbyID].lobby
    if (!lobby.lobbySettings.members.find(member => member.id == id))
        throw new Error("Account " + id + " is not in lobby " + lobbyID)
    if (lobby.lobbySettings.phase != LobbyPhase.Waiting)
        throw new Error("Lobby " + lobbyID + " is not in the waiting phase")
    if (lobby.gameSettings.teams.find(team => team.players.length == 0))
        throw new Error("Lobby " + lobbyID + " already has an empty team")
    
    let team = {players: [], score: 0} as Team
    lobby.gameSettings.teams.push(team)
    io.to(lobbyID).emit('team-added')
}

export function handleDeleteTeamRequest(io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string, index: number): void {
    console.log("*Incoming Request*\n<Delete team> - Socket ID", socket.id, "Account ID", id, "Lobby ID", lobbyID, "Team index", index)
    if (!(lobbyID in lobbies))
        throw new Error("Lobby " + lobbyID + " doesn't exist")
    const lobby = lobbies[lobbyID].lobby
    if (!lobby.lobbySettings.members.find(member => member.id == id))
        throw new Error("Account " + id + " is not in lobby " + lobbyID)
    if (lobby.lobbySettings.phase != LobbyPhase.Waiting)
        throw new Error("Lobby " + lobbyID + " is not in the waiting phase")
    if (lobby.gameSettings.teams[index].players.length > 0)
        throw new Error("Team " + index + " is not empty")

    lobby.gameSettings.teams.splice(index, 1)
    for (let i = index; i < lobby.gameSettings.teams.length; i++) {
        lobby.gameSettings.teams[i].players.forEach(player => {
            (lobbies[lobbyID].locations[player.account.id] as number) -= 1
        })
    }
    io.to(lobbyID).emit('team-deleted', index)
}

export function handleStartGameRequest(io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string) {
    console.log("*Incoming Request*\n<Add team> - Socket ID", socket.id, "Account ID", id, "Lobby ID", lobbyID)
    if (!(lobbyID in lobbies))
        throw new Error("Lobby " + lobbyID + " doesn't exist")
    const lobby = lobbies[lobbyID].lobby
    const connectedSocketIDs = io.sockets.adapter.rooms.get(lobbyID)
    if (!lobby.lobbySettings.members.find(member => member.id == id))
        throw new Error("Account " + id + " is not in lobby " + lobbyID)
    if (lobby.lobbySettings.phase != LobbyPhase.Waiting)
        throw new Error("Lobby " + lobbyID + " is not in the waiting phase")
    if (!connectedSocketIDs)
        throw new Error("Couldn't get connected sockets for " + lobbyID)
    //Add logic here to check if all players are ready, all teams are valid, etc.
    
    const visibleGameState = generateNewGame(lobby.gameSettings)
    lobby.gameState = visibleGameState
    lobby.lobbySettings.phase = LobbyPhase.Game
    const hiddenGameState : GameState = JSON.parse(JSON.stringify(visibleGameState))
    hiddenGameState.words = hiddenGameState.words.map(() => {return {word: "???"} as Word})

    const connectedSockets = Array.from(connectedSocketIDs).map(id => io.sockets.sockets.get(id))
    lobby.gameSettings.teams.forEach((team, index) => {
        team.players.forEach((player) => {
            const socket = connectedSockets.find(socket => socket?.id === player.account.socketID)
            if (!socket)
                throw new Error("No connected socket found for player " + player.account.id)
            socket.join(lobbyID + "-team" + index)
            if (player.role === GameRole.Captain)
                socket.join(lobbyID + "-visible")
            else
                socket.join(lobbyID + "-hidden")
        })
    })
    
    io.to(lobbyID + "-visible").emit('game-started', visibleGameState)
    io.to(lobbyID + "-hidden").emit('game-started', hiddenGameState)
    setTimeout(() => {setGamePhase(io, lobby, GamePhase.Guess)}, DEFAULT_BID_TIME)
}

export function handleDisconnect(io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, reason: string) {
    console.log("*Incoming Request*\n<Disconnect> - Socket ID", socket.id, "Reason", reason)
    const lobbyID = Object.keys(lobbies).find(lobbyID => lobbies[lobbyID].lobby.lobbySettings.members.find(member => member.socketID === socket.id))
    if (lobbyID) {
        const lobby = lobbies[lobbyID].lobby
        const member = lobby.lobbySettings.members.find((member) => member.socketID === socket.id) as Account
        console.log("Disconnected player was in lobby", lobbyID, "with account", member.id)
        removeAccountFromLobby(socket, member.id, lobby)
        io.to(lobbyID).emit('player-left-lobby', member.id)
        if (lobby.lobbySettings.members.length === 0) 
            delete lobbies[lobby.lobbySettings.id]
    }
}

// --- UTILS ---

function setGamePhase(io: Server, lobby: Lobby, phase: GamePhase) {
    if (!(lobby.lobbySettings.id in lobbies))
        throw new Error("Lobby " + lobby.lobbySettings.id + " doesn't exist")
    lobby.gameState.phase = phase
    if (phase == GamePhase.Guess) {
        io.to(lobby.lobbySettings.id).emit('guessing-started')
        lobby.gameState.timer = Date.now() + lobby.gameSettings.guessTime * 1000
        setTimeout(() => {setGamePhase(io, lobby, GamePhase.End)}, lobby.gameSettings.guessTime * 1000)
    }
    else if (phase == GamePhase.End)
        endGame(io, lobby)
}

function endGame(io: Server, lobby: Lobby) {
    const connectedSocketIDs = io.sockets.adapter.rooms.get(lobby.lobbySettings.id)
    if (!connectedSocketIDs)
        throw new Error("Couldn't get connected sockets for " + lobby.lobbySettings.id)

    lobby.gameSettings.teams.forEach((team, index) => { //Scoring
        let totalPoints = 0
        const won = lobby.gameState.teamStates[index].wordsGuessed.length == lobby.gameSettings.wordCount
        if (won) {
            totalPoints += 3 * (25 - lobby.gameState.teamStates[index].currentBid) //If bid under 25, 3 points for each underbid
            totalPoints += lobby.gameState.teamStates[index].currentBid - lobby.gameState.teamStates[index].cluesGiven.length //1 for each un used clue
        }
        totalPoints += lobby.gameState.teamStates[index].wordsGuessed.length * 2 //1 for each word guessed
        team.score += totalPoints
        team.players.forEach((player) => {
            player.score += totalPoints
            player.ready = false
            player.lastAction = {action: PlayerSpeechAction.None, time: ""}
            io.to(lobby.lobbySettings.id).emit("player-changed-score", player.account.id, player.score)
            io.to(lobby.lobbySettings.id).emit("player-changed-ready", player.account.id)
        })
    })
    const connectedSockets = Array.from(connectedSocketIDs).map(id => io.sockets.sockets.get(id))
    connectedSockets.forEach(socket => {
        if (socket) {
            socket.rooms.forEach(room => {
                if (room != lobby.lobbySettings.id) {
                    socket.leave(room)
                }
            })
        }
    })
    
    lobby.gameState.phase = GamePhase.End
    lobby.lobbySettings.phase = LobbyPhase.Waiting
    io.to(lobby.lobbySettings.id).emit('game-ended', lobby.gameState, lobby.gameSettings.teams)
}

function addAccountToLobbyAndReturnNewPlayer(io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, account: Account, lobby: Lobby):Player {
    lobby.lobbySettings.members.push(account)
    const newPlayer: Player = {...defaultPlayer, account: account}
    addPlayerToLounge(socket, lobby, newPlayer)
    return newPlayer
}

function addPlayerToLocation(socket: Socket<ClientToServerEvents, ServerToClientEvents>, lobby: Lobby, player: Player, location: number | string) {
    if (location == "lounge")
        return addPlayerToLounge(socket, lobby, player)
    if (location as number >= lobby.gameSettings.teams.length)
        throw new Error('Couldn\'t add player to team ' + (location as number + 1) + ' its out of bounds')
    addPlayerToTeamIndex(socket, lobby, player, location as number)
}

function addPlayerToLounge(socket: Socket<ClientToServerEvents, ServerToClientEvents>, lobby: Lobby, player: Player) {
    lobbies[lobby.lobbySettings.id].locations[player.account.id] = "lounge"
    lobby.gameSettings.lounge.players.push(player)
}

function addPlayerToTeamIndex(socket: Socket<ClientToServerEvents, ServerToClientEvents>, lobby: Lobby, player: Player, index: number) {
    lobby.gameSettings.teams[index].players.push(player)
    lobbies[lobby.lobbySettings.id].locations[player.account.id] = index
}

function removeAccountFromLobby(socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobby: Lobby) {
    removeAccountFromLobbyMembers(id, lobby)
    removeAccountFromLobbyLocation(socket, id, lobby)
}

function removeAccountFromLobbyMembers(id: string, lobby: Lobby) {
    const index = lobby.lobbySettings.members.findIndex(member => member.id == id)
    if (index == -1) 
        throw new Error('Player is not in this lobby:' + lobby.lobbySettings.id)
    lobby.lobbySettings.members.splice(index, 1)   
}

function removeAccountFromLobbyLocation(socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobby: Lobby):Player {
    const location : number | string = lobbies[lobby.lobbySettings.id].locations[id]
    let foundAccount
    if (location == "lounge")
        foundAccount = removeAccountFromLobbyLounge(socket, id, lobby)
    else
        foundAccount = removeAccountFromLobbyTeam(socket, id, lobby, location as number)
    delete lobbies[lobby.lobbySettings.id].locations[id]
    return foundAccount
}

function removeAccountFromLobbyLounge(socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobby: Lobby): Player {
    let lounge: Lounge = lobby.gameSettings.lounge
    const index = lounge.players.findIndex(player => player.account.id === id)
    if (index == -1)
        throw new Error('Couldn\'t remove account from lounge - account not found')
    return lounge.players.splice(index, 1)[0]
    
}

function removeAccountFromLobbyTeam(socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobby: Lobby, teamIndex: number):Player {
    let team : Team = lobby.gameSettings.teams[teamIndex];
    const index = team.players.findIndex(player => player.account.id === id)
    if (index == -1)
        throw new Error('Couldn\'t remove account from team ' + teamIndex + ' - account not found')
    return team.players.splice(index, 1)[0]
}

// --- GAME UTILS ---

function generateNewGame(settings: GameSettings): GameState {
    let state = JSON.parse(JSON.stringify(defaultLobby.gameState)) as GameState
    state.phase = GamePhase.Bid
    state.timer = Date.now() + DEFAULT_BID_TIME
    for (let i = 0; i < settings.wordCount; i++) { //Generate words
        let newWord = wordBank[Math.floor(Math.random() * wordBank.length)]
        while (state.words.find(includedWord => includedWord.word == newWord))
            newWord = wordBank[Math.floor(Math.random() * wordBank.length)]
        state.words.push({word: newWord, visibility: WordVisibility.Hidden})
    }
    state.teamStates = settings.teams.map(_ => { //Generate team states
        return {
            currentBid: DEFAULT_BID,
            cluesGiven: [] as string[],
            wordsGuessed: [] as string[],
            log: [] as GameLogEntry[]
        } as TeamState
    })
    return state
}