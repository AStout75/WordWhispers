import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { io as ioc, type Socket as ClientSocket, Socket } from "socket.io-client";
import { Server, type Socket as ServerSocket } from "socket.io";
import { assert, should, expect } from "chai";

import { initHTTPServer, initSocketServer } from "../src/backend/Server/server";
import { Account } from "../src/shared-types/account-types"
import { Lobby } from "../src/shared-types/lobby-types"
import { ClientToServerEvents, ServerToClientEvents } from "../src/shared-types/socket-types";

function waitFor(socket: ServerSocket | ClientSocket, event: string) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

let account1 = {
    username: "Austin",
    id: "id-austin-1"
} as Account
let account2 = {
    username: "Austin",
    id: "id-austin-2"
} as Account
let account3 = {
    username: "Austin",
    id: "id-austin-3"
} as Account
let account4 = {
    username: "Austin",
    id: "id-austin-4"
} as Account
let account5 = {
    username: "Austin",
    id: "id-austin-5"
} as Account
let clientSocket1: Socket<ServerToClientEvents, ClientToServerEvents>, clientSocket2: Socket<ServerToClientEvents, ClientToServerEvents>, clientSocket3: Socket<ServerToClientEvents, ClientToServerEvents>, clientSocket4: Socket<ServerToClientEvents, ClientToServerEvents>, clientSocket5: Socket<ServerToClientEvents, ClientToServerEvents>;

describe("The 25 Words Game", () => {
  let io: Server, serverSocket: ServerSocket, clientSocket: ClientSocket;
  let httpServer;
  beforeEach((done) => {
    httpServer = initHTTPServer();
    io = initSocketServer(httpServer, true);

    clientSocket1 = ioc(`http://localhost:3000`);
    clientSocket2 = ioc(`http://localhost:3000`);
    clientSocket3 = ioc(`http://localhost:3000`);
    clientSocket4 = ioc(`http://localhost:3000`);
    clientSocket5 = ioc(`http://localhost:3000`);
    
    io.on("connection", (socket) => {
        serverSocket = socket;
    });
    clientSocket1.on("connect", done);
  });

  afterEach(() => {
    io.close();
    console.log("closing the server")
    httpServer.close()
    clientSocket1.disconnect();
    clientSocket2.disconnect();
    clientSocket3.disconnect();
    clientSocket4.disconnect();
    clientSocket5.disconnect();
  });

  describe("Creating Joining and Viewing Lobbies", () => {
    it("should create a lobby and add the creator to it", (done) => {
        clientSocket1.once("create-lobby-success", (lobby:Lobby) => {
            expect(lobby.lobbySettings.members).to.have.lengthOf(1);
            expect(lobby.lobbySettings.members[0]).to.eql(account1)
            expect(lobby.lobbySettings.owner).to.eql(account1)
            expect(lobby.gameSettings.teams).to.be.empty;
            expect(lobby.gameSettings.lounge.players).to.have.lengthOf(1);
            expect(lobby.gameSettings.lounge.players[0].account).to.eql(account1)
            done();
        })
        clientSocket1.emit("create-lobby", account1)
    })
    it("should block users in lobbies from joining or creating new ones", (done) => {
        let createFailed = false;
        let id = ""
        clientSocket1.emit("create-lobby", account1)
        clientSocket2.once("create-lobby-success", lobby => id = lobby.lobbySettings.id)
        
        clientSocket1.once("create-lobby-success", () => assert(false))
        clientSocket1.once("create-lobby-failed", () => createFailed = true)
        clientSocket1.emit("create-lobby", account1)

        clientSocket2.emit("create-lobby", account2)

        clientSocket1.once("join-lobby-success", () => assert(false))
        clientSocket1.once("join-lobby-failed", () => done())
        clientSocket1.emit("join-lobby", account1, id)
    })
    it("should block a user from joining a non existent lobby", (done) => {
        clientSocket1.once("join-lobby-failed", () => done())
        clientSocket1.emit("join-lobby", account1, "non-existent-lobby")
        clientSocket1.once("join-lobby-success", () => assert(false))
        
    })
    
  })

  describe("Complex Scenarios", () => {
    it("should have the proper game state, test 1", (done) => {
        console.log("hi2")
        clientSocket5.on("lobbies", (lobbies: Lobby[]) => {
            console.log(lobbies)
            done()
        })
        clientSocket1.once("create-lobby-success", lobby => {
            console.log("hi")
            clientSocket3.emit("join-lobby", account3, lobby.lobbySettings.id)
            clientSocket4.emit("join-lobby", account4, lobby.lobbySettings.id)
            clientSocket5.emit("view-lobbies")
            
        })
        clientSocket1.once("create-lobby-failed", msg => console.log(msg))
        
        clientSocket1.emit("create-lobby", account1)
        clientSocket2.emit("create-lobby", account2)
        
        
    })
  })
});