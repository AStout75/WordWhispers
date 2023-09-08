import { configureStore } from '@reduxjs/toolkit'
import lobbyReducer from './Reducers/lobbySlice'
import lobbiesReducer from './Reducers/lobbiesSlice'
import playerReducer from './Reducers/playerSlice'

export const store = configureStore({
    reducer: {
        lobby: lobbyReducer,
        lobbies: lobbiesReducer,
        player: playerReducer,
    }
});