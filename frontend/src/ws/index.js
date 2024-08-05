
import { SocketClient } from '../common/socketUtility';
import { CONFIG } from '../common/socketConfig';

const WEBSOCKET_HOST = "ws://localhost:8080/api/ws";
export const socket = new SocketClient(null, CONFIG);
function connect(){
    socket.ws = new WebSocket(WEBSOCKET_HOST);
}
socket.on("disconnect", () => {
    console.log("disconnected, reconnecting in 1 second")
    setTimeout(function() {
        connect();
    }, 1000);
});
socket.on("error", (e) => {
    socket.disconnect();
});
export const onConnect = (callback) => {
    socket.on("connect", callback);
    return () => {
        socket.removeListener("connect", callback);
    }
}
export const onDisconnect = (callback) => {
    socket.on("disconnect", callback);
    return () => {
        socket.removeListener("disconnect", callback);
    }
}
export const onProperties = (callback) => {
    socket.on("properties", callback);
    return () => {
        socket.removeListener("properties", callback);
    }
}
export const onGuessResult = (callback) => {
    socket.on("guessResult", callback);
    return () => {
        socket.removeListener("guessResult", callback);
    }
}
export const emitGuess = (guess) => {
    socket.emit("guess", { guess });
}
connect();