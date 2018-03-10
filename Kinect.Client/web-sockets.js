var SCALE_X = 1/10;
var SCALE_Y = -1/20;
var SCALE_Z = 5;

var OFFSET_X = -30;
var OFFSET_Y = 15;
var OFFSET_Z = -15;

window.onload = function () {
    var scene = document.querySelector("#scene");
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

                    if (joint.name == "handright") 
                        var el = document.querySelector("#right");
                    else if (joint.name == "handleft")
                        var el = document.querySelector("#left");

                    if (joint.name == "handright" || joint.name == "handleft") {
                        var initial = {
                            x: el.getAttribute('position').x,
                            y: el.getAttribute('position').y,
                            z: el.getAttribute('position').z
                        },
                            final = {
                                x: (joint.x * SCALE_X + OFFSET_X),
                                y: (joint.y * SCALE_Y + OFFSET_Y),
                                z: (joint.z * SCALE_Z + OFFSET_Z)
                        }

                        var mesh_coords = initial.x + ' ' + initial.y + ' ' + initial.z + ', ' + final.x + ' ' + final.y + ' ' + final.z;

                        var mesh = document.createElement('a-entity');
                        var mesh_properties = {
                            lineWidth: '10',
                            path: mesh_coords,
                            color: '#E20049'
                        };

                        mesh.setAttribute('meshline', mesh_properties);
                        scene.appendChild(mesh);

                        el.setAttribute('position', final.x + " " + final.y + " " + final.z);
                    }
                }
            }
        }
    };
};