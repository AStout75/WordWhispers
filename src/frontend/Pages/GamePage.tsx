import React, { useEffect, useState } from 'react'
import ButtonWithOnClickEvent from '../Elements/ButtonWithOnClickEvent';
import { sendGiveClueRequest, sendGiveGuessRequest, sendJoinQueueCasualRequest, sendJoinQueueRankedRequest, sendLeaveQueueRequest, sendMakeBidRequest } from '../Socket/socket-events';
import { PageProps, QueuePageProps, SetAppPageProps} from '../frontend-types/frontend-types';
import { useSocketContext } from '../Socket/socket-context';
import { QueueType } from '../../shared-types/misc-types';
import { selectGameLog, selectGameSettings, selectGameState, selectGameWords, selectLobbySettings, selectTeams } from '../Store/Reducers/lobbySlice';
import { useSelector } from 'react-redux';
import FlexBox from '../Elements/FlexBox';
import ScrollableList from '../Elements/ScrollableList';
import { GameLogEntry, GameLogEntryType, GamePhase, GameRole, GameState, TeamState, Word, WordVisibility } from '../../shared-types/game-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid, regular, brands, icon } from '@fortawesome/fontawesome-svg-core/import.macro'
import { getAccount } from '../Store/account';
import { GameSettings, LobbySettings, Player, PlayerSpeechAction, Team } from '../../shared-types/lobby-types';
import { selectPlayer } from '../Store/Reducers/playerSlice';
import wizard from "../Assets/wizard.png";
import knight from "../Assets/knight.png";
import bid from "../Assets/megaphone.png";
import clue from "../Assets/businessman.png";
import hit from "../Assets/approved.png";
import miss from "../Assets/dismissed.png";
import { TeamPanel } from '../Elements/Teams';
import { FancyHRTitle } from '../Elements/FancyHRTitle';


export default function GamePage(props: SetAppPageProps) {
    const socket = useSocketContext();

    const lobbySettings: LobbySettings = useSelector(selectLobbySettings);
    const gameSettings: GameSettings = useSelector(selectGameSettings);
    const player : Player = useSelector(selectPlayer);

    let currentTeamIndex = -1;
    const teams = gameSettings.teams;
    teams.forEach((team, index) => {
        team.players.forEach((player) => {
            if (player.account.id == getAccount().id) {
                currentTeamIndex = index;
            }
        })
    });

    const giveGuessOrClue = (value: any) => {
        if (player.role == GameRole.Captain) {
            sendGiveClueRequest(socket, getAccount().id, lobbySettings.id, value);
        }
        else {
            sendGiveGuessRequest(socket, getAccount().id, lobbySettings.id, value);
        }
    };

    const makeBid = (value: any) => {
        sendMakeBidRequest(socket, getAccount().id, lobbySettings.id, value);
    }

    return (
        <div>
            <GameMainPanel giveGuessOrClue={giveGuessOrClue} makeBid={makeBid} currentTeamIndex={currentTeamIndex} />
            <br></br>
            <GameSocialPanel currentTeamIndex={currentTeamIndex}/>
        </div>
    )
}

function GameMainPanel(props: {giveGuessOrClue: Function, makeBid: Function, currentTeamIndex: number}) {
    const gameState: GameState = useSelector(selectGameState);
    const player: Player = useSelector(selectPlayer);
    var text = "";
    if (gameState.phase == GamePhase.Bid) {text = "Send a Bid"}
    if (gameState.phase == GamePhase.Guess && player.role == GameRole.Captain) {text = "Send Clues"}
    if (gameState.phase == GamePhase.Guess && player.role == GameRole.Crew) {text = "Send Guesses"}
    return (
        <div className="game-main-panel">
            <GameStatusBar currentTeamIndex={props.currentTeamIndex}/>
            <FancyHRTitle text={"Time Remaining"} titleClass={''} />
            <GameClock />
            <FancyHRTitle text={"Hidden Words"} titleClass={''} />
            <GameWordsPanel currentTeamIndex={props.currentTeamIndex} />
            <FancyHRTitle text={text} titleClass={''} />
            <GameInputPanel giveGuessOrClue={props.giveGuessOrClue} makeBid={props.makeBid} currentTeamIndex={props.currentTeamIndex} />
            <FancyHRTitle text={"Game Log"} titleClass={''} />
            <GameLogPanel currentTeamIndex={props.currentTeamIndex} />
        </div>
    )
}



function GameStatusBar(props: {currentTeamIndex: number}) {
    const gameState : GameState = useSelector(selectGameState);
    const player : Player = useSelector(selectPlayer);
    return (
        <div className="game-status-bar text-center rounded">
            {gameState.phase == GamePhase.Bid && player.role == GameRole.Crew && "Your team captain(s) can see the words and are predicting how many clue words they'll need to give you."}
            {gameState.phase == GamePhase.Bid && player.role == GameRole.Captain && "Bid the amount of clue words you'll need to get your teammates to guess these hidden words."}
            {gameState.phase == GamePhase.Guess && player.role == GameRole.Captain && "You have " + (gameState.teamStates[props.currentTeamIndex].currentBid - gameState.teamStates[props.currentTeamIndex].cluesGiven.length) + "clues left to give your team!"}
            {gameState.phase == GamePhase.Guess && player.role == GameRole.Crew && "Using your team captain(s)'s clues, guess the hidden words! You have unlimited guesses."}
        </div>
    )
}

function GameWordsPanel(props: {currentTeamIndex: number}) {
    const gameWords = useSelector(selectGameWords);
    const gameState = useSelector(selectGameState);
    return (
        <FlexBox classes="flex-wrap align-items-center justify-content-center">
            {gameWords.map( (word, index) => {
                
                return (
                    <WordBox word={word} visible={word.visibility == WordVisibility.Visible ? true : false /*gameState.teamStates[props.currentTeamIndex].wordsGuessed.includes(word.word)*/} index={index} />
                )
            })}
        </FlexBox>
    )
}

function GameClock() {
    const gameState: GameState = useSelector(selectGameState);
    const [time, setTime] = useState((gameState.timer - Date.now()) / 1000);
    useEffect(() => {
        const interval = setInterval(() => {
            if (gameState.timer - Date.now() < 0) {
                setTime(0);
            }
            else {
                setTime((gameState.timer - Date.now()) / 1000);
            }
            
        }, 1);

        return () => clearInterval(interval);
    }, [gameState.timer]);
    return (
        <div className="game-clock-container rounded">
            <input className="game-clock-text text-center rounded" readOnly min="0" type="number" value={time.toFixed(0)}  />
        </div>
    )
}

function GameLogPanel(props: {currentTeamIndex: number}) {
    const gameLog: GameLogEntry[] = useSelector(selectGameLog(props.currentTeamIndex));
    
    return (
        <FlexBox classes="justify-content-start flex-wrap align-content-start game-log-panel">
            {gameLog.length == 0 && <div className="text-center">Nothing has happened yet.</div>}
            {gameLog.map( (entry, index) => {
                return(<LogEntry key={index} entry={entry} />)
            })}
        </FlexBox>
    )
}

function GameInputPanel(props: {giveGuessOrClue: Function, makeBid: Function, currentTeamIndex: number}) {
    const gameState: GameState = useSelector(selectGameState);
    return (
        <div>
            {gameState.phase == GamePhase.Bid && <GameBidPanel onSubmit={(event: any) => {props.makeBid(event.target[0].value)}} currentTeamIndex={props.currentTeamIndex} />}
            {gameState.phase == GamePhase.Guess && <GameGuessOrCluePanel onSubmit={(event: any) => {props.giveGuessOrClue(event.target[0].value)}} />}
        </div>
    )
}

function GameSocialPanel(props: {currentTeamIndex: number}) {
    return (
        <div className="w-100 game-social-panel rounded">
            <TeamSocialPanel currentTeamIndex={props.currentTeamIndex}/>
        </div>
    )
}

function WordBox(props: {word: Word, visible: boolean, index: number}) {
    const animationDelayStyle = {
        animationDelay: (!props.visible ? (0.05 * props.index).toString() + "s" : "0")
    }
    return (
        <div className={"rounded justify-content-center align-items-center word " + (props.visible ? "word-revealed" : "word-hidden")} key={props.visible ? 0 : 1} style={animationDelayStyle}>{props.word.word}</div>
    )
}

function LogEntry(props: {entry: GameLogEntry}) {
    return (
        <FlexBox classes={"rounded flex-column justify-content-center align-items-center log-entry log-entry-" + props.entry.type}>
            {props.entry.value}
            <hr />
            <div>
                <div className="log-entry-img-container d-inline-block">
                    <img src={props.entry.type == GameLogEntryType.Clue ? wizard : knight} />
                </div>
                <div className="d-inline-block log-entry-origin">{props.entry.origin.username}</div>
            </div>
        </FlexBox>
    )
}

function GameBidPanel(props: {onSubmit: Function, currentTeamIndex: number}) {
    const [value, setValue] = useState(10);
    var input = () => {
        return(<input className="game-bid-input" id="bid-input" value={value} readOnly type="number" max="50" min="1" />)
    }
    const decrementOne = () => {
        if (value > 1) {
            setValue(value - 1);
        }
        
    }
    const incrementOne = () => {
        if (value < 50) {
            setValue(value + 1);
        }
    }
    return (
            <FlexBox classes="game-bid-container justify-content-around flex-wrap">
                <form className="d-flex flex-column align-items-center" onSubmit={function(event) {event.preventDefault(); props.onSubmit(event)}}>
                    <FlexBox classes={"game-bid-input-container rounded"}>
                        <FlexBox classes="arrow-container flex-column justify-content-center align-items-left">
                            <div className="left-arrow" onClick={() => decrementOne()} ></div>
                        </FlexBox>
                        <FlexBox classes="flex-column justify-content-center">
                            {input()}
                        </FlexBox>
                        <FlexBox classes="arrow-container flex-column justify-content-center align-items-left">
                            <div className="right-arrow" onClick={() => incrementOne()}></div>
                        </FlexBox>
                    </FlexBox>
                    <input type="submit" className="make-bid-button" value="Make a Bid" />
                </form>
                <GameBidPanelTeams currentTeamIndex={props.currentTeamIndex} />
                
            </FlexBox>
    )
}

function GameBidPanelTeams(props: {currentTeamIndex: number}) {
    const gameState: GameState = useSelector(selectGameState);
    return(
        <FlexBox classes="game-bid-teams-container justify-content-between">
        {gameState.teamStates.map( (state, index) => {
            return (
                <FlexBox classes={"flex-column justify-content-between align-items-center game-bid-team-bid-container"}>
                    <div className={"game-bid-team-bid " + (index == props.currentTeamIndex ? "own-team-bid" : "")}>{state.currentBid}</div>
                    <div>Team {index + 1}</div>
                </FlexBox>
                
            )
        })}
        </FlexBox>
        
    )
}

function GameGuessOrCluePanel(props: {onSubmit: Function}) {
    const player: Player = useSelector(selectPlayer);
    return (
        <FlexBox classes="game-input-container align-items-stretch rounded flex-wrap">
            <form className="d-flex align-items-center justify-content-center flex-wrap" onSubmit={function(event) {event.preventDefault(); props.onSubmit(event)}}>
                <input className="game-input" id="word-input" maxLength={25} />
                <input type="submit" className="give-guess-or-clue-button" value={player.role == GameRole.Captain ? "Give Clue" : "Make Guess"} />
            </form>
        </FlexBox>
    )
}

function TeamSocialPanel(props: {currentTeamIndex: number}) {
    const gameSettings: GameSettings = useSelector(selectGameSettings);
    return (
        <FlexBox classes="justify-content-center align-items-center flex-wrap teams-container">
            {gameSettings.teams.map( (team, index) => {
                return (
                    <div className="mr-1">
                        <TeamPanel index={index} team={team} currentTeamIndex={props.currentTeamIndex} deleteTeam={() => {}} />
                    </div>
                    
                )
            })}
        </FlexBox>
        
    )
}

