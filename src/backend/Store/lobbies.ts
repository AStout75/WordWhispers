
import { Account } from "../../shared-types/account-types";
import { GameLogEntry, GameLogEntryType, GamePhase, GameReadyStatus, GameRole, GameState, TeamState, Word, WordPack, WordVisibility } from "../../shared-types/game-types";
import { defaultLobby, GameSettings, Lobby, LobbyPhase, LobbyPrivacy, LobbySettings, LobbySpectateRule, Lounge, Player, PlayerSpeechAction, Team } from "../../shared-types/lobby-types";
import { QueueType } from "../../shared-types/misc-types";
import { LobbyStore } from "../backend-types/backend-types";

//Delete later.
let account1:Account = {
    username: "Test account 1",
    id: "260sdgk32",
    socketID: "",
};

let account2:Account = {
    username: "Test account 2",
    id: "dbv464635",
    socketID: "",
};

let account3:Account = {
    username: "Test account 3",
    id: "2d999fvmd",
    socketID: "",

};

let account4:Account = {
    username: "Test account 4",
    id: "cbewetwto",
    socketID: "",
};

let account5:Account = {
    username: "I love napping",
    id: "napster22",
    socketID: "",
}

let player1:Player = {
    account: account1,
    score: 0,
    ready: true,
    role: GameRole.Captain,
    lastAction: {
        action: PlayerSpeechAction.None,
        time: ""
        }
};

let player2:Player = {
    account: account2,
    score: 0,
    ready: true,
    role: GameRole.Captain,
    lastAction: {
        action: PlayerSpeechAction.None,
        time: ""
        }
};

let player3:Player = {
    account: account3,
    score: 0,
    ready: true,
    role: GameRole.Crew,
    lastAction: {
        action: PlayerSpeechAction.None,
        time: ""
        }

};

let player4:Player = {
    account: account4,
    score: 0,
    ready: true,
    role: GameRole.Captain,
    lastAction: {
        action: PlayerSpeechAction.None,
        time: ""
        }
};

let player5:Player = {
    account: account5,
    score: 22,
    ready: true,
    role: GameRole.Crew,
    lastAction: {
        action: PlayerSpeechAction.None,
        time: ""
        }
}

let team1:Team = {
    players: [player2, player3] as Player[],
    score: 0
}

let team2:Team = {
    players: [player4] as Player[],
    score: 3
}

let lounge:Lounge = {
    players: [player5] as Player[]
}

let lobbyOneMemberNoTeams:Lobby = {
    lobbySettings: {
        id: "cbadef123",
        phase: LobbyPhase.Waiting,
        members: [account1],
        owner: account1,
        privacy: LobbyPrivacy.Public,
        type: QueueType.Casual,
        canBeSpectated: LobbySpectateRule.Private
    } as LobbySettings,
    gameSettings: {
        wordCount: 5,
        wordPack: WordPack.Classic,
        guessTime: 60,
        teams: [] as Team[],
        lounge: {players: [player1]} as Lounge,
        ready: {
            readyState: false,
            readyMessage: "Not enough players on team 1",
        } as GameReadyStatus
    } as GameSettings,
    gameState: {
        phase: GamePhase.Bid,
        words: [] as Word[],
        timer: 5,
        teamStates: [] as TeamState[]
    } as GameState
};

let lobbyThreeMembersTwoTeams:Lobby = {
    lobbySettings: {
        id: "987654123",
        phase: LobbyPhase.Waiting,
        members: [account2, account3, account4] as Account[],
        owner: account4,
        privacy: LobbyPrivacy.Public,
        type: QueueType.Casual,
        canBeSpectated: LobbySpectateRule.Public
    } as LobbySettings,
    gameSettings: {
        wordCount: 5,
        wordPack: WordPack.Classic,
        guessTime: 30,
        teams: [team1, team2] as Team[],
        lounge: lounge,
        ready: {
            readyState: false,
            readyMessage: "Not enough players on team 2",
        } as GameReadyStatus
    } as GameSettings,
    gameState: {
        phase: GamePhase.Guess,
        words: [
            {word: "MEXICO", visibility: WordVisibility.Hidden},
            {word: "WALL", visibility: WordVisibility.Hidden},
            {word: "GENIUS", visibility: WordVisibility.Hidden},
            {word: "ALPACA", visibility: WordVisibility.Hidden},
            {word: "BLANK", visibility: WordVisibility.Hidden}
        ] as Word[],
        timer: 5,
        teamStates: [] as TeamState[]
    } as GameState
}

let lobbies: {[id: string] : LobbyStore} = {}/*{
    "cbadef123": {
        lobby: lobbyOneMemberNoTeams,
        locations: {
            "260sdgk32": "lounge"
        }
    },
    "987654123": {
        lobby: lobbyThreeMembersTwoTeams,
        locations: {
            "dbv464635": 0,
            "2d999fvmd": 0,
            "cbewetwto": 1,
            "napster22": "lounge"
        }
    }
};*/

export const wordBank : string[] = require("../Assets/word-lists.json")["basic"];
export default lobbies;