import { initHTTPServer, initSocketServer } from "./Server/server";

const server = initHTTPServer();
const io = initSocketServer(server);