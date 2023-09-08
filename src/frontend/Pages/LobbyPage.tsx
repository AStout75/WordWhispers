import React, { useContext, useEffect, useState } from 'react'
import ButtonWithOnClickEvent from '../Elements/ButtonWithOnClickEvent';
import { sendAddTeamRequest, sendChangeLocationRequest, sendChangeReadyRequest, sendChangeRoleRequest, sendDeleteTeamRequest, sendJoinQueueCasualRequest, sendJoinQueueRankedRequest, sendLeaveLobbyRequest, sendStartGameRequest, sendViewLobbiesRequest } from '../Socket/socket-events';
import { LobbyPageProps, PageType } from '../frontend-types/frontend-types';
import { SocketContext, useSocketContext } from '../Socket/socket-context'
import { useSelector } from "react-redux";
import { selectGameSettings, selectLobbySettings, selectTeams } from '../Store/Reducers/lobbySlice';
import { GameSettings, LobbySettings, Player, Team } from '../../shared-types/lobby-types';
import { Account } from '../../shared-types/account-types';
import TeamElement from '../Elements/TeamElement';
import { getAccount } from '../Store/account';
import { GameRole } from '../../shared-types/game-types';
import { selectPlayer } from '../Store/Reducers/playerSlice';
import FlexBox from '../Elements/FlexBox';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Avatar, NewTeamPanel, TeamPanel } from '../Elements/Teams';
import { current } from '@reduxjs/toolkit';
import { FancyHRTitle } from '../Elements/FancyHRTitle';
import wizard from "../Assets/wizard.png";
import knight from "../Assets/knight.png";

export default function LobbyPage(props: LobbyPageProps) {
    const socket = useSocketContext();
    const lobbySettings : LobbySettings = useSelector(selectLobbySettings);
    const gameSettings : GameSettings = useSelector(selectGameSettings);
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
    let canStart = true;
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].players.length == 0) {
            canStart = false;
            break;
        }
        for (let j = 0; j < teams[i].players.length; j++) {
            if (!teams[i].players[j].ready) {
                canStart = false;
                break;
            }
        }
    }
    const clickedChangeRole = (role: GameRole) => {
        sendChangeRoleRequest(socket, getAccount().id, lobbySettings.id, role);
    };
    const clickedChangeReady = () => {
        sendChangeReadyRequest(socket, getAccount().id, lobbySettings.id, !player.ready);
    };
    const clickedJoinLounge = () => {
        sendChangeLocationRequest(socket, getAccount().id, lobbySettings.id, "lounge");
    };
    const clickedJoinTeam = (index: number) => {
        sendChangeLocationRequest(socket, getAccount().id, lobbySettings.id, index);
    };
    const clickedAddNewTeam = () => {
        sendAddTeamRequest(socket, getAccount().id, lobbySettings.id);
    };
    const clickedDeleteTeam = (index: number) => {
        sendDeleteTeamRequest(socket, getAccount().id, lobbySettings.id, index);
    }

    const clickedStartGame = () => {
        sendStartGameRequest(socket, getAccount().id, lobbySettings.id);
    };
    const clickedLeaveLobby = () => {
        sendLeaveLobbyRequest(socket, getAccount().id, lobbySettings.id);
        props.setPageState("index"); 
    };

    if (lobbySettings.id == "") {
        return <div>Not in a lobby</div>
    }
    let hasEmptyTeam = false;
    teams.forEach((team) => {
        if (team.players.length == 0) {
            hasEmptyTeam = true;
        }
    })
    return (
        <div>
            <FancyHRTitle text={lobbySettings.id} titleClass="lobby-title" />
            <FlexBox classes={'lobby-settings-panel justify-content-between align-items-center rounded'}>
                <button type="button" className={"big-action-button-slim return-home-button"} onClick={() => {clickedLeaveLobby(); props.setPageState(PageType.Lobbies)}}><FontAwesomeIcon icon={solid("arrow-left")} /> Back</button>
                    <FlexBox classes={""}>
                        <form className="d-flex">
                            <FlexBox classes="change-role-container align-items-center">
                                <ChangeRoleButton onClick={() => clickedChangeRole(GameRole.Captain)} role={GameRole.Captain} />
                                <ChangeRoleButton onClick={() => clickedChangeRole(GameRole.Crew)} role={GameRole.Crew} />
                            </FlexBox>
                        </form>
                    </FlexBox>
                    <div>
                        <button type="button" className={"ready-button mr-3" + (player.ready ? " ready-button-depressed" : "")} onClick={() => clickedChangeReady()}>{player.ready ? "Ready!" : "Ready up"}</button>
                        <ButtonWithOnClickEvent disabled={!canStart} onClick={clickedStartGame} wrapperClass={'d-inline-block'} buttonClass={'big-action-button-slim start-game-button' + (canStart ? " start-game-button-enabled" : "")} buttonText={"Start"} />
                    </div>
            </FlexBox>
            <FancyHRTitle text={"Join a team"} titleClass={""} />
            <FlexBox classes={'flex-wrap mb-3 teams-container'}>
                {teams.map( (team, index) => {
                    return(
                        <FlexBox classes="flex-column justify-content-between align-items-center">
                            <TeamPanel index={index} team={team} currentTeamIndex={currentTeamIndex} deleteTeam={clickedDeleteTeam}/>
                            {
                                index != currentTeamIndex &&
                                <div>
                                    <br />
                                    <ButtonWithOnClickEvent disabled={false} onClick={() => {clickedJoinTeam(index)}} wrapperClass={''} buttonClass={'join-team-button ' + (index == currentTeamIndex ? 'button-disabled' : '')} buttonText={index == currentTeamIndex ? "You are on this team" : 'Join this team'} />
                                </div>
                            }
                        </FlexBox>
                    )
                })}
                {
                !hasEmptyTeam && 
                <div className="text-center">
                        <NewTeamPanel index={teams.length} addTeam={clickedAddNewTeam} />
                </div>
                }
            </FlexBox>
            <FancyHRTitle text={"Spectate or go AFK"} titleClass={""} />
            <div className="mb-3 text-center">
                <div>
                    <LoungePanel currentTeamIndex={currentTeamIndex}/>
                </div>
                {
                    currentTeamIndex != -1 ?
                    <div>
                        <ButtonWithOnClickEvent disabled={false} onClick={clickedJoinLounge} wrapperClass={''} buttonClass={'join-team-button ' + (-1 == currentTeamIndex ? 'button-disabled' : '')} buttonText={-1 == currentTeamIndex ? "You are in the lounge" : 'Join the lounge'} />
                    </div>
                    :
                    <div style={{height: "38px"}}></div>
                    

                }
            </div>
            
            <div className="text-center">
                
            </div>
            
            
        </div>
    )
}

function LoungePanel(props: {currentTeamIndex: number}) {
    const lounge = useSelector(selectGameSettings).lounge;
    return (
        <FlexBox classes={"flex-column lounge " + (props.currentTeamIndex == -1 ? "lounge-selected " : "") + "rounded"}>
            <div>
                The Lounge (spectating)
            </div>
            <FlexBox classes="justify-content-around flex-wrap">
                {lounge.players.map( (player) => {
                    return <Avatar player={player} />
                })}
            </FlexBox>
        </FlexBox>
    )
}

interface ChangeRoleButtonProps {
    onClick: Function,
    role: GameRole
}

function ChangeRoleButton(props: ChangeRoleButtonProps) {
    const player = useSelector(selectPlayer);
    return (
        <div className={"change-role-button-container mr-1" + (player.role == props.role ? " change-role-button-selected": "")} onClick={() => {props.onClick()}}>
            <label>
                <input type="radio" checked={player.role == props.role ? true : false} className={"change-role-button"} />
                <img src={props.role == GameRole.Captain ? wizard : knight} />
            </label>
            
        </div>
    )
}

/* Change role butotn used to have <FontAwesomeIcon icon={props.icon} /></input> as  achild element. NOt sure how to fix without react error. */

/*const x = () => {
    return (
        <div>
            You're in lobby: {lobbySettings.id} which is in phase {lobbySettings.phase} and has members: <br />
            {lobbySettings.members.map( (account) => {
                return (
                    <div key={account.id}>{account.username} who has ID: {account.id}</div>
                )
            })}
            <br />
            Select role
            <ButtonWithOnClickEvent onClick={() => clickedChangeRole(GameRole.Captain)} wrapperClass={''} buttonClass={player.role == GameRole.Captain ? 'disabled' : 'enabled'} buttonText={'Im the captain now'} />
            <ButtonWithOnClickEvent onClick={() => clickedChangeRole(GameRole.Crew)} wrapperClass={''} buttonClass={player.role == GameRole.Crew ? 'disabled' : 'enabled'} buttonText={'Yer quarters be below deck, there be only hardtack fer rations'} />
            <hr />
            Ready up
            <ButtonWithOnClickEvent onClick={clickedChangeReady} wrapperClass={''} buttonClass={'enabled'} buttonText={player.ready ? "un-ready" : "ready up"} />
            The teams are
            {teams.map( (team, index) => {
                return(<TeamElement currentTeamIndex={currentTeamIndex} key={index} team={team} index={index} />)
            })}
            <br />
            Lounge
            {gameSettings.lounge.players.map( (player) => {
                return (
                    <div key={player.account.id}>{player.account.username}:{player.role}:{player.ready + ""}:{player.score}</div>
                )
            })}
            {
                currentTeamIndex != -1 &&
                <ButtonWithOnClickEvent onClick={clickedJoinLounge} wrapperClass={''} buttonClass={'enabled'} buttonText={'Join the lounge'} />
            }
            <ButtonWithOnClickEvent onClick={clickedStartGame} wrapperClass={''} buttonClass={'enabled big'} buttonText={'Start game'} />
            <hr />
                <ButtonWithOnClickEvent onClick={clickedLeaveLobby} wrapperClass={''} buttonClass={''} buttonText={'Leave lobby, return to index'} />
        </div>
    )
} */