import React, { useState } from 'react'
import ButtonWithOnClickEvent from '../Elements/ButtonWithOnClickEvent';
import { sendJoinQueueCasualRequest, sendJoinQueueRankedRequest, sendLeaveQueueRequest } from '../Socket/socket-events';
import { PageType, QueuePageProps} from '../frontend-types/frontend-types';
import { useSocketContext } from '../Socket/socket-context';
import { QueueType } from '../../shared-types/misc-types';

export default function QueuePage(props: QueuePageProps) {
    const socket = useSocketContext();
    const [queueType, setQueueType] = useState(props.defaultQueueType);
    const sendJoinCorrespondingQueueRequest = () => {
        if (queueType == QueueType.Casual) {sendJoinQueueCasualRequest(socket);}
        else if (queueType == QueueType.Ranked) {sendJoinQueueRankedRequest(socket);}
    }
    return (
        <div>
            <p>You are set to join a {queueType} queue</p>
            <ButtonWithOnClickEvent disabled={false} onClick={() => setQueueType(QueueType.Ranked)} wrapperClass={''} buttonClass={''} buttonText={'Select Ranked Queue'} />
            <ButtonWithOnClickEvent disabled={false} onClick={() => setQueueType(QueueType.Casual)} wrapperClass={''} buttonClass={''} buttonText={'Select Casual Queue'} />
            <ButtonWithOnClickEvent disabled={false} onClick={() => {sendJoinCorrespondingQueueRequest(); props.setPageState(PageType.Queue)}} wrapperClass={''} buttonClass={''} buttonText={'Play'} />
            <ButtonWithOnClickEvent disabled={false} onClick={() => {sendLeaveQueueRequest(socket)}} wrapperClass={''} buttonClass={''} buttonText={'Leave queue'} />
            <ButtonWithOnClickEvent disabled={false} onClick={() => {props.setPageState(PageType.Index);}} wrapperClass={''} buttonClass={''} buttonText={'Return'} />
        
        </div>

    
    )
}