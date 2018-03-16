var SCALE_X = 1 / 10;
var SCALE_Y = -1 / 15;
var SCALE_Z = 10;

var OFFSET_X = -30;
var OFFSET_Y = 15;
var OFFSET_Z = -30;

var ALLOWED_TO_DRAW_LEFT = false;
var ALLOWED_TO_DRAW_RIGHT = false;

var MESH_LINE_WIDTH = '10';
var COLOR_LEFT = '#E20049';
var COLOR_RIGHT = '#E20049';

var SOCKET_URL = window.location.origin;
var actionFunction = draw;

function draw(initial, final, scene, el, hand) {

    var mesh_coords = initial.x + ' ' + initial.y + ' ' + initial.z + ', ' + final.x + ' ' + final.y + ' ' + final.z;

    var mesh = document.createElement('a-entity');
    var mesh_properties = {
        lineWidth: MESH_LINE_WIDTH,
        path: mesh_coords,
        color: (hand === "handright") ? COLOR_RIGHT: COLOR_LEFT
    };
    mesh.setAttribute('meshline', mesh_properties);
    mesh.setAttribute('class', 'mesh');
    scene.appendChild(mesh);
}

function erase(initial, final, scene, el) {
    var mesh = document.getElementsByClassName('mesh');
    for (var counter = 0; counter < mesh.length; counter++) {
        var line = mesh[counter];

        var meshline = line.getAttribute('meshline');

        var path = meshline.path;
        var line_coords_1 = {
            x: path[0].x,
            y: path[0].y,
            z: path[0].z
        },
            line_coords_2 = {
                x: path[1].x,
                y: path[1].y,
                z: path[1].z
            },

            x1 = final.x,
            x2 = line_coords_1.x,
            x3 = line_coords_2.x,
            y1 = final.y,
            y2 = line_coords_1.y,
            y3 = line_coords_2.y,
            z1 = final.z,
            z2 = line_coords_1.z,
            z3 = line_coords_2.z,
            dist_1 = (Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2) + Math.pow((z1 - z2), 2))),
            dist_2 = (Math.sqrt(Math.pow((x1 - x3), 2) + Math.pow((y1 - y3), 2) + Math.pow((z1 - z3), 2)));

        if (dist_1 < RADIUS|| dist_2 < RADIUS) {
            line.remove();
        }

        el.setAttribute('position', final.x + " " + final.y + " " + final.z);
    }
}

window.onload = function () {
    var scene = document.querySelector("#scene");
    
    var jointsArray = {
        "handright": [],
        "handleft": []
    };
    var smoothness = 5;

    status.innerHTML = "Connecting to server...";

    // Initialize a new socket.
    var socket = io(SOCKET_URL);

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
                            x:'',y:'',z:''
                        };
                        if (el.getAttribute('position')) {
                            initial = {
                                x: el.getAttribute('position').x,
                                y: el.getAttribute('position').y,
                                z: el.getAttribute('position').z
                            }
                        }
                        var final = {
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

                        if (initial.x && initial.y && initial.z && ((ALLOWED_TO_DRAW_LEFT && joint.name == "handleft") || (ALLOWED_TO_DRAW_RIGHT && joint.name == "handright")))
                            actionFunction(initial, final, scene, el, joint.name);
                    }
                }
            }
        }
    })

    socket.on("action", function (data) {
        if (data.action === "gripped") {
            if(data.hand == "left")
            ALLOWED_TO_DRAW_LEFT = true;
            if(data.hand == "right")
            ALLOWED_TO_DRAW_RIGHT = true;
        }
        if (data.action === "released") {
            if (data.hand == "left")
            ALLOWED_TO_DRAW_LEFT = false;
            if (data.hand == "right")
            ALLOWED_TO_DRAW_RIGHT = false;
        }
    })
}