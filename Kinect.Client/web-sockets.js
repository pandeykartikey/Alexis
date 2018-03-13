var SCALE_X = 1/10;
var SCALE_Y = -1/20;
var SCALE_Z = 5;

var OFFSET_X = -30;
var OFFSET_Y = 15;
var OFFSET_Z = -15;

var MESH_LINE_WIDTH = '10';
var MESH_DEFAULT_COLOR = '#E20049';

window.onload = function () {
    var scene = document.querySelector("#scene");

    status.innerHTML = "Connecting to server...";

    // Initialize a new socket.
    var socket = io('http://localhost:3000/');

    // Receive data FROM the node server!
    socket.on("update", function (data) {
        // DATA -> data of skeleton from all kinect

        for (var k = 0; k < data.length; k++) {
            var jsonObject = data[k];

            if (!jsonObject)
                continue;

            // Display hands.
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
                            lineWidth: MESH_LINE_WIDTH,
                            path: mesh_coords,
                            color: MESH_DEFAULT_COLOR
                        };

                        mesh.setAttribute('meshline', mesh_properties);
                        scene.appendChild(mesh);

                        el.setAttribute('position', final.x + " " + final.y + " " + final.z);
                    }
                }
            }
        }
    })
    }