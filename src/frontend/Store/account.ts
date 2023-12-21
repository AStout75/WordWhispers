import { Account } from "../../shared-types/account-types";
import { socket } from "../Socket/socket";
import { updatePlayerAccount } from "./Reducers/playerSlice";
import { store } from "./store";

let account:Account;

export function generateAccount() {
    const d:number = Date.now();
    const dT:string = d.toString().slice(6, 11);
    
    account = {
        id: d.toString(),
        username: "AustinRocks" + dT,
        socketID: socket.id
    }
    socket.on('connect', () => {
        setAccount({...account, socketID: socket.id})
    })
    console.log(account)
    setAccount(account)
    store.dispatch(updatePlayerAccount(account));
}

export function setAccount(newAccount: Account) {
    account = newAccount;
}

export function getAccount():Account {
    return account;
}