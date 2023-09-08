import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Lobby } from "../../../shared-types/lobby-types";

const lobbiesSlice = createSlice({
    name: 'lobbies',
    initialState: {val: [] as Lobby[]}, //just couldn't get `initialState: [] as Lobby` to work, it wouldn't recognize reassignments as a state change. Bullshit
    reducers: {
        refreshLobbies(lobbies: {val: Lobby[]}, action: PayloadAction<Lobby[]>) {
            const newLobbies: Lobby[] = action.payload;
            lobbies.val = [...newLobbies];
        }
    }
});

export const { refreshLobbies } = lobbiesSlice.actions;
export const selectLobbies = (state: {lobbies: {val: Lobby[]}}) => state.lobbies.val;
export default lobbiesSlice.reducer;