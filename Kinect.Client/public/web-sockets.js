var SCALE_X = 1 / 10;
var SCALE_Y = -1 / 20;
var SCALE_Z = 20;

var OFFSET_X = -30;
var OFFSET_Y = 15;
var OFFSET_Z = -30;

var ALLOWED_TO_DRAW_LEFT = false;
var ALLOWED_TO_DRAW_RIGHT = false;

var MESH_LINE_WIDTH = '10';
var MESH_DEFAULT_COLOR = '#E20049';

function fist(){
}

function draw(initial, final, scene, el){

    var mesh_coords = initial.x + ' ' + initial.y + ' ' + initial.z + ', ' + final.x + ' ' + final.y + ' ' + final.z;

    var mesh = document.createElement('a-entity');
    var mesh_properties = {
        lineWidth: MESH_LINE_WIDTH,
        path: mesh_coords,
        color: MESH_DEFAULT_COLOR
    };

    mesh.setAttribute('meshline', mesh_properties);
    mesh.setAttribute('class', 'mesh');
    scene.appendChild(mesh);
}

function erase(initial, final, scene, el) {
    document.getElementsByClassName('mesh');
    for (line in mesh) {
        var line_coords = {
            x: line_coords.getAttribute('position').x,
            y: line_coords.getAttribute('position').y,
            z: line_coords.getAttribute('position').z
        },

            x1 = final.x,
            x2 = line_coords.x,
            y1 = final.y,
            y2 = line_coords.y,
            z1 = final.z,
            z2 = line_coords.z,
            dist = (Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2) + Math.pow((z1 - z2), 2)));

        if (dist < radius) {
            line.remove();
        }

    } 
}

window.onload = function () {
    var scene = document.querySelector("#scene");
    var actionFunction = draw;
    var jointsArray = {
        "handright": [],
        "handleft": []
    };
    var smoothness = 5;

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
                            };

                        if (initial.x && initial.y && initial.z) {
                            if (jointsArray[joint.name].length === smoothness) {
                                var temp = jointsArray[joint.name].shift();
                                jointsArray[joint.name].push(final);

                                final.x = ((initial.x * smoothness) - temp.x + final.x) / smoothness;
                                final.y = ((initial.y * smoothness) - temp.y + final.y) / smoothness;
                                final.z = ((initial.z * smoothness) - temp.z + final.z) / smoothness;
                            }
                            else {
                                jointsArray[joint.name].push(final);
                            }
                        }

                        el.setAttribute('position', final.x + " " + final.y + " " + final.z);

                        if (initial.x && initial.y && initial.z && ALLOWED_TO_DRAW_RIGHT && ALLOWED_TO_DRAW_RIGHT)
                            actionFunction(initial, final, scene, el);

                    }
                }
            }
        }
    })

    socket.on("action", function (data) {
        console.log(data);
        if (data.action === "gripped") {
            ALLOWED_TO_DRAW_LEFT = true;
            ALLOWED_TO_DRAW_RIGHT = true;
        }
        if (data.action === "released") {
            ALLOWED_TO_DRAW_LEFT = false;
            ALLOWED_TO_DRAW_RIGHT = false;
        }
    })
}