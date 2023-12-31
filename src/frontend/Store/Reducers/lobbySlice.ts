import { createSlice, current, PayloadAction } from '@reduxjs/toolkit'
import { Account } from '../../../shared-types/account-types';
import { GameLogEntry, GameLogEntryType, GamePhase, GameRole, GameState, WordVisibility } from '../../../shared-types/game-types';
import { defaultLobby, defaultPlayer, GameSettings, Lobby, LobbySettings, Lounge, Player, PlayerSpeechAction, Team } from '../../../shared-types/lobby-types';

const lobbySlice = createSlice({
    name: 'lobby',
    initialState: {...defaultLobby},
    reducers: {
        resetLobby(lobby) {
            lobby.lobbySettings = JSON.parse(JSON.stringify(defaultLobby.lobbySettings));
            lobby.gameSettings = JSON.parse(JSON.stringify(defaultLobby.gameSettings));
            lobby.gameState = JSON.parse(JSON.stringify(defaultLobby.gameState));
        },
        refreshLobbySettings(lobby, action: PayloadAction<LobbySettings>) {
            lobby.lobbySettings = action.payload;
        },
        refreshGameSettings(lobby, action: PayloadAction<GameSettings>) {
            lobby.gameSettings = action.payload;
        },
        refreshGameState(lobby, action: PayloadAction<GameState>) {
            lobby.gameState = action.payload;
        },
        setGamePhase(lobby, action: PayloadAction<GamePhase>) {
            if (action.payload == GamePhase.Guess)
                lobby.gameState.timer = (lobby.gameSettings.guessTime * 1000) + Date.now()
            lobby.gameState.phase = action.payload
        },
        refreshTeams(lobby, action: PayloadAction<Team[]>) {
            lobby.gameSettings.teams = action.payload;
        },
        refreshLounge(lobby, action: PayloadAction<Lounge>) {
            lobby.gameSettings.lounge = action.payload;
        },
        addMember(lobby, action: PayloadAction<Account>) {
            lobby.lobbySettings.members = [...lobby.lobbySettings.members, action.payload];
        },
        removeMember(lobby, action: PayloadAction<Account>) {
            for (let i = 0; i < lobby.lobbySettings.members.length; i++) {
                if (lobby.lobbySettings.members[i].id == action.payload.id) {
                    lobby.lobbySettings.members.splice(i, 1);
                    return;
                }
            }
            throw new Error('Couldnt find member to be removed');
        },
        addPlayerToLounge(lobby, action: PayloadAction<Player>) {
            lobby.gameSettings.lounge.players = [...lobby.gameSettings.lounge.players, action.payload];
        },
        removePlayerFromLounge(lobby, action: PayloadAction<Player>) {
            for (let i = 0; i < lobby.gameSettings.lounge.players.length; i++) {
                if (lobby.gameSettings.lounge.players[i].account.id == action.payload.account.id) {
                    lobby.gameSettings.lounge.players.splice(i, 1);
                    return;
                }
            }
            throw new Error('Couldnt find player to be removed in lounge');
        },
        addPlayerToTeam(lobby, action: PayloadAction<{player: Player, location: number}>) {
            lobby.gameSettings.teams[action.payload.location].players = [...lobby.gameSettings.teams[action.payload.location].players, action.payload.player];
        },
        removePlayerFromTeam(lobby, action: PayloadAction<{player:Player, location: number}>) {
            for (let i = 0; i < lobby.gameSettings.teams[action.payload.location].players.length; i++) {
                if (lobby.gameSettings.teams[action.payload.location].players[i].account.id == action.payload.player.account.id) {
                    lobby.gameSettings.teams[action.payload.location].players.splice(i, 1);
                    return;
                }
            }
            throw new Error('Couldnt find player to be removed in team' + action.payload.location);
        },
        refreshPlayerRole(lobby, action: PayloadAction<{id: string, location: string | number, role: GameRole}>) {
            if (action.payload.location == "lounge") {
                for (let i = 0; i < lobby.gameSettings.lounge.players.length; i++) {
                    if (lobby.gameSettings.lounge.players[i].account.id == action.payload.id) {
                        lobby.gameSettings.lounge.players[i].role = action.payload.role;
                        return;
                    }
                }
            }
            else {
                for (let i = 0; i < lobby.gameSettings.teams[action.payload.location as number].players.length; i++) {
                    if (lobby.gameSettings.teams[action.payload.location as number].players[i].account.id == action.payload.id) {
                        lobby.gameSettings.teams[action.payload.location as number].players[i].role = action.payload.role;
                        return;
                    }
                }
            }
            throw new Error('Couldnt find player to have role changed');
        },
        togglePlayerReady(lobby, action: PayloadAction<{id: string, location: string | number}>) {
            if (action.payload.location == "lounge") {
                for (let i = 0; i < lobby.gameSettings.lounge.players.length; i++) {
                    if (lobby.gameSettings.lounge.players[i].account.id == action.payload.id) {
                        lobby.gameSettings.lounge.players[i].ready = !lobby.gameSettings.lounge.players[i].ready;
                        return;
                    }
                }
            }
            else {
                for (let i = 0; i < lobby.gameSettings.teams[action.payload.location as number].players.length; i++) {
                    if (lobby.gameSettings.teams[action.payload.location as number].players[i].account.id == action.payload.id) {
                        lobby.gameSettings.teams[action.payload.location as number].players[i].ready = !lobby.gameSettings.teams[action.payload.location as number].players[i].ready;
                        return;
                    }
                }
            }
            throw new Error('Couldnt find player to have ready changed');
        },
        refreshPlayerScore(lobby, action: PayloadAction<{id: string, location: string | number, score: number}>) {
            if (action.payload.location == "lounge") {
                for (let i = 0; i < lobby.gameSettings.lounge.players.length; i++) {
                    if (lobby.gameSettings.lounge.players[i].account.id == action.payload.id) {
                        lobby.gameSettings.lounge.players[i].score = action.payload.score;
                        return;
                    }
                }
            }
            else {
                for (let i = 0; i < lobby.gameSettings.teams[action.payload.location as number].players.length; i++) {
                    if (lobby.gameSettings.teams[action.payload.location as number].players[i].account.id == action.payload.id) {
                        lobby.gameSettings.teams[action.payload.location as number].players[i].score = action.payload.score;
                        return;
                    }
                }
            }
            throw new Error('Couldnt find player to have score changed');
        },

        setPlayerLastAction(lobby, action: PayloadAction<{id: string, location: string | number, action: PlayerSpeechAction}>) {
            if (action.payload.location == "lounge") {
                for (let i = 0; i < lobby.gameSettings.lounge.players.length; i++) {
                    if (lobby.gameSettings.lounge.players[i].account.id == action.payload.id) {
                        lobby.gameSettings.lounge.players[i].lastAction.action = action.payload.action;
                        lobby.gameSettings.lounge.players[i].lastAction.time = new Date().toString();
                        return;
                    }
                }
            }
            else {
                for (let i = 0; i < lobby.gameSettings.teams[action.payload.location as number].players.length; i++) {
                    if (lobby.gameSettings.teams[action.payload.location as number].players[i].account.id == action.payload.id) {
                        lobby.gameSettings.teams[action.payload.location as number].players[i].lastAction.action = action.payload.action;
                        lobby.gameSettings.teams[action.payload.location as number].players[i].lastAction.time = new Date().toString();
                        return;
                    }
                }
            }
            throw new Error('Couldnt find player to have last action set');
        },

        addTeam(lobby) {
            let team = {players: [], score: 0} as Team;
            lobby.gameSettings.teams.push(team);
        },

        deleteTeam(lobby, action: PayloadAction<number>) {
            lobby.gameSettings.teams.splice(action.payload, 1);
        },

        setBid(lobby, action: PayloadAction<{account: Account, teamIndex: number, bid: number}>) {
            lobby.gameState.teamStates.forEach((team) => {
                team.log = [...team.log, {value: action.payload.bid.toString(), type: GameLogEntryType.Bid, origin: action.payload.account} as GameLogEntry]
            })
            lobby.gameState.teamStates[action.payload.teamIndex].currentBid = action.payload.bid;
        },

        addClue(lobby, action: PayloadAction<{account: Account, teamIndex: number, clue: string}>) {
            lobby.gameState.teamStates[action.payload.teamIndex].log = [...lobby.gameState.teamStates[action.payload.teamIndex].log, {value: action.payload.clue, type: GameLogEntryType.Clue, origin: action.payload.account} as GameLogEntry]
            let splitBySpace = action.payload.clue.split(" ")
            splitBySpace = splitBySpace.filter(word => !lobby.gameState.teamStates[action.payload.teamIndex].cluesGiven.includes(word) && word != "")
            lobby.gameState.teamStates[action.payload.teamIndex].cluesGiven = [...lobby.gameState.teamStates[action.payload.teamIndex].cluesGiven, ...splitBySpace]
        },

        addGuess(lobby, action: PayloadAction<{account: Account, teamIndex: number, guess: string, hit: boolean}>) {
            var type = GameLogEntryType.Miss;
            if (action.payload.hit) {
                type = GameLogEntryType.Hit;
                for (let i = 0; i < lobby.gameState.words.length; i++) {
                    if (lobby.gameState.words[i].word == action.payload.guess) {
                        lobby.gameState.teamStates[action.payload.teamIndex].wordsGuessed = [...lobby.gameState.teamStates[action.payload.teamIndex].wordsGuessed, action.payload.guess]
                    }
                }
            }
            lobby.gameState.teamStates[action.payload.teamIndex].log = [...lobby.gameState.teamStates[action.payload.teamIndex].log, {value: action.payload.guess, type: type, origin: action.payload.account} as GameLogEntry]
        },

        revealWord(lobby, action: PayloadAction<{word: string, wordIndex: number, teamIndex: number}>) {
            lobby.gameState.words[action.payload.wordIndex].word = action.payload.word;
            lobby.gameState.words[action.payload.wordIndex].visibility = WordVisibility.Visible;
        }
    }
});



export const { resetLobby, refreshLobbySettings, refreshGameSettings, refreshGameState, setGamePhase, refreshTeams, refreshLounge, addMember, removeMember,
     addPlayerToLounge, removePlayerFromLounge, addPlayerToTeam, removePlayerFromTeam, refreshPlayerRole,
    togglePlayerReady, refreshPlayerScore, setPlayerLastAction, addTeam, deleteTeam, setBid, addClue, addGuess, revealWord } = lobbySlice.actions;

export const selectLobbySettings = (state: {lobby: Lobby}) => state.lobby.lobbySettings;
export const selectGameSettings = (state: {lobby: Lobby}) => state.lobby.gameSettings;
export const selectGameState = (state: {lobby: Lobby}) => state.lobby.gameState;

export const selectMembers = (state: {lobby: Lobby}) => state.lobby.lobbySettings.members;
export const selectTeams = (state: {lobby: Lobby}) => state.lobby.gameSettings.teams;
export const selectLounge = (state: {lobby: Lobby}) => state.lobby.gameSettings.lounge;

export const selectGameWords = (state: {lobby: Lobby}) => state.lobby.gameState.words;
export const selectGameLog = (teamIndex: number) => (state: {lobby: Lobby}) => state.lobby.gameState.teamStates[teamIndex].log;


export default lobbySlice.reducer;