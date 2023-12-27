import { Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "./socket-types";

export interface Account { //basic unique identifier for people / accounts
    username: string;
    id: string;
    socketID: string
}

interface cookie { // to-do

}