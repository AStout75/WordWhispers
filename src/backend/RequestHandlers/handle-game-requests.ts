import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../shared-types/socket-types";
import { Account } from "../../shared-types/account-types";
import lobbies from "../Store/lobbies";

export function handleMakeBidRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string, value: number): void {
    console.log("Bid submitted by", id, "of", value);
    let lobby = lobbies[lobbyID].lobby; //Verify the lobby ID exists
    if (lobby == undefined) {
        throw new Error('Lobby with specified ID doesnt exist:' + lobbyID);
    }
    if (value < 1) {
        throw new Error('Bid made was less than 1');
    }
    const location : number | string = lobbies[lobby.lobbySettings.id].locations[id];
    if (location == "lounge") {
        throw new Error("Player submitted clue from lounge" + lobbyID + " player id " + id);
    }
    io.to(lobbyID).emit("player-made-bid", id, value);
}

export function handleSubmitClueRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string, value: string): void {
    console.log("Clue submitted by", id, "with value", value);
    let lobby = lobbies[lobbyID].lobby; //Verify the lobby ID exists
    if (lobby == undefined) {
        throw new Error('Lobby with specified ID doesnt exist:' + lobbyID);
    }
    const location : number | string = lobbies[lobby.lobbySettings.id].locations[id];
    if (location == "lounge") {
        throw new Error("Player submitted clue from lounge" + lobbyID + " player id " + id);
    }
    io.to(lobbyID + "-team" + location).emit("player-gave-clue", id, value);
    io.to(lobbyID).emit("player-gave-clue-social", id);
}

export function handleSubmitGuessRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string, value: string): void {
    console.log("Guess submitted by", id, "with value", value);
    let lobby = lobbies[lobbyID].lobby; //Verify the lobby ID exists
    if (lobby == undefined) {
        throw new Error('Lobby with specified ID doesnt exist:' + lobbyID);
    }
    const location : number | string = lobbies[lobby.lobbySettings.id].locations[id];
    console.log(lobbies[lobby.lobbySettings.id].locations);
    if (location == "lounge") {
        throw new Error("Player submitted guess from lounge" + lobbyID + " player id " + id);
    }
    var hit = false;
    var wordIndex = -1;
    for (var i = 0; i < lobbies[lobbyID].lobby.gameState.words.length; i++) {
        console.log(lobbies[lobbyID].lobby.gameState.words[i].word, value);
        if (value.toUpperCase() == lobbies[lobbyID].lobby.gameState.words[i].word) {
            hit = true;
            wordIndex = i;
            break;
        }
    }
    console.log(lobbyID + "-team" + location);
    io.to(lobbyID + "-team" + location).emit("player-gave-guess", id, value, wordIndex, hit);
    if (hit) {io.to(lobbyID).emit("player-gave-guess-hit-social", id)}
    else {io.to(lobbyID).emit("player-gave-guess-miss-social", id)};
    

}

