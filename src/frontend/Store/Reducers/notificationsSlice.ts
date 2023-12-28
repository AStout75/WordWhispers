import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState: [] as {title: string, description: string, type: string} [],
    reducers: {
        addNotification(notifications, action: PayloadAction<{title: string, description: string, type: string}>) {
            console.log("Adding", action.payload)
            notifications = [...notifications, action.payload];
        },
    }
});

export const { addNotification } = notificationsSlice.actions;

export const selectNotifications = (state: {notifications: {title: string, description: string, type: string} []}) => state.notifications;
export default notificationsSlice.reducer;