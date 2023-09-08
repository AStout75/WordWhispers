import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../shared-types/socket-types";

/* Handle all client-made requests related to queues - Queueing up, leaving queues, etc. */

export function handleJoinQueueCasualRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>): void {
    console.log("join queue casual requested");
}

export function handleJoinQueueRankedRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>): void {
    console.log("join queue ranked requested");
}