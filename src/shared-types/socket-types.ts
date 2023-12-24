import { Account } from "./account-types";
import { GameRole, GameState, TeamState } from "./game-types";
import { GameSettings, Lobby, Player, Team } from "./lobby-types";

export interface ServerToClientEvents {
    
    //Lobbies. Respond only to sender
    "lobbies": (lobbies: Lobby[]) => void;
    "create-lobby-success": (lobby: Lobby) => void;
    "join-lobby-success": (lobby: Lobby) => void;
    "leave-lobby-success": () => void;

    //To entire lobby
    "player-joined-lobby": (player: Player) => void; //Send entire player to initialize
    "player-left-lobby": (id: string) => void;

    "player-changed-location": (id: string, location: number | string) => void;
    "player-changed-role": (id: string, role: GameRole) => void;
    "player-changed-ready": (id: string) => void;
    "player-changed-score": (id: string, score: number) => void;
    "team-added": () => void;
    "team-deleted": (index: number) => void;

    "game-started": (game: GameState) => void;
    "guessing-started": () => void;
    "game-ended": (game: GameState, teams: Team []) => void;

    "player-made-bid": (id: string, value: number) => void;
    "player-gave-clue": (id: string, value: string) => void;
    "player-gave-guess": (id: string, value: string, wordIndex: number, hit: true) => void;

    //Socials - send a (non-detailed) ping to the entire lobby for the social tab to light up upon this action
    "player-gave-clue-social": (id: string) => void;
    "player-gave-guess-hit-social": (id: string) => void;
    "player-gave-guess-miss-social": (id: string) => void;

    //Failures. Respond only to sender
    "create-lobby-failed": (message: string) => void;
    "join-lobby-failed": (message: string) => void;
    "leave-lobby-failed": (message: string) => void;
    "change-location-failed": (message: string) => void;
    "change-role-failed": (message: string) => void;
    "change-ready-failed": (message: string) => void;
    "start-game-failed": (message: string) => void;
    "add-team-failed": (message: string) => void;
    "delete-team-failed": (message: string) => void;
    "player-made-bid-failed": (message: string) => void;
    "player-gave-clue-failed": (message: string) => void;
    "player-gave-guess-failed": (message: string) => void;


    }
    
export interface ClientToServerEvents {

    //Lobbies
    "view-lobbies": () => void;
    "create-lobby": (account: Account) => void; //Need whole acc at entry point to get username
    
    "join-lobby": (account: Account, lobbyID: string) => void; //Need whole acc to get username
    "leave-lobby": (id: string, lobbyID: string) => void;
    "start-game": (id: string, lobbyID: string) => void;
    
    //Player status
    "change-location": (id: string, lobbyID: string, newLocation: number | string) => void;
    "change-role": (id: string, lobbyID: string, role: GameRole) => void;
    "change-ready": (id: string, lobbyID: string) => void;
    "add-team": (id: string, lobbyID: string) => void;
    "delete-team": (id: string, lobbyID: string, index: number) => void;

    //game

    //Queue
    "join-queue-casual": () => void;
    "join-queue-ranked": () => void;
    "leave-queue": () => void;

    //Spectate
    "spectate-random": () => void;
    "spectate-ranked": () => void;

    //Game
    "submit-bid": (id: string, lobbyID: string, bid: number) => void;
    "submit-guess": (id: string, lobbyID: string, guess: string) => void;
    "submit-clue": (id: string, lobbyID: string, clue: string) => void;
  }

