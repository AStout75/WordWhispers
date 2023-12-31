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
import { error } from "console";

const serverConfig = {
    PORT: process.env.PORT || 3000,
    INDEX: '/dist/views/index.html'
};

export function initHTTPServer(): Server<typeof IncomingMessage, typeof ServerResponse> {
    //Serve files
    var app = express()
    app.get('/', function(_req: any, res: any) {
        console.log("just got /")
        res.sendFile(path.join(process.cwd() + serverConfig.INDEX))
    });
    app.use(express.static(path.join(process.cwd(), 'dist')))

    let httpServer = require('http').createServer(app)
    httpServer.listen(serverConfig.PORT, () => console.log(`Listening on ${serverConfig.PORT}`))
    return httpServer
}

export function initSocketServer(server: Server<typeof IncomingMessage, typeof ServerResponse>, test: boolean): socketIO {
    const io = new socketIO<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {multiplex: !test} as Partial<ServerOptions>)
    io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
        addListenersForNewConnection(io, socket)
    })
    return io
}

export function addListenersForNewConnection(io: socketIO, socket: Socket<ClientToServerEvents, ServerToClientEvents>) {
    socket.on('view-lobbies', () => {
        try {
            handleViewLobbiesRequest(io, socket);
        } catch (e: unknown) {
            const errorMessage = "Cannot view lobbies - " + getErrorMessage(e);
            console.error(errorMessage);
            socket.emit('view-lobbies-failed', errorMessage);
        }
        
    });
    socket.on('create-lobby', (account: Account) => {
        try {
            handleCreateLobbyRequest(io, socket, account);
        } catch (e: unknown) {
            const errorMessage = "Cannot create lobby - " + getErrorMessage(e);
            console.error(errorMessage);
            socket.emit('create-lobby-failed', errorMessage);
        }
    })
    socket.on('join-lobby', (account: Account, lobbyID: string) => {
        try {
            handleJoinLobbyRequest(io, socket, account, lobbyID);
        } catch (e: unknown) {
            const errorMessage = "Cannot join lobby - " + getErrorMessage(e);
            console.error(errorMessage);
            socket.emit('join-lobby-failed', errorMessage);
        }
    });
    socket.on('leave-lobby', (id: string, lobbyID: string) => {
        try {
            handleLeaveLobbyRequest(io, socket, id, lobbyID);
        } catch (e: unknown) {
            const errorMessage = "Cannot leave lobby - " + getErrorMessage(e);
            console.error(errorMessage);
            socket.emit('leave-lobby-failed', errorMessage);
        }
    });
    socket.on('change-location', (id: string, lobbyID: string, location: string | number) => {
        try {
            handleChangeLocationRequest(io, socket, id, lobbyID, location);
        } catch (e: unknown) {
            const errorMessage = "Cannot change location - " + getErrorMessage(e);
            console.error(errorMessage);
            socket.emit('change-location-failed', errorMessage);
        }
    });
    socket.on('change-role', (id: string, lobbyID: string, role: GameRole) => {
        try {
            handleChangeRoleRequest(io, socket, id, lobbyID, role);
        } catch (e: unknown) {
            const errorMessage = "Cannot change role - " + getErrorMessage(e);
            console.error(errorMessage);
            socket.emit('change-role-failed', errorMessage);
        }
    });
    socket.on('change-ready', (id: string, lobbyID: string) => {
        try {
            handleChangeReadyRequest(io, socket, id, lobbyID);
        } catch (e: unknown) {
            const errorMessage = "Cannot change ready state - " + getErrorMessage(e);
            console.error(errorMessage);
            socket.emit('change-ready-failed', errorMessage);
        }
    });
    socket.on('add-team', (id: string, lobbyID: string) => {
        try {
            handleAddTeamRequest(io, socket, id, lobbyID);
        } catch (e: unknown) {
            const errorMessage = "Cannot add team - " + getErrorMessage(e);
            console.error(errorMessage);
            socket.emit('add-team-failed', errorMessage);
        }
    });
    socket.on('delete-team', (id: string, lobbyID: string, index: number) => {
        try {
            handleDeleteTeamRequest(io, socket, id, lobbyID, index);
        } catch (e: unknown) {
            const errorMessage = "Cannot delete team - " + getErrorMessage(e);
            console.error(errorMessage);
            socket.emit('delete-team-failed', errorMessage);
        }
    });
    socket.on('start-game', (id: string, lobbyID: string) => {
        try {
            handleStartGameRequest(io, socket, id, lobbyID);
        } catch (e: unknown) {
            const errorMessage = "Cannot start game - " + getErrorMessage(e);
            console.error(errorMessage);
            socket.emit('start-game-failed', errorMessage);
        }
    });
    
    /*
    socket.on('join-queue-casual', () => {
        try {
            handleJoinQueueCasualRequest(io, socket);
        } catch (e: unknown) {
            const errorMessage = getErrorMessage(e);
            console.error(errorMessage);
            socket.emit('create-lobby-failed', errorMessage);
        }
    });
    socket.on('join-queue-ranked', () => {
        try {
            handleJoinQueueRankedRequest(io, socket);
        } catch (e: unknown) {
            const errorMessage = getErrorMessage(e);
            console.error(errorMessage);
            socket.emit('create-lobby-failed', errorMessage);
        }
    }); */
    socket.on('submit-bid', (id: string, lobbyID: string, bid: number) => {
        try {
            handleMakeBidRequest(io, socket, id, lobbyID, bid);
        } catch (e: unknown) {
            const errorMessage = "Cannot submit bid - " + getErrorMessage(e);
            console.error(errorMessage);
            socket.emit('player-made-bid-failed', errorMessage);
        }
    });
    socket.on('submit-clue', (id: string, lobbyID: string, value: string) => {
        try {
            handleSubmitClueRequest(io, socket, id, lobbyID, value)
        } catch (e: unknown) {
            const errorMessage = "Cannot submit clue - " + getErrorMessage(e);
            console.error(errorMessage);
            socket.emit('player-gave-clue-failed', errorMessage);
        }
    });
    socket.on('submit-guess', (id: string, lobbyID: string, value: string) => {
        try {
            handleSubmitGuessRequest(io, socket, id, lobbyID, value)
        } catch (e: unknown) {
            const errorMessage = "Cannot submit guess - " + getErrorMessage(e);
            console.error(errorMessage);
            socket.emit('player-gave-guess-failed', errorMessage);
        }
    });
    
    socket.on('disconnect', (reason: string) => {
        try {
            handleDisconnect(io, socket, reason);
        } catch (e: unknown) {
            const errorMessage = "Couldn't handle disconnect - " + getErrorMessage(e);
            console.error(errorMessage);
        }
    })
}

function getErrorMessage(e: unknown) {
    if (typeof e === "string") 
        return e.toUpperCase(); // works, `e` narrowed to string
    if (e instanceof Error)
        return e.message; // works, `e` narrowed to Error
    return "Unknown error: " + String(e);
}



