import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../shared-types/socket-types";
import { Account } from "../../shared-types/account-types";
import lobbies from "../Store/lobbies";

export function handleMakeBidRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string, value: number): void {
    console.log("Bid submitted by", id, "of", value);
    let errorMessage = "Cannot make bid/";
    try {
        let lobby = lobbies[lobbyID].lobby; //Verify the lobby ID exists
        if (lobby == undefined) {
            throw new Error('Lobby with specified ID doesnt exist:' + lobbyID);
        }
        if (value < 1) {
            throw new Error('Bid made was less than 1');
        }
        const location : number | string = lobbies[lobby.lobbySettings.id].locations[id];
        if (location == "lounge") {
            throw new Error("Player submitted bid from lounge" + lobbyID + " player id " + id);
        }
        lobbies[lobbyID].lobby.gameState.teamStates[location as number].currentBid = value;
        io.to(lobbyID).emit("player-made-bid", id, value);
    } catch (e: unknown) {
        if (typeof e === "string") {
            errorMessage += e.toUpperCase() // works, `e` narrowed to string
        } else if (e instanceof Error) {
            errorMessage += e.message // works, `e` narrowed to Error
        }
        socket.emit('player-made-bid-failed', errorMessage);
    }
    
}

export function handleSubmitClueRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string, value: string): void {
    console.log("Clue submitted by", id, "with value", value);
    let errorMessage = "Cannot give clue/";
    try {
        let lobby = lobbies[lobbyID].lobby; //Verify the lobby ID exists
        if (lobby == undefined) {
            throw new Error('Lobby with specified ID doesnt exist:' + lobbyID);
        }
        const location : number | string = lobbies[lobby.lobbySettings.id].locations[id];
        if (location == "lounge") {
            throw new Error("Player submitted clue from lounge" + lobbyID + " player id " + id);
        }
        const splitBySpace = value.split(" ");
        if (lobbies[lobbyID].lobby.gameState.teamStates[location as number].cluesGiven.length + splitBySpace.length > lobbies[lobbyID].lobby.gameState.teamStates[location as number].currentBid) {
            throw new Error("Player submitted too many clues" + lobbyID + " player id " + id);
        }
        splitBySpace.forEach((word) => {
            
            lobbies[lobbyID].lobby.gameState.teamStates[location as number].cluesGiven.push(word);
        })
        io.to(lobbyID + "-team" + location).emit("player-gave-clue", id, value);
        io.to(lobbyID).emit("player-gave-clue-social", id);
    } catch (e: unknown) {
        if (typeof e === "string") {
            errorMessage += e.toUpperCase() // works, `e` narrowed to string
        } else if (e instanceof Error) {
            errorMessage += e.message // works, `e` narrowed to Error
        }
        socket.emit('player-gave-clue-failed', errorMessage);
    }
    
}

export function handleSubmitGuessRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string, value: string): void {
    console.log("Guess submitted by", id, "with value", value);
    let errorMessage = "Cannot give guess/";
    try {
        let lobby = lobbies[lobbyID].lobby; //Verify the lobby ID exists
        if (lobby == undefined) {
            throw new Error('Lobby with specified ID doesnt exist:' + lobbyID);
        }
        const location : number | string = lobbies[lobby.lobbySettings.id].locations[id];
        if (location == "lounge") {
            throw new Error("Player submitted guess from lounge" + lobbyID + " player id " + id);
        }
        var hit = false;
        var wordIndex = -1;
        if (!lobbies[lobbyID].lobby.gameState.teamStates[location as number].wordsGuessed.some((word) => word == value.toUpperCase())) {
            for (var i = 0; i < lobbies[lobbyID].lobby.gameState.words.length; i++) {
                if (value.toUpperCase() == lobbies[lobbyID].lobby.gameState.words[i].word) {
                    hit = true;
                    wordIndex = i;
                    lobbies[lobbyID].lobby.gameState.teamStates[location as number].wordsGuessed.push(value.toUpperCase());
                    break;
                }
            }
        }
        io.to(lobbyID + "-team" + location).emit("player-gave-guess", id, value, wordIndex, hit);
        if (hit) {io.to(lobbyID).emit("player-gave-guess-hit-social", id)}
        else {io.to(lobbyID).emit("player-gave-guess-miss-social", id)};
    } catch (e: unknown) {
        if (typeof e === "string") {
            errorMessage += e.toUpperCase() // works, `e` narrowed to string
        } else if (e instanceof Error) {
            errorMessage += e.message // works, `e` narrowed to Error
        }
        socket.emit('player-gave-guess-failed', errorMessage);
    }
    
    

}

