import React from 'react'
import { selectNotifications } from '../Store/Reducers/notificationsSlice';
import FlexBox from './FlexBox';
import { useSelector } from 'react-redux';



export default function Notifications() {
    const notifications: {title: string, description: string, type: string} [] = useSelector(selectNotifications);
    return <FlexBox classes="notifications-container flex-column align-items-end justify-content-end">
        {notifications.map((notification, index) => {
            return <div key={"notification-" + index} className={"notification-" + notification.type + " rounded"}><h4>{notification.title}</h4>{notification.description}</div>
        })}
    </FlexBox>
}