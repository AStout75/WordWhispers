import { Account } from "./account-types"

export interface Word {
    word: string,
    visibility: WordVisibility
}

export enum WordVisibility {
    Hidden = "hidden", Blanks = "blanks", Visible = "visible"
}

export enum WordPack {
    Classic = "classic"
}

export enum GameRole {
    Captain = "captain", Crew = "crew"
}

export enum GamePhase {
    Bid = "bid", Guess = "guess", End = "end"
}

export interface GameReadyStatus {
    readyState: boolean,
    readyMessage: string | null
}

export enum GameLogEntryType {
    Miss = "miss", Hit = "hit", Clue = "clue", Update = "update"
}

export interface GameLogEntry {
    value: string,
    type: GameLogEntryType
    origin: Account
}

export interface TeamState {
    currentBid: number,
    cluesGiven: string[],
    wordsGuessed: string[],
    log: GameLogEntry[]
}

export interface GameState {
    phase: GamePhase
    words: Word [],
    timer: number,
    teamStates: TeamState[]
}









