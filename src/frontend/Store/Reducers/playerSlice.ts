import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Account } from "../../../shared-types/account-types";
import { GameLogEntryType, GameRole } from "../../../shared-types/game-types";
import { defaultPlayer, Lobby, Player, PlayerSpeechAction } from "../../../shared-types/lobby-types";

const playerSlice = createSlice({
    name: 'player',
    initialState: {...defaultPlayer},
    reducers: {
        resetPlayer(player) {
            player.role = defaultPlayer.role;
            player.score = defaultPlayer.score;
            player.ready = defaultPlayer.ready;
        },
        updatePlayerAccount(player, action: PayloadAction<Account>) {
            player.account = action.payload;
        },
        updatePlayerRole(player, action: PayloadAction<GameRole>) {
            player.role = action.payload;
        },
        updatePlayerScore(player, action: PayloadAction<number>) {
            player.score = action.payload;
        },
        toggleLocalPlayerReady(player) {
            player.ready = !player.ready;
        },
        /*updatePlayerLocation(player, action: PayloadAction<Player>) {
            player.location = action.payload.location;
        }, */

    }
});

export const { resetPlayer, updatePlayerAccount, updatePlayerRole, toggleLocalPlayerReady, updatePlayerScore } = playerSlice.actions;
export const selectPlayer = (state: {player: Player}) => state.player;
export default playerSlice.reducer;

