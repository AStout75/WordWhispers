import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Notification {
    title: string;
    description: string;
    type: string;
}

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState: [] as Notification[],
    reducers: {
        addNotification: (state, action: PayloadAction<Notification>) => {
            state.push(action.payload);
        },
    },
});

export const { addNotification } = notificationsSlice.actions;

export const selectNotifications = (state: { notifications: Notification[] }) => {
    return state.notifications;
};

export default notificationsSlice.reducer;