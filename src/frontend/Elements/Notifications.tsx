import React from 'react'
import { selectNotifications } from '../Store/Reducers/notificationsSlice';
import FlexBox from './FlexBox';
import { useSelector } from 'react-redux';



export default function Notifications() {
    const notifications = useSelector(selectNotifications);
    console.log("Rendering", notifications)
    return <FlexBox classes="notifications-container flex-column justify-content-end">
        {notifications.map((notification) => {
            return <div className={"notification-" + notification.type + " rounded"}>{notification.title}<br/>{notification.description}</div>
        })}
    </FlexBox>
}