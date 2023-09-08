import React from 'react'
import { useSelector } from 'react-redux';
import { Account } from '../../shared-types/account-types';
import { GameSettings, LobbySettings, Team } from '../../shared-types/lobby-types';
import { useSocketContext } from '../Socket/socket-context';
import { sendChangeLocationRequest } from '../Socket/socket-events';
import { getAccount } from '../Store/account';
import { selectGameSettings, selectLobbySettings } from '../Store/Reducers/lobbySlice';
import ButtonWithOnClickEvent from './ButtonWithOnClickEvent';

export interface TeamProps {
    currentTeamIndex: number,
    team: Team,
    index: number
}

export default function TeamElement(props: TeamProps) {
    const socket = useSocketContext();
    const lobbySettings : LobbySettings = useSelector(selectLobbySettings);
    const clickedJoinTeam = (index: number) => {
        sendChangeLocationRequest(socket, getAccount().id, lobbySettings.id, index);
    }
    return(
        <div>Team {props.index + 1}: <br />
            {props.team.players.map( (player) => {
                return (
                    <div key={player.account.id}>{player.account.username}:{player.role}:{player.ready + ''}:{player.score}<br /></div>
                )
            })}
            {
                props.currentTeamIndex != props.index &&
                <ButtonWithOnClickEvent disabled={false} onClick={() => {clickedJoinTeam(props.index)}} wrapperClass={''} buttonClass={'enabled'} buttonText={'Join this team'} />
            }
            <hr />
        </div>
    )
}

