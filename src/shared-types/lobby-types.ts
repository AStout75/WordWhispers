import { Account } from "./account-types"
import { GameLogEntry, GamePhase, GameReadyStatus, GameRole, GameState, Word, WordPack, TeamState, GameLogEntryType } from "./game-types"
import { QueueType } from "./misc-types"

export enum LobbyPhase {
    Waiting = "waiting", Game = "game"
}

export enum LobbyPrivacy {
    Private = "private", Public = "public"
}

export enum LobbySpectateRule {
    Public = "public", Friends = "friends", Private = "private"
}

export interface Team {
    players: Player[],
    score: number
}

export interface Lounge {
    players: Player[];
}

export interface Player { //a person in a lobby or game
    account: Account,
    score: number,
    ready: boolean,
    role: GameRole,
    lastAction: {
        action: PlayerSpeechAction,
        time: string //to force state refreshes in case of same action
    }
}

export enum PlayerSpeechAction {
    None = "none", ChangeWordCount = "change word count", ChangeGameTime = "change game time", ReadyUp = "ready up", MakeBid = "make bid", MakeGuessMiss = "make guess miss", MakeGuessHit = "make guess hit", GiveClue = "give clue"
}

export const defaultPlayer : Player = {
    account: {username: "", id: "", socketID: ""},
    score: 0,
    ready: false,
    role: GameRole.Crew,
    lastAction: {
        action: PlayerSpeechAction.None,
        time: ""
    }
}

export function createDefaultPlayer(account: Account) {
    let player = defaultPlayer;
    player.account = account;
    return player;
}

export interface Lobby {
    lobbySettings: LobbySettings
    gameSettings: GameSettings
    gameState: GameState
}

export interface LobbySettings {
    id: string;
    phase: LobbyPhase;
    members: Account[]
    owner: Account,
    privacy: LobbyPrivacy,
    type: QueueType,
    canBeSpectated: LobbySpectateRule
}

export interface GameSettings {
    wordCount: number,
    wordPack: WordPack,
    guessTime: number,
    teams: Team[],
    lounge: Lounge,
    ready: GameReadyStatus
}

export const defaultGameState = {
    phase: GamePhase.Bid,
    words: [] as Word[],
    timer: 30,
    teamStates: [] as TeamState[]
} as GameState

export const defaultLobby = {
    lobbySettings: {
        id: "default",
        phase: LobbyPhase.Waiting,
        members: [] as Account[],
        owner: {} as Account,
        privacy: LobbyPrivacy.Public,
        type: QueueType.Casual,
        canBeSpectated: LobbySpectateRule.Public
    } as LobbySettings,
    gameSettings: {
        wordCount: 5,
        wordPack: WordPack.Classic,
        guessTime: 120,
        teams: [] as Team[],
        lounge: {players: []} as Lounge,
        ready: {
            readyState: false,
            readyMessage: null
        } as GameReadyStatus
    } as GameSettings,
    gameState: defaultGameState
}





