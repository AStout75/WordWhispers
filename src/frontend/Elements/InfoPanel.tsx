import React from 'react'
import { useSelector } from 'react-redux';
import { selectLobbySettings } from '../Store/Reducers/lobbySlice';

export interface InfoPanelProps {

}

export default function InfoPanel(props: InfoPanelProps) {
    const lobbySettings = useSelector(selectLobbySettings);
    return (
        <div>
            ID: {lobbySettings.id} |
             Phase: {lobbySettings.phase} |
              Players: {lobbySettings.members.length} |
               Privacy: {lobbySettings.privacy} |
                Type: {lobbySettings.type} |
                 Spectateable: {lobbySettings.canBeSpectated}
        </div>
    )
}