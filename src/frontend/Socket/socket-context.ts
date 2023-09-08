import React, { useContext } from "react";
import { socket } from "./socket";

export const SocketContext = React.createContext(socket);

export const useSocketContext = () => useContext(SocketContext);