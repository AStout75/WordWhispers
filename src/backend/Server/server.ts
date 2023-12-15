import express = require("express")
import { IncomingMessage, Server, ServerResponse } from "http";
import path = require("path")
import {Server as socketIO, Socket, ServerOptions} from "socket.io";
import { Account } from "../../shared-types/account-types";
import { GameRole } from "../../shared-types/game-types";
import { ClientToServerEvents, ServerToClientEvents } from "../../shared-types/socket-types";
import { InterServerEvents, SocketData } from "../backend-types/backend-types";
import { handleAddTeamRequest, handleChangeLocationRequest, handleChangeReadyRequest, handleChangeRoleRequest, handleCreateLobbyRequest, handleDeleteTeamRequest, handleDisconnect, handleJoinLobbyRequest, handleLeaveLobbyRequest, handleStartGameRequest, handleViewLobbiesRequest } from "../RequestHandlers/handle-lobby-requests";
import { handleJoinQueueCasualRequest, handleJoinQueueRankedRequest } from "../RequestHandlers/handle-queue-requests";
import { handleMakeBidRequest, handleSubmitClueRequest, handleSubmitGuessRequest } from "../RequestHandlers/handle-game-requests";



const serverConfig = {
    PORT: process.env.PORT || 3000,
    INDEX: '/dist/views/index.html'
};

export function initHTTPServer(): Server<typeof IncomingMessage, typeof ServerResponse> {
    //Serve files
    var app = express();
    app.get('/', function(_req: any, res: any) {
        console.log("just got /");
        res.sendFile(path.join(process.cwd() + serverConfig.INDEX));
    });
    app.use(express.static(path.join(process.cwd(), 'dist')));

    let httpServer = require('http').createServer(app)
    httpServer.listen(serverConfig.PORT, () => console.log(`Listening on ${serverConfig.PORT}`))
    return httpServer;
    //app.listen(serverConfig.PORT, () => console.log(`Listening on ${serverConfig.PORT}`));
}

export function initSocketServer(server: Server<typeof IncomingMessage, typeof ServerResponse>, test: boolean): socketIO {
    const io = new socketIO<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {multiplex: !test} as Partial<ServerOptions>);
    io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
        addListenersForNewConnection(io, socket);
    });
    return io;
}

export function addListenersForNewConnection(io: socketIO, socket: Socket<ClientToServerEvents, ServerToClientEvents>) {
    socket.on('view-lobbies', () => {
        handleViewLobbiesRequest(io, socket);
    });
    socket.on('create-lobby', (account: Account) => {
        handleCreateLobbyRequest(io, socket, account);
    })
    socket.on('join-lobby', (account: Account, lobbyID: string) => {
        handleJoinLobbyRequest(io, socket, account, lobbyID);
    });
    socket.on('change-location', (id: string, lobbyID: string, location: string | number) => {
        handleChangeLocationRequest(io, socket, id, lobbyID, location);
    });
    socket.on('change-role', (id: string, lobbyID: string, role: GameRole) => {
        handleChangeRoleRequest(io, socket, id, lobbyID, role);
    });
    socket.on('change-ready', (id: string, lobbyID: string) => {
        handleChangeReadyRequest(io, socket, id, lobbyID);
    });
    socket.on('add-team', (id: string, lobbyID: string) => {
        handleAddTeamRequest(io, socket, id, lobbyID);
    });
    socket.on('delete-team', (id: string, lobbyID: string, index: number) => {
        handleDeleteTeamRequest(io, socket, id, lobbyID, index);
    });
    socket.on('start-game', (id: string, lobbyID: string) => {
        handleStartGameRequest(io, socket, id, lobbyID);
    });
    socket.on('leave-lobby', (id: string, lobbyID: string) => {
        handleLeaveLobbyRequest(io, socket, id, lobbyID);
    });
    socket.on('join-queue-casual', () => {
        handleJoinQueueCasualRequest(io, socket);
    });
    socket.on('join-queue-ranked', () => {
        handleJoinQueueRankedRequest(io, socket);
    });
    socket.on('submit-bid', (id: string, lobbyID: string, bid: number) => {
        handleMakeBidRequest(io, socket, id, lobbyID, bid);
    });
    socket.on('submit-clue', (id: string, lobbyID: string, value: string) => {
        handleSubmitClueRequest(io, socket, id, lobbyID, value)
    });
    socket.on('submit-guess', (id: string, lobbyID: string, value: string) => {
        handleSubmitGuessRequest(io, socket, id, lobbyID, value)
    });
    
    socket.on('disconnect', () => {
        handleDisconnect(io, socket);
    })
}



