
import React, {useEffect, useState} from 'react';
import { createRoot } from 'react-dom/client';
import { PageType } from './frontend-types/frontend-types';
import { socket } from './Socket/socket';
import { SocketContext, useSocketContext } from './Socket/socket-context';
import { store } from './Store/store';
import { addClue, addGuess, addMember, addPlayerToLounge, addPlayerToTeam, addTeam, deleteTeam, refreshGameSettings, refreshGameState, refreshLobbySettings, refreshLounge, refreshPlayerRole, refreshPlayerScore, refreshTeams, removeMember, removePlayerFromLounge, removePlayerFromTeam, resetLobby, revealWord, setBid, setGamePhase, setPlayerLastAction, togglePlayerReady } from './Store/Reducers/lobbySlice';
import { Provider } from 'react-redux';
import InfoPanel from './Elements/InfoPanel';
import Page from './Elements/Page';
import { createDefaultPlayer, defaultLobby, GameSettings, Lobby, Lounge, Player, PlayerSpeechAction, Team } from '../shared-types/lobby-types';
import { refreshLobbies, setRefreshDate } from './Store/Reducers/lobbiesSlice';
import { generateAccount } from './Store/account';
import { Account } from '../shared-types/account-types';
import { GamePhase, GameRole, GameState, TeamState } from '../shared-types/game-types';
import { resetPlayer, toggleLocalPlayerReady, updatePlayerRole, updatePlayerScore } from './Store/Reducers/playerSlice';
import Notifications from './Elements/Notifications';
import { addNotification } from './Store/Reducers/notificationsSlice';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/styles.css';

function App() {
    const [page, setPage] = useState(PageType.Index);
    const socket = useSocketContext();
    useEffect(() => {
        socket.on('lobbies', (lobbies: Lobby[]) => {handleLobbies(lobbies, setPage)});
        socket.on('create-lobby-success', (lobby: Lobby) => {handleCreateLobbySuccess(lobby, setPage)});
        socket.on('join-lobby-success', (lobby: Lobby) => {handleJoinLobbySuccess(lobby, setPage)});
        socket.on('leave-lobby-success', () => {handleLeaveLobbySuccess()});
        
        socket.on('player-joined-lobby', (player: Player) => {handlePlayerJoinedLobby(player)});
        socket.on('player-left-lobby', (id: string) => {handlePlayerLeftLobby(id)});

        socket.on('player-changed-location', (id: string, location: number | string) => {handlePlayerChangedLocation(id, location)});
        socket.on('player-changed-role', (id: string, role: GameRole) => {handlePlayerChangedRole(id, role)});
        socket.on('player-changed-ready', (id: string) => {handlePlayerChangedReady(id)});
        socket.on('player-changed-score', (id: string, score: number ) => {handlePlayerChangedScore(id, score)});
        socket.on('team-added', () => {handleAddTeam()});
        socket.on('team-deleted', (index: number) => {handleDeleteTeam(index)})

        socket.on('game-started', (game: GameState) => {handleGameStarted(game, setPage)});
        socket.on('guessing-started', () => {handleGuessingStarted()});
        socket.on('game-ended', (game: GameState, teams: Team []) => {handleGameEnded(game, teams)});

        socket.on('view-lobbies-failed', (message: string) => handleViewLobbiesFailed(message));
        socket.on('create-lobby-failed', (message: string) => handleCreateLobbyFailed(message))
        socket.on('join-lobby-failed', (message: string) => handleJoinLobbyFailed(message));
        socket.on('leave-lobby-failed', (message: string) => handleLeaveLobbyFailed(message));
        socket.on('change-location-failed', (message: string) => handleChangeLocationFailed(message));
        socket.on('change-role-failed', (message: string) => handleChangeRoleFailed(message));
        socket.on('change-ready-failed', (message: string) => handleChangeReadyFailed(message));
        socket.on('add-team-failed', (message: string) => handleAddTeamFailed(message));
        socket.on('delete-team-failed', (message: string) => handleDeleteTeamFailed(message));
        socket.on('start-game-failed', (message: string) => handleGameStartedFailed(message));

        socket.on('player-made-bid', (id: string, bid: number) => {handlePlayerMadeBid(id, bid)});
        socket.on('player-gave-clue', (id: string, clue: string) => {handlePlayerGaveClue(id, clue)});
        socket.on('player-gave-guess', (id: string, guess: string, wordIndex: number, hit: boolean) => {handlePlayerGaveGuess(id, guess, wordIndex, hit)});

        socket.on('player-made-bid-failed', (message: string) => handlePlayerMadeBidFailed(message));
        socket.on('player-gave-clue-failed', (message: string) => handlePlayerGaveClueFailed(message));
        socket.on('player-gave-guess-failed', (message: string) => handlePlayerGaveGuessFailed(message));
        
        //Socials
        socket.on('player-gave-clue-social', (id: string) => {handleSocialEvent(id, PlayerSpeechAction.GiveClue)});
        socket.on('player-gave-guess-hit-social', (id: string) => {handleSocialEvent(id, PlayerSpeechAction.MakeGuessHit)});
        socket.on('player-gave-guess-miss-social', (id: string) => {handleSocialEvent(id, PlayerSpeechAction.MakeGuessMiss)});
        
        
        
        return () => {
            //todo
            //socket.off('join-lobby-success', handleJoinLobbySuccess);
            //socket.off('join-lobby-failed', (message: string) => {console.log(message)});
            //socket.off('create-lobby-success', handleCreateLobbySuccess);
            //socket.off('lobbies', handleLobbies);
        }
    }, []);
    return (
        <div>
            <Page page={page} setPageState={setPage}/>
            <Notifications />
        </div>
    )
}

//Attach the react render to the DOM
const container = document.getElementById('root')!;
const root = createRoot(container);
generateAccount();

/* --- LOBBIES --- */

/* --- --- CREATE OR QUERY LOBBY --- */

const handleCreateLobbySuccess = (newLobby: Lobby, setPage: Function) => {
    //console.log("Received create lobby success");
    store.dispatch(refreshLobbySettings(newLobby.lobbySettings));
    store.dispatch(refreshGameSettings(newLobby.gameSettings));
    setPage(PageType.Lobby);
}

const handleCreateLobbyFailed = (message: string) => {
    //console.log("Create Lobby Failed: ", message);
    store.dispatch(addNotification({title: "Couldn't create lobby", description: message, type: "error"}));
}

const handleLobbies = (lobbies:Lobby[], setPage: Function) => {
    //console.log("Received lobbies");
    store.dispatch(refreshLobbies(lobbies));
    store.dispatch(setRefreshDate(new Date().toLocaleTimeString()));
    setPage(PageType.Lobbies)
}

const handleViewLobbiesFailed = (message: string) => {
    //console.log("ERROR: ", message);
    store.dispatch(addNotification({title: "Couldn't view lobbies", description: message, type: "error"}));
}

/* --- --- JOIN LOBBY --- */
const handleJoinLobbySuccess = (newLobby: Lobby, setPage: Function) => {
    //console.log("Received join lobby success");
    store.dispatch(refreshLobbySettings(newLobby.lobbySettings));
    store.dispatch(refreshGameSettings(newLobby.gameSettings));
    setPage(PageType.Lobby);
}

const handlePlayerJoinedLobby = (player: Player) => {
    //console.log("Received player joined lobby");
    store.dispatch(addMember(player.account));
    store.dispatch(addPlayerToLounge(player));
    store.dispatch(addNotification({title: "Player joined lobby", description: player.account.username + " joined the lobby", type: "info"}));
}

const handleJoinLobbyFailed = (message: string) => {
    //console.log("Join Lobby Failed: ", message);
    store.dispatch(addNotification({title: "Couldn't join lobby", description: message, type: "error"}));
}

/* --- --- LEAVE LOBBY --- */

const handleLeaveLobbySuccess = () => {
    //console.log("Received leave lobby success");
    store.dispatch(resetLobby());
    store.dispatch(resetPlayer());
}

const handlePlayerLeftLobby = (id: string) => {
    //console.log("Received player left lobby");
    store.dispatch(removeMember(findAccountObject(id)));
    const playerObject = findPlayerObject(id);
    if (playerObject.location == "lounge") {
        store.dispatch(removePlayerFromLounge(playerObject.player));
    }
    else {
        store.dispatch(removePlayerFromTeam(playerObject as { player: Player; location: number; }))
    }
    store.dispatch(addNotification({title: "Player left lobby", description: playerObject.player.account.username + " left the lobby", type: "info"}));
    
}

const handleLeaveLobbyFailed = (message: string) => {
    //console.log("ERROR: ", message);
    store.dispatch(addNotification({title: "Couldn't leave lobby", description: message, type: "error"}));
}

/* --- --- PLAYER UPDATES --- */

const handlePlayerChangedLocation = (id: string, location: number | string) => {
    //console.log("Received player changed location");
    const playerObject = findPlayerObject(id);
    //Remove
    if (playerObject.location == "lounge") {
        store.dispatch(removePlayerFromLounge(playerObject.player));
    }
    else {
        store.dispatch(removePlayerFromTeam(playerObject as { player: Player; location: number; }))
    }
    //Add
    if (location == "lounge") {
        store.dispatch(addPlayerToLounge(playerObject.player));
    }
    else {
        store.dispatch(addPlayerToTeam({ player: playerObject.player, location: location as number }));
    }
};

const handlePlayerChangedRole = (id: string, role: GameRole) => {
    //console.log("Received player changed role");
    store.dispatch(refreshPlayerRole({id: id, location: findPlayerObject(id).location, role: role}));
    if (id == store.getState().player.account.id) {
        store.dispatch(updatePlayerRole(role));
    }
};

const handlePlayerChangedReady = (id: string) => {
    //console.log("Received player changed ready");
    store.dispatch(togglePlayerReady({id: id, location: findPlayerObject(id).location}));
    if (id == store.getState().player.account.id) {
        store.dispatch(toggleLocalPlayerReady());
    }
};

const handlePlayerChangedScore = (id: string, score: number) => {
    //console.log("Received player changed score");
    store.dispatch(refreshPlayerScore({id: id, location: findPlayerObject(id).location, score: score}));
    if (id == store.getState().player.account.id) {
        store.dispatch(updatePlayerScore(score));
    }
};

const handleAddTeam = () => {
    //console.log("Received add team");
    store.dispatch(addTeam());
}

const handleDeleteTeam = (index: number) => {
    //console.log("Received delete team");
    store.dispatch(deleteTeam(index));
}   

const handleGameStarted = (game: GameState, setPage: Function) => {
    //console.log("Received game started");
    store.dispatch(refreshGameState(game));
    store.dispatch(addNotification({title: "Game started", description: "The game has started", type: "info"}))
    setPage(PageType.Game);
};

const handleGameStartedFailed = (message: string) => {
    //console.log("ERROR: ", message);
    store.dispatch(addNotification({title: "Couldn't start game", description: message, type: "error"}));
}

const handleGuessingStarted = () => {
    //console.log("Received guessing started");
    store.dispatch(setGamePhase(GamePhase.Guess));
    store.dispatch(addNotification({title: "Guessing started", description: "The guessing phase has started", type: "info"}))
};

const handleGameEnded = (gameState: GameState, teams: Team []) => {
    //console.log("Received game ended");
    store.dispatch(setGamePhase(GamePhase.End));
    gameState.words.forEach((word, index) => {
        word.visibility = store.getState().lobby.gameState.words[index].visibility;
    })
    store.dispatch(refreshGameState(gameState));
    store.dispatch(refreshTeams(teams));
    //clear the playerLastAction of every player in the lobby
    store.getState().lobby.gameSettings.teams.forEach((team, index) => {
        team.players.forEach(player => {
            store.dispatch(setPlayerLastAction({id: player.account.id, location: index, action: PlayerSpeechAction.None}));
        });
    })
    store.dispatch(addNotification({title: "Game ended", description: "The game has ended", type: "info"}))
}

/* --- --- JOIN TEAMS OR LOUNGE --- */

function handleChangeLocationFailed(message: string) {
    store.dispatch(addNotification({title: "Couldn't change location", description: message, type: "error"}));
};

function handleChangeRoleFailed(message: string) {
    store.dispatch(addNotification({title: "Couldn't change role", description: message, type: "error"}));
}

function handleChangeReadyFailed(message: string) {
    store.dispatch(addNotification({title: "Couldn't toggle ready", description: message, type: "error"}));
}

function handleAddTeamFailed(message: string) {
    store.dispatch(addNotification({title: "Couldn't add team", description: message, type: "error"}));
}

function handleDeleteTeamFailed(message: string) {
    store.dispatch(addNotification({title: "Couldn't delete team", description: message, type: "error"}));
}

/* --- GAME UDPATES --- */

function handlePlayerMadeBid(id: string, bid: number) {
    //console.log("Received player made bid");
    store.dispatch(setBid({account: findAccountObject(id), teamIndex: findPlayerObject(id).location as number, bid: bid}));
    store.dispatch(setPlayerLastAction({id: id, location: findPlayerObject(id).location, action: PlayerSpeechAction.MakeBid}));
    
}

function handlePlayerGaveClue(id: string, clue: string) {
    //console.log("Received player gave clue");
    const location : number = findPlayerObject(id).location as number;
    store.dispatch(addClue({account: findAccountObject(id), teamIndex: location as number, clue: clue}));
}

function handlePlayerGaveGuess(id: string, guess: string, wordIndex: number, hit: boolean) {
    //console.log("Received player gave guess");
    const location : number = findPlayerObject(id).location as number;
    if (hit) {
        store.dispatch(revealWord({word: guess, wordIndex: wordIndex, teamIndex: location}));
    }
    store.dispatch(addGuess({account: findAccountObject(id), teamIndex: location, guess: guess, hit: hit}));
}

function handlePlayerMadeBidFailed(message: string) {
    store.dispatch(addNotification({title: "Couldn't make bid", description: message, type: "error"}));
}

function handlePlayerGaveClueFailed(message: string) {
    store.dispatch(addNotification({title: "Couldn't give clue", description: message, type: "error"}));
}

function handlePlayerGaveGuessFailed(message: string) {
    store.dispatch(addNotification({title: "Couldn't make guess", description: message, type: "error"}));
}

/* --- SOCIAL EVENTS --- */

function handleSocialEvent(id: string, event: PlayerSpeechAction) {
    //console.log("Received a social event", event);
    const location : number = findPlayerObject(id).location as number;
    if (event == PlayerSpeechAction.GiveClue) {store.dispatch(setPlayerLastAction({id: id, location: location as number, action: PlayerSpeechAction.GiveClue}))};
    if (event == PlayerSpeechAction.MakeGuessMiss) {store.dispatch(setPlayerLastAction({id: id, location: location as number, action: PlayerSpeechAction.MakeGuessMiss}))};
    if (event == PlayerSpeechAction.MakeGuessHit) {store.dispatch(setPlayerLastAction({id: id, location: location as number, action: PlayerSpeechAction.MakeGuessHit}))};
}

/* --- UTILS --- */

function findAccountObject(id: string): Account {

    const members : Account[] = store.getState().lobby.lobbySettings.members;
    for (let i = 0; i < members.length; i++) {
        if (members[i].id == id) {
            return members[i];
        }
    }
    throw new Error('No account found');
}

/**
 * Yes, the client-side will have to brute force locate the player object (to be updated) each time a server event occurs.
 * Could try keeping a local dictionary for indexing, but who cares
 * This is better than sending it over the server as a larger message (which has real costs)
 * The client, however, has plenty of CPU time to spare.
 * @param id 
 * @returns 
 */

function findPlayerObject(id: string): {player: Player, location: string | number} {
    const lounge : Lounge = store.getState().lobby.gameSettings.lounge;
    for (let i = 0; i < lounge.players.length; i++) {
        if (lounge.players[i].account.id == id) {
            return {player: lounge.players[i], location: "lounge"};
        }
    }
    const teams : Team[] = store.getState().lobby.gameSettings.teams;
    for (let i = 0; i < teams.length; i++) {
        for (let j = 0; j < teams[i].players.length; j++) {
            if (teams[i].players[j].account.id == id) {
                return {player: teams[i].players[j], location: i};
            }
        }
    }
    throw new Error('No player found');
}

root.render(
    <Provider store={store}>
        <SocketContext.Provider value={socket}>
            <App />
        </SocketContext.Provider>
    </Provider>
);


