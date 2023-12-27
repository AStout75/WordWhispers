import { Socket } from "socket.io-client";
import { Account } from "../../shared-types/account-types";
import { GameRole } from "../../shared-types/game-types";
import { Player } from "../../shared-types/lobby-types";
import { ServerToClientEvents, ClientToServerEvents } from "../../shared-types/socket-types";
import lobbySlice from "../Store/Reducers/lobbySlice";

export function sendViewLobbiesRequest (socket: Socket<ServerToClientEvents, ClientToServerEvents>): void {
    console.log("Requesting to view lobbies.");
    socket.emit('view-lobbies');
}

export function sendCreateLobbyRequest (socket: Socket<ServerToClientEvents, ClientToServerEvents>, account: Account): void {
    console.log("Sent create lobby request w/", account.id);
    socket.emit('create-lobby', account);
}

export function sendJoinLobbyRequest (socket: Socket<ServerToClientEvents, ClientToServerEvents>, account:Account, lobbyID: string): void {
    console.log("Sent join lobby request w/ lobbyID", lobbyID);
    socket.emit('join-lobby', account, lobbyID);
}

export function sendLeaveLobbyRequest (socket: Socket<ServerToClientEvents, ClientToServerEvents>, id: string, lobbyID: string): void {
    console.log("Sent leave lobby request w/ lobbyID", lobbyID);
    socket.emit('leave-lobby', id, lobbyID);
}

export function sendChangeLocationRequest (socket: Socket<ServerToClientEvents, ClientToServerEvents>, id: string, lobbyID: string, newLocation: number | string): void {
    console.log("Sent change location request w/ newLocation", newLocation);
    socket.emit('change-location', id, lobbyID, newLocation);
}

export function sendAddTeamRequest (socket: Socket<ServerToClientEvents, ClientToServerEvents>, id: string, lobbyID: string): void {
    console.log("Sent add team request");
    socket.emit('add-team', id, lobbyID);
}

export function sendDeleteTeamRequest (socket: Socket<ServerToClientEvents, ClientToServerEvents>, id: string, lobbyID: string, index: number): void {
    console.log("Sent delete team request");
    socket.emit('delete-team', id, lobbyID, index);
}

export function sendChangeRoleRequest (socket: Socket<ServerToClientEvents, ClientToServerEvents>, id: string, lobbyID: string, role: GameRole): void {
    console.log("Sent change role request w/ role", role);
    socket.emit('change-role', id, lobbyID, role);
}

export function sendChangeReadyRequest (socket: Socket<ServerToClientEvents, ClientToServerEvents>, id: string, lobbyID: string, ready: boolean): void {
    console.log("Sent change ready request w/ ready", ready);
    socket.emit('change-ready', id, lobbyID);
}

export function sendStartGameRequest(socket: Socket<ServerToClientEvents, ClientToServerEvents>, id: string, lobbyID: string): void {
    console.log("Sent start game request for lobby", lobbyID);
    socket.emit('start-game', id, lobbyID);
}

export function sendJoinQueueCasualRequest (socket: Socket<ServerToClientEvents, ClientToServerEvents>): void {
    console.log("Sent join casual queue request");
    socket.emit('join-queue-casual');
}

export function sendJoinQueueRankedRequest (socket: Socket<ServerToClientEvents, ClientToServerEvents>): void {
    console.log("Sent join ranked queue request");
    socket.emit('join-queue-ranked');
}

export function sendLeaveQueueRequest (socket: Socket<ServerToClientEvents, ClientToServerEvents>): void {
    console.log("Sent leave queue request");
    socket.emit('leave-queue');
}

export function sendGiveClueRequest (socket: Socket<ServerToClientEvents, ClientToServerEvents>, id: string, lobbyID: string, value: string): void {
    console.log("Sent give clue request");
    socket.emit('submit-clue', id, lobbyID, value);
}

export function sendGiveGuessRequest (socket: Socket<ServerToClientEvents, ClientToServerEvents>, id: string, lobbyID: string, value: string): void {
    console.log("Sent give guess request");
    socket.emit('submit-guess', id, lobbyID, value);
}

export function sendMakeBidRequest (socket: Socket<ServerToClientEvents, ClientToServerEvents>, id: string, lobbyID: string, value: number): void {
    console.log("Sent make bid request");
    socket.emit('submit-bid', id, lobbyID, value);
}