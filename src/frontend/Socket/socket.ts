import React from "react";
import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "../../shared-types/socket-types";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
const SocketContext = React.createContext(socket);