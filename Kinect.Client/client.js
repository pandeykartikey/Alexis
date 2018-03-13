const http = require('http');
const io = require('socket.io');
var W3CWebSocket = require('websocket').w3cwebsocket;

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World\n');
});

server.listen(port, hostname);
const SERVER = ["ws://localhost:8181"];

var user = [];

//for (var i = 0; i <= SERVER.length; i++) {
//    client[i] = new WebSocket(CLIENT[i]);
//}
    

for (var i = 0; i <= SERVER.length; i++) {
    if (!user[i])
        user[i] = {};

    console.log("Connecting to server...");

    // Initialize a new web socket.

    var socket = new W3CWebSocket(SERVER[i], 'echo-protocol');

    
    // Connection established.
    socket.onopen = function () {
        console.log("Connection successful.");
    };

    // Connection closed.
    socket.onclose = function () {
        console.log("Connection closed.");
    }

    // Receive data FROM the server!
    socket.onmessage = function (event) {
        if (typeof event.data === "string") {
            // SKELETON DATA

            // Get the data in JSON format.
            user[i] = JSON.parse(event.data);
            io.emit(user[i]);
        }
    }
}
