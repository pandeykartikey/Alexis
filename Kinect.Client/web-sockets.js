var SCALE_X = 1/20;
var SCALE_Y = -1/100;
var SCALE_Z = -5;

var OFFSET_X = -15;
var OFFSET_Y = 5;

window.onload = function () {

    if (!window.WebSocket) {
        status.innerHTML = "Your browser does not support web sockets!";
        return;
    }

    status.innerHTML = "Connecting to server...";

    // Initialize a new web socket.
    var socket = new WebSocket("ws://localhost:8181");

    // Connection established.
    socket.onopen = function () {
        status.innerHTML = "Connection successful.";
    };

    // Connection closed.
    socket.onclose = function () {
        status.innerHTML = "Connection closed.";
    }

    // Receive data FROM the server!
    socket.onmessage = function (event) {
        if (typeof event.data === "string") {
            // SKELETON DATA

            // Get the data in JSON format.
            var jsonObject = JSON.parse(event.data);

            // Display the skeleton joints.
            for (var i = 0; i < jsonObject.skeletons.length; i++) {
                for (var j = 0; j < jsonObject.skeletons[i].joints.length; j++) {
                    var joint = jsonObject.skeletons[i].joints[j];
                    if (joint.name == "handright") {
                        var el = document.querySelector("#right");
                        el.setAttribute('position', joint.x * SCALE_X + OFFSET_X + " " + (joint.y * SCALE_Y + OFFSET_Y) + " " + joint.z * SCALE_Z);
                    } else if (joint.name == "handleft") {
                        var el = document.querySelector("#left");
                        el.setAttribute('position', joint.x * SCALE_X + OFFSET_X + " " + (joint.y * SCALE_Y + OFFSET_Y) + " " + joint.z * SCALE_Z);
                    }
                }
            }
        }
        else if (event.data instanceof Blob) {
            // RGB FRAME DATA
            // 1. Get the raw data.
            var blob = event.data;

            // 2. Create a new URL for the blob object.
            window.URL = window.URL || window.webkitURL;

            var source = window.URL.createObjectURL(blob);

            // 3. Update the image source.
            camera.src = source;

            // 4. Release the allocated memory.
            window.URL.revokeObjectURL(source);
        }
    };
};