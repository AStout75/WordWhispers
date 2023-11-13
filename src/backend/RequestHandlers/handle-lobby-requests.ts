import { Server, Socket } from "socket.io";
import { Account } from "../../shared-types/account-types";
import { GameLogEntry, GamePhase, GameRole, GameState, TeamState, Word, WordVisibility } from "../../shared-types/game-types";
import { defaultLobby, defaultPlayer, GameSettings, Lobby, LobbyPhase, Lounge, Player, Team } from "../../shared-types/lobby-types";
import { ClientToServerEvents, ServerToClientEvents } from "../../shared-types/socket-types";
import { LobbyStore } from "../backend-types/backend-types";
import lobbies, { wordBank } from "../Store/lobbies";

const MAX_PLAYERS_PER_LOBBY:number = 16;
const DEFAULT_BID:number = 25;
const DEFAULT_BID_TIME:number = 20000;
const DEFAULT_GUESS_TIME:number = 120000;

export function handleViewLobbiesRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>): void {
    console.log("view lobbies requested");
    const lobbiesArray = [] as Lobby[];
    Object.values(lobbies).forEach((lobbyStore : LobbyStore) => {
        lobbiesArray.push(lobbyStore.lobby);
    });
    socket.emit('lobbies', lobbiesArray);
}

export function handleCreateLobbyRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, account: Account): void {
    console.log("create lobby requested by", account);
    let errorMessage = "Cannot create lobby";
    try {
        let lobby:Lobby = defaultLobby;
        lobby.lobbySettings.id = Date.now().toString();
        lobby.lobbySettings.owner = account;
        lobbies[lobby.lobbySettings.id] = {lobby: lobby, locations: {}};
        addAccountToLobbyAndReturnNewPlayer(io, socket, account, lobby); //ignore return
        socket.join(lobby.lobbySettings.id);
        socket.emit('create-lobby-success', lobby);
    }
    catch (e: unknown) {
        if (typeof e === "string") {
            errorMessage += e.toUpperCase() // works, `e` narrowed to string
        } else if (e instanceof Error) {
            errorMessage += e.message // works, `e` narrowed to Error
        }
        socket.emit('create-lobby-failed', errorMessage);
    }
}

export function handleJoinLobbyRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, account:Account, lobbyID: string): void {
    console.log("join lobby requested by", account.username);
    //is the lobby private / password provided?
    //is the player already in a lobby, or in queue?
    let errorMessage = "Cannot join lobby";
    try {
        let lobby = lobbies[lobbyID].lobby //Verify the lobby ID exists
        if (lobby == undefined) {
            throw new Error('Lobby with specified ID doesnt exist:' + lobbyID);
        }
        const createdPlayer = addAccountToLobbyAndReturnNewPlayer(io, socket, account, lobby) //Join the lobby
        io.to(lobbyID).except(socket.id).emit('player-joined-lobby', createdPlayer); //Inform the lobby
        socket.emit('join-lobby-success', lobby); //Give lobby to the new player
        socket.join(lobbyID);
    }
    catch (e: unknown) {
        if (typeof e === "string") {
            errorMessage += e.toUpperCase() // works, `e` narrowed to string
        } else if (e instanceof Error) {
            errorMessage += e.message // works, `e` narrowed to Error
        }
        socket.emit('join-lobby-failed', errorMessage);
    }
}

export function handleLeaveLobbyRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string): void {
    console.log("leave lobby requested by", id, "from lobby", lobbyID);
    let errorMessage = "Cannot leave lobby";
    try {
        let lobby:Lobby = lobbies[lobbyID].lobby //Verify the lobby ID exists
        if (lobby == undefined) {
            throw new Error('Lobby with specified ID doesnt exist:' + lobbyID);
        }
        removeAccountFromLobby(socket, id, lobby);
        socket.emit('leave-lobby-success'); //Inform player leave succeeded
        io.to(lobbyID).except(socket.id).emit('player-left-lobby', id); //Inform lobby
        socket.rooms.forEach((room) => {
            socket.leave(room);
        })
    }
    catch (e: unknown) {
        if (typeof e === "string") {
            errorMessage += e.toUpperCase() // works, `e` narrowed to string
        } else if (e instanceof Error) {
            errorMessage += e.message // works, `e` narrowed to Error
        }
        socket.emit('leave-lobby-failed', errorMessage);
    }

}

export function handleChangeLocationRequest (io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string, location: string | number): void {
    console.log(id, "wants to join team:", location);
    let errorMessage = "Cannot join team/";
    try {
        let lobby = lobbies[lobbyID].lobby; //Verify the lobby ID exists
        if (lobby == undefined) {
            throw new Error('Lobby with specified ID doesnt exist:' + lobbyID);
        }
        const player = removeAccountFromLobbyLocation(socket, id, lobby);
        addPlayerToLocation(socket, lobby, player, location);
        io.to(lobby.lobbySettings.id).emit('player-changed-location', id, location); //Return new lobby to the player
    }
    catch (e: unknown) {
        if (typeof e === "string") {
            errorMessage += e.toUpperCase() // works, `e` narrowed to string
        } else if (e instanceof Error) {
            errorMessage += e.message // works, `e` narrowed to Error
        }
        socket.emit('change-location-failed', errorMessage);
    }
}

export function handleChangeRoleRequest(io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string, role: GameRole): void {
    console.log(id, "wants to join select role", role);
    let errorMessage = "Cannot select role/";
    try {
        let lobby = lobbies[lobbyID].lobby; //Verify the lobby ID exists
        if (lobby == undefined) {
            throw new Error('Lobby with specified ID doesnt exist:' + lobbyID);
        }
        const location = lobbies[lobbyID].locations[id];
        if (role == GameRole.Captain) {
            socket.join(lobby.lobbySettings.id + "-visible");
            socket.leave(lobby.lobbySettings.id + "-hidden");
        }
        else {
            socket.join(lobby.lobbySettings.id + "-visible");
            socket.leave(lobby.lobbySettings.id + "-hidden");
        }
        if (location == "lounge") {
            const players = lobby.gameSettings.lounge.players;
            for (let i = 0; i < players.length; i++) {
                if (players[i].account.id == id) {
                    players[i].role = role;
                }
            }
        }
        else {
            const players = lobby.gameSettings.teams[location as number].players;
            for (let i = 0; i < players.length; i++) {
                if (players[i].account.id == id) {
                    players[i].role = role;
                }
            }
        }
        io.to(lobby.lobbySettings.id).emit('player-changed-role', id, role); //Return new lobby to the player
    }
    catch (e: unknown) {
        if (typeof e === "string") {
            errorMessage += e.toUpperCase() // works, `e` narrowed to string
        } else if (e instanceof Error) {
            errorMessage += e.message // works, `e` narrowed to Error
        }
        socket.emit('change-role-failed', errorMessage);
    }
}

export function handleChangeReadyRequest(io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string): void {
    console.log("Received change ready request w/ lobbyID", lobbyID, "accountID", id);
    let errorMessage = "Cannot change ready/";
    try {
        let lobby = lobbies[lobbyID].lobby; //Verify the lobby ID exists
        if (lobby == undefined) {
            throw new Error('Lobby with specified ID doesnt exist:' + lobbyID);
        }
        const location = lobbies[lobbyID].locations[id];
        if (location == "lounge") {
            const players = lobby.gameSettings.lounge.players;
            for (let i = 0; i < players.length; i++) {
                if (players[i].account.id == id) {
                    players[i].ready = !players[i].ready;
                }
            }
        }
        else {
            const players = lobby.gameSettings.teams[location as number].players;
            for (let i = 0; i < players.length; i++) {
                if (players[i].account.id == id) {
                    players[i].ready = !players[i].ready;
                }
            }
        }
        io.to(lobby.lobbySettings.id).emit('player-changed-ready', id); //Return new lobby to the player
    }
    catch (e: unknown) {
        if (typeof e === "string") {
            errorMessage += e.toUpperCase() // works, `e` narrowed to string
        } else if (e instanceof Error) {
            errorMessage += e.message // works, `e` narrowed to Error
        }
        socket.emit('change-ready-failed', errorMessage);
    }
}

export function handleAddTeamRequest(io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string): void {
    console.log("Received add team request w/ lobbyID", lobbyID, "accountID", id);
    let errorMessage = "Cannot add team/";
    try {
        let lobby = lobbies[lobbyID].lobby; //Verify the lobby ID exists
        if (lobby == undefined) {
            throw new Error('Lobby with specified ID doesnt exist:' + lobbyID);
        }
        let team = {players: [], score: 0} as Team;
        lobby.gameSettings.teams.push(team);
        io.to(lobby.lobbySettings.id).emit('team-added');
    }
    catch (e: unknown) {
        if (typeof e === "string") {
            errorMessage += e.toUpperCase() // works, `e` narrowed to string
        } else if (e instanceof Error) {
            errorMessage += e.message // works, `e` narrowed to Error
        }
        socket.emit('add-team-failed', errorMessage);
    }
}

export function handleDeleteTeamRequest(io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string, index: number): void {
    console.log("Received delete team request w/ lobbyID", lobbyID, "accountID", id, "team index", index);
    let errorMessage = "Cannot delete team/";
    try {
        let lobby = lobbies[lobbyID].lobby; //Verify the lobby ID exists
        if (lobby == undefined) {
            throw new Error('Lobby with specified ID doesnt exist:' + lobbyID);
        }
        lobby.gameSettings.teams.splice(index, 1)
        for (let i = index; i < lobby.gameSettings.teams.length; i++) {
            lobby.gameSettings.teams[i].players.forEach(player => {
                (lobbies[lobbyID].locations[player.account.id] as number) -= 1;
            });
        }
        io.to(lobby.lobbySettings.id).emit('team-deleted', index);
    }
    catch (e: unknown) {
        if (typeof e === "string") {
            errorMessage += e.toUpperCase() // works, `e` narrowed to string
        } else if (e instanceof Error) {
            errorMessage += e.message // works, `e` narrowed to Error
        }
        socket.emit('delete-team-failed', errorMessage);
    }
}

export function handleStartGameRequest(io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobbyID: string) {
    console.log("Received start game request w/ lobbyID", lobbyID, "accountID", id);
    let errorMessage = "Cannot start game/";
    try {
        let lobby = lobbies[lobbyID].lobby; //Verify the lobby ID exists
        if (lobby == undefined) {
            throw new Error('Lobby with specified ID doesnt exist:' + lobbyID);
        }
        const visibleGameState = generateNewGame(lobby.gameSettings);
        const hiddenGameState : GameState = JSON.parse(JSON.stringify(visibleGameState));
        hiddenGameState.words = hiddenGameState.words.map(() => {const hiddenWord = {word: "???"} as Word; return hiddenWord});
        lobby.gameState = visibleGameState;
        lobby.lobbySettings.phase = LobbyPhase.Game;
        io.to(lobby.lobbySettings.id + "-visible").emit('game-started', visibleGameState); //Give players game data
        io.to(lobby.lobbySettings.id + "-hidden").emit('game-started', hiddenGameState); //Give players game data
        setTimeout(() => {setGamePhase(io, lobby, GamePhase.Guess)}, DEFAULT_BID_TIME);
    }
    catch (e: unknown) {
        if (typeof e === "string") {
            errorMessage += e.toUpperCase() // works, `e` narrowed to string
        } else if (e instanceof Error) {
            errorMessage += e.message // works, `e` narrowed to Error
        }
        socket.emit('start-game-failed', errorMessage);
    }
}

// --- UTILS ---

function setGamePhase(io: Server, lobby: Lobby, phase: GamePhase) {
    console.log("Setting game phase of lobby", lobby.lobbySettings.id, "to", phase);
    lobby.gameState.phase = phase;
    if (phase == GamePhase.Guess) {
        io.to(lobby.lobbySettings.id).emit('guessing-started');
        lobby.gameState.timer = Date.now() + lobby.gameSettings.guessTime * 1000;
        console.log("Just set a timeout for guessing of", lobby.gameSettings.guessTime * 1000);
        setTimeout(() => {setGamePhase(io, lobby, GamePhase.End)}, lobby.gameSettings.guessTime * 1000);
    }
    if (phase == GamePhase.End) {
        endGame(io, lobby);
    }
}

function endGame(io: Server, lobby: Lobby) {
    console.log("ended the game");
    lobby.gameState.phase = GamePhase.End;
    lobby.lobbySettings.phase = LobbyPhase.Waiting;
    //scoring
    lobby.gameSettings.teams.forEach((team, index) => {
        const won = lobby.gameState.teamStates[index].wordsGuessed.length = lobby.gameSettings.wordCount;
        if (won) {
            team.players.forEach((player) => {
                player.score += 100; //100 for winning
            });
        }
        else {
            team.players.forEach((player) => {
                player.ready = false;
            })
        }
        
    })
    io.to(lobby.lobbySettings.id).emit('game-ended');
}

/**
 * For an account, 
 * 1. add them to the lobby's members
 * 2. create a new Player from default object, and add that to the lobby's lounge
 * 3. record the location of the new account as the lounge
 * @return the new player object created
*/
function addAccountToLobbyAndReturnNewPlayer(io: Server, socket: Socket<ClientToServerEvents, ServerToClientEvents>, account: Account, lobby: Lobby):Player {
    //is the player already in a lobby, or in queue?
    if (lobby.lobbySettings.members.length == MAX_PLAYERS_PER_LOBBY) {
        throw new Error('Lobby is full/');
    }
    Object.keys(lobbies).forEach((id) => {
        Object.keys(lobbies[id].locations).forEach((playerId) => {
            if (playerId == account.id) {
                throw new Error('Account is already in a lobby/')
            }
        })
    })
    lobby.lobbySettings.members.push(account);
    const newPlayer: Player = {...defaultPlayer, account: account};
    lobbies[lobby.lobbySettings.id].locations[account.id] = "lounge";
    lobby.gameSettings.lounge.players.push(newPlayer);
    socket.join(lobby.lobbySettings.id + "-lounge");
    socket.join(lobby.lobbySettings.id + "-hidden");
    return newPlayer;
}

/**
 * Add a player to the lounge or the specified team index
 * @param lobby 
 * @param player 
 * @param location 
 * @returns 
 */

function addPlayerToLocation(socket: Socket<ClientToServerEvents, ServerToClientEvents>, lobby: Lobby, player: Player, location: number | string) {
    if (location == "lounge") {
        addPlayerToLounge(socket, lobby, player)
        return;
    }
    if (location as number >= lobby.gameSettings.teams.length) {
        throw new Error('Team' + (location as number + 1) + 'doesnt exist');
    }
    addPlayerToTeamIndex(socket, lobby, player, location as number);
}

function addPlayerToLounge(socket: Socket<ClientToServerEvents, ServerToClientEvents>, lobby: Lobby, player: Player) {
    lobby.gameSettings.lounge.players.push(player);
    lobbies[lobby.lobbySettings.id].locations[player.account.id] = "lounge";
    socket.join(lobby.lobbySettings.id + "-lounge");
}

function addPlayerToTeamIndex(socket: Socket<ClientToServerEvents, ServerToClientEvents>, lobby: Lobby, player: Player, index: number) {
    console.log("add player to team index");
    lobby.gameSettings.teams[index].players.push(player);
    lobbies[lobby.lobbySettings.id].locations[player.account.id] = index;
    socket.join(lobby.lobbySettings.id + "-team" + index)
}

/**
 * Remove an account from both the lobby members
 * and the lobby location specified in lookup table
 * @param id 
 * @param lobby 
 */

function removeAccountFromLobby(socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobby: Lobby) {
    removeAccountFromLobbyMembers(id, lobby);
    removeAccountFromLobbyLocation(socket, id, lobby);
}

function removeAccountFromLobbyMembers(id: string, lobby: Lobby) {
    let found : boolean = false;
    lobby.lobbySettings.members.forEach( (member: Account, index: number) => {
        if(member.id == id) {
            found = true;
            lobby.lobbySettings.members.splice(index, 1);
            return;
        }
    });
    if (!found) {
        throw new Error('Player is not in this lobby:' + lobby.lobbySettings.id);
    }
}

function removeAccountFromLobbyLocation(socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobby: Lobby):Player {
    const location : number | string = lobbies[lobby.lobbySettings.id].locations[id];
    if (location == "lounge") {
        console.log("remove from lougne");
        return removeAccountFromLobbyLounge(socket, id, lobby);
    }
    console.log("remove from ", location);
    return removeAccountFromLobbyTeam(socket, id, lobby, location as number);
}

function removeAccountFromLobbyLounge(socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobby: Lobby):Player {
    let lounge : Lounge = lobby.gameSettings.lounge;
    for (let i = 0; i < lounge.players.length; i++) {
        if (lounge.players[i].account.id == id) {
            socket.leave(lobby.lobbySettings.id + "-lounge")
            return lounge.players.splice(i, 1)[0];
        }
    }
    throw new Error('Player was expected to be in the lounge, but not found');
}

function removeAccountFromLobbyTeam(socket: Socket<ClientToServerEvents, ServerToClientEvents>, id: string, lobby: Lobby, teamIndex: number):Player {
    let team : Team = lobby.gameSettings.teams[teamIndex];
    for (let i = 0; i < team.players.length; i++) {
        if (team.players[i].account.id == id) {
            socket.leave(lobby.lobbySettings.id + "-" + teamIndex)
            return team.players.splice(i, 1)[0];
        }
    }
    throw new Error('Player wasnt in the team expected');
}

// --- GAME UTILS ---

function generateNewGame(settings: GameSettings): GameState {
    let state = {...defaultLobby.gameState};
    state.phase = GamePhase.Bid;
    state.timer = Date.now() + DEFAULT_BID_TIME
    let chosenWords: string[] = [];
    for (let i = 0; i < settings.wordCount; i++) {
        let random = Math.floor(Math.random() * wordBank.length);
        let word = wordBank[random];
        while (chosenWords.includes(word)) {
            random = Math.floor(Math.random() * wordBank.length);
            word = wordBank[random];
        }
        state.words.push({word: word, visibility: WordVisibility.Hidden});
        chosenWords.push(word);
    }
    state.teamStates = settings.teams.map( (team) => {
        return {
            currentBid: DEFAULT_BID,
            cluesGiven: [] as string[],
            wordsGuessed: [] as string[],
            log: [] as GameLogEntry[]
        } as TeamState
    })
    return state;
}