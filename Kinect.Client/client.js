var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var WebSocket = require('ws');

var SERVER = ["ws://localhost:8181"];
var PORT = 3000;

http.listen(PORT, function () {
    console.log('listening on *:3000');
});

var user = [];
var soc = [];
    
for (var i = 0; i < SERVER.length; i++) {
    if (!user[i])
        user[i] = null;
    if (!soc[i])
        soc[i] = null;
    console.log("Connecting to server...");

    // Initialize a new web socket for a kinect server.

    soc[i] = new WebSocket(SERVER[i]);

    // Connection established.
    soc[i].onopen = function () {
        console.log("Connection successful.");
    };

    // Connection closed.
    soc[i].onclose = function () {
        console.log("Connection closed.");
    };
};

io.on('connection', function (socket) {

    console.log("A user is connected");

    for (var i = 0; i < SERVER.length; i++) {

        soc[i].onmessage = function (event) {
            if (typeof event.data === "string") {
                // SKELETON DATA from a single kinect
                // Get the data in JSON format.
                user[i] = JSON.parse(event.data);

                io.emit("update", user);
            }
        }
    }
});