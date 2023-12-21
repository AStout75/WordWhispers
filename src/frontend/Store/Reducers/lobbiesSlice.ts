import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Lobby } from "../../../shared-types/lobby-types";

const lobbiesSlice = createSlice({
    name: 'lobbies',
    initialState: {val: [] as Lobby[], refreshDate: new Date()}, // Initialize refreshDate with a new Date object
    reducers: {
        refreshLobbies: (state, action: PayloadAction<Lobby[]>) => {
            const newLobbies: Lobby[] = action.payload;
            state.val = [...newLobbies];
        },
        setRefreshDate: (state, action: PayloadAction<Date>) => {
            state.refreshDate = action.payload;
        }
    }
});

export const { refreshLobbies, setRefreshDate } = lobbiesSlice.actions;
export const selectLobbies = (state: {lobbies: {val: Lobby[]}}) => state.lobbies.val;
export const selectRefreshDate = (state: {lobbies: {refreshDate: Date}}) => state.lobbies.refreshDate;
export default lobbiesSlice.reducer;