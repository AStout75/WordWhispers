import React, { useState } from 'react'
import ButtonWithOnClickEvent from '../Elements/ButtonWithOnClickEvent';
import { sendCreateLobbyRequest, sendJoinLobbyRequest, sendViewLobbiesRequest } from '../Socket/socket-events';
import { PageType, SetAppPageProps } from '../frontend-types/frontend-types';
import { useSocketContext } from '../Socket/socket-context';
import { useSelector } from 'react-redux';
import { selectLobbySettings } from '../Store/Reducers/lobbySlice';
import { Account } from '../../shared-types/account-types';
import { selectLobbies, selectRefreshDate } from '../Store/Reducers/lobbiesSlice';
import { Lobby, LobbyPrivacy, LobbySettings } from '../../shared-types/lobby-types';
import { getAccount } from '../Store/account';
import FlexBox from '../Elements/FlexBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

export default function LobbiesPage(props: SetAppPageProps) {
    const socket = useSocketContext();
    const lobbySettings: LobbySettings = useSelector(selectLobbySettings);
    
    const [selectedLobbyID, setSelectedLobbyID] = useState("");
    const clickedCreateLobby = () => {
        sendCreateLobbyRequest(socket, getAccount())
    };
    
    const clickedRefreshLobbies = () => {
        sendViewLobbiesRequest(socket);
    };
    
    function joinLobbyButton() {
        const socket = useSocketContext();
        const clickedJoinLobby = (lobbyID:string) => {
            if (lobbyID != "") {
                sendJoinLobbyRequest(socket, getAccount(), lobbyID)
            }
        };
        return(
            <button type="button" className={"big-action-button-slim join-lobby-button " + (selectedLobbyID == "" || lobbySettings.id != "default" ? "join-lobby-button-disabled" : "")} onClick={() => {clickedJoinLobby(selectedLobbyID);}}><FontAwesomeIcon icon={solid("right-to-bracket")} /> Join Lobby</button>
        )
    }
    

    return (
        <div className="mt-5">
            <FlexBox classes={'justify-content-between align-items-center py-3'}>
                <button type="button" className={"big-action-button-slim return-home-button"} onClick={() => {props.setPageState(PageType.Index)}}><FontAwesomeIcon icon={solid("arrow-left")} /> Back</button>
                <button type="button" className={"big-action-button-slim create-lobby-button"} onClick={() => {clickedCreateLobby()}}><FontAwesomeIcon icon={solid("plus")} /> Create Lobby</button>
            </FlexBox>
            <div className="lobbies-panel rounded p-3">
                <FlexBox classes={'justify-content-between pb-3'}>
                    <div className="mr-2">
                        <button type="button" className={"refresh-lobby-button"} onClick={() => {clickedRefreshLobbies()}}><FontAwesomeIcon icon={solid("rotate-right")} /></button>
                    </div>
                    <div className="text-center">
                        <h3>All lobbies</h3>
                        {lastUpdatedAt()}
                    </div>
                    <div>
                        {joinLobbyButton()}
                    </div>
                </FlexBox>
                
                {lobbiesList(selectedLobbyID, setSelectedLobbyID)}
            </div>
            
        </div>
    )
}



function lobbiesList(selectedLobbyID: string, setSelectedLobbyID: Function) {
    const lobbies : Lobby[] = useSelector(selectLobbies);
    const spectateableIcon = (lobby: Lobby) => {
        if (lobby.lobbySettings.canBeSpectated) {
            return (<FontAwesomeIcon icon={solid("eye")} />)
        }
        else {
            return (<FontAwesomeIcon icon={solid("eye-slash")} />)
        }
    };
    const privacyIcon = (lobby: Lobby) => {
        if (lobby.lobbySettings.privacy == LobbyPrivacy.Private) {
            return (<FontAwesomeIcon icon={solid("lock")} />)
        }
        else if (lobby.lobbySettings.privacy == LobbyPrivacy.Public) {
            return (<FontAwesomeIcon icon={solid("globe")} />)
        }
    };

    return (
        <div>
        {lobbies.map( (lobby) => {
                return (
                    <button type="button" className={"select-lobby-button w-100" + (lobby.lobbySettings.id == selectedLobbyID ? " select-lobby-button-selected" : "")} onClick={() => setSelectedLobbyID(selectedLobbyID == lobby.lobbySettings.id ? "" : lobby.lobbySettings.id)} key={lobby.lobbySettings.id}>
                        <FlexBox classes={'flex-wrap justify-content-between lobby-listing'}>
                            <div>
                                {lobby.lobbySettings.id} ({lobby.lobbySettings.owner.username})
                            </div>
                            <div>
                                &nbsp;<FontAwesomeIcon icon={solid("people-group")} /> {lobby.lobbySettings.members.length} / 16 
                                &nbsp;{spectateableIcon(lobby)}
                                &nbsp;{privacyIcon(lobby)}
                            </div>
                        </FlexBox>
                    </button>
                    
                )
            })}
        </div>
    )
}

function lastUpdatedAt() {
    const refreshDate: string = useSelector(selectRefreshDate);
    return (
        <i>Last updated at {refreshDate}</i>
    )
}