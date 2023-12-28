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
    /*for (let i = 0; i < teams.length; i++) {
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
    } */
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
            <FlexBox classes={'justify-content-between align-items-center py-3'}>
                <button type="button" className={"big-action-button-slim return-home-button"} onClick={() => {clickedLeaveLobby(); props.setPageState(PageType.Lobbies)}}><FontAwesomeIcon icon={solid("arrow-left")} /> Back</button>
                <ButtonWithOnClickEvent disabled={!canStart} onClick={clickedStartGame} wrapperClass={'d-inline-block'} buttonClass={'big-action-button-slim start-game-button' + (canStart ? " start-game-button-enabled" : "")} buttonText={"Start"} />
            </FlexBox>
            <FlexBox classes={'lobby-settings-panel justify-content-between align-items-center rounded'}>
                <FlexBox classes={""}>
                    <form className="d-flex">
                        <FlexBox classes="change-role-container align-items-center">
                            <ChangeRoleButton onClick={() => clickedChangeRole(GameRole.Captain)} role={GameRole.Captain} />
                            <ChangeRoleButton onClick={() => clickedChangeRole(GameRole.Crew)} role={GameRole.Crew} />
                        </FlexBox>
                    </form>
                </FlexBox>
                <button type="button" className={"ready-button" + (player.ready ? " ready-button-depressed" : "")} onClick={() => clickedChangeReady()}>{player.ready ? "Ready!" : "Ready up"}</button>
            </FlexBox>
            <FancyHRTitle text={"Join a team"} titleClass={""} />
            <FlexBox classes={'flex-wrap teams-container'}>
                {teams.map( (team, index) => {
                    return(
                        <FlexBox classes="flex-column justify-content-between align-items-center" key={"team-" + index}>
                            <TeamPanel index={index} team={team} currentTeamIndex={currentTeamIndex} deleteTeam={clickedDeleteTeam}/>
                            {
                                index != currentTeamIndex &&
                                <div>
                                    <ButtonWithOnClickEvent disabled={false} onClick={() => {clickedJoinTeam(index)}} wrapperClass={''} buttonClass={'join-team-button ' + (index == currentTeamIndex ? 'button-disabled' : '')} buttonText={index == currentTeamIndex ? "You are on this team" : 'Join this team'} />
                                </div>
                            }
                        </FlexBox>
                    )
                })}
                {
                !hasEmptyTeam && 
                <FlexBox classes="flex-column justify-content-between align-items-center">
                    <NewTeamPanel index={teams.length} addTeam={clickedAddNewTeam} />
                    <div>
                        <div className="new-team-plus-button" onClick={() => clickedAddNewTeam()}>
                            <FontAwesomeIcon icon={solid("plus")}/>
                        </div>
                    </div>
                    
                </FlexBox>
                }
            </FlexBox>
            <FancyHRTitle text={"Spectate or go AFK"} titleClass={""} />
            <div className="text-center">
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
            <FlexBox classes="justify-content-start flex-wrap">
                {lounge.players.map( (player) => {
                    return <Avatar player={player} key={"avatar-" + player.account.id} />
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
                <input type="radio" defaultChecked={player.role == props.role ? true : false} className={"change-role-button"} />
                <img src={props.role == GameRole.Captain ? wizard : knight} />
            </label>
        </div>
    )
}