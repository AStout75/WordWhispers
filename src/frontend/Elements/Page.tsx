import React from 'react'
import { useSelector } from 'react-redux';
import IndexPage from '../Pages/IndexPage';
import LobbiesPage from '../Pages/LobbiesPage';
import LobbyPage from '../Pages/LobbyPage';
import QueuePage from '../Pages/QueuePage';
import { selectLobbySettings } from '../Store/Reducers/lobbySlice';
import { PageProps, PageType, SetAppPageProps } from '../frontend-types/frontend-types';
import { QueueType } from '../../shared-types/misc-types';
import GamePage from '../Pages/GamePage';

export default function Page(props: PageProps) {
    const lobbySettings = useSelector(selectLobbySettings);
    if (props.page == PageType.Lobbies) {return <LobbiesPage setPageState={props.setPageState}/>}
    if (props.page == PageType.Lobby) {return <LobbyPage setPageState={props.setPageState} />}
    if (props.page == PageType.Queue) {return <QueuePage setPageState={props.setPageState} defaultQueueType={QueueType.Casual}/>}
    if (props.page == PageType.Game) {return <GamePage setPageState={props.setPageState} />}
    return <IndexPage setPageState={props.setPageState}/>;
}