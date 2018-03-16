var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var WebSocket = require('ws');

var SERVER = ["ws://localhost:8181"];
var PORT = 3000;
var HOSTNAME = "0.0.0.0";

http.listen(PORT, HOSTNAME, function () {
    console.log(HOSTNAME, PORT);
});

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static('public'));

app.get('/', function (req, res, next) {
    res.sendfile(__dirname + '/public/index.html');
})

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
                tmp = JSON.parse(event.data);
                if (tmp.hand) {
                    io.emit("action", tmp);
                }
                else {
                    user[i] = tmp;
                    io.emit("update", user);
                }
            }
        }
    }
});