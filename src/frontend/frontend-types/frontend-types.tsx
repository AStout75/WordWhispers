import { Socket } from "socket.io";
import { Lobby } from "../../shared-types/lobby-types";
import { QueueType } from "../../shared-types/misc-types";

export interface SocketProps {
    socket: Socket;
}

export enum PageType {
    Index = "index", Lobbies = "lobbies", Lobby = "lobby", Queue = "queue", Game = "game"
}

export interface SetAppPageProps {
    setPageState: Function;
}

export interface PageProps extends SetAppPageProps{
    page: PageType;
}

export interface QueuePageProps extends SetAppPageProps {
    defaultQueueType: QueueType
}

export interface LobbyPageProps extends SetAppPageProps {
    
}

export interface LobbyEnteredAction {
    payload: {
        lobby: Lobby;
    }
}