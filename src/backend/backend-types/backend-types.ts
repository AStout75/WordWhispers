import { Lobby } from "../../shared-types/lobby-types";

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}

export interface LobbyStore {
  lobby: Lobby;
  locations: {
    [playerID: string] : number | string}
}