import { Account } from "../../shared-types/account-types";
import { updatePlayerAccount } from "./Reducers/playerSlice";
import { store } from "./store";

let account:Account;

export function generateAccount() {
    const d:number = Date.now();
    const dT:string = d.toString().slice(5, 11);
    account = {
        id: "austin" + dT,
        username: "austin" + dT
    }
    store.dispatch(updatePlayerAccount(account));
}

export function getAccount():Account {
    return account;
}