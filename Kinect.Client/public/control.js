const RADIUS = 10;

var hand1 = document.getElementById('left');
var hand2 = document.getElementById('right');

var brush = document.getElementById('brush');
var eraser = document.getElementById('eraser');

var color1 = document.getElementById('color1');
var color2 = document.getElementById('color2');
var color3 = document.getElementById('color3');
var color4 = document.getElementById('color4');
var color5 = document.getElementById('color5');
var color6 = document.getElementById('color6');

function changeColor(color, hand){
    if (hand.id === "right" && ALLOWED_TO_DRAW_RIGHT) {
        hand.setAttribute('color', color);
        COLOR_RIGHT = color;
    } else if (ALLOWED_TO_DRAW_LEFT) {
        hand.setAttribute('color', color);
        COLOR_LEFT = color;
    }
}	


function checkCollision(color, hand, call_func) {
    if (color.getAttribute('position') && hand.getAttribute('position')) {
        var pos1 = color.getAttribute('position'),
    	pos2 = hand.getAttribute('position');

        var x1 = pos1.x,
            x2 = pos2.x,
            y1 = pos1.y,
            y2 = pos2.y,
            z1 = pos1.z,
            z2 = pos2.z;

        if ((Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2))) < RADIUS) {
            call_func(color.getAttribute('color'), hand);
        }
    }
	setTimeout(checkCollision.bind(this, color, hand, call_func), 200);
}

checkCollision(color1, hand1, changeColor);
checkCollision(color2, hand1, changeColor);
checkCollision(color3, hand1, changeColor);
checkCollision(color4, hand1, changeColor);
checkCollision(color5, hand1, changeColor);
checkCollision(color6, hand1, changeColor);

checkCollision(color1, hand2, changeColor);
checkCollision(color2, hand2, changeColor);
checkCollision(color3, hand2, changeColor);
checkCollision(color4, hand2, changeColor);
checkCollision(color5, hand2, changeColor);
checkCollision(color6, hand2, changeColor);
var debug_scale = 0.5;
document.addEventListener('keypress', (event) => {
    var pos = hand1.getAttribute('position');
    const key = event.code;
    if (key == "KeyI")
        hand1.setAttribute('position', pos.x + " " + (pos.y +debug_scale)+ " " + pos.z);
    if (key == "KeyK")
        hand1.setAttribute('position', pos.x + " " + (pos.y -debug_scale)+ " " + pos.z);
    if (key == "KeyJ")
        hand1.setAttribute('position', (pos.x -debug_scale) + " " + pos.y + " " + pos.z);
    if (key == "KeyL")
        hand1.setAttribute('position', (pos.x +debug_scale) + " " + pos.y + " " + pos.z);
    if (key == "KeyR")
        hand1.setAttribute('position', pos.x + " " + pos.y + " " + (pos.z-debug_scale));
    if (key == "KeyT")
        hand1.setAttribute('position', pos.x + " " + pos.y + " " + (pos.z+debug_scale));   

    var start = hand1.getAttribute('position');
    var end = document.getElementById("camera").getAttribute('position');
    var vec = {
                                x: - start.x + end.x,
                                y: - start.y + end.y,
                                z: - start.z + end.z,
                            }; 
    var len = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);


    var t_vec = new THREE.Vector3(vec.x, vec.y, vec.z);
    var rotation = {
        x: t_vec.angleTo(new THREE.Vector3(1, 0, 0)) * 180 / Math.PI,
        y: t_vec.angleTo(new THREE.Vector3(0, 1, 0)) * 180 / Math.PI,
        z: t_vec.angleTo(new THREE.Vector3(0, 0, -1)) * 180 / Math.PI
    };

    var cyl_pos = {
        x: start.x + vec.x/2,
        y: start.y + vec.y/2,
        z: start.z + vec.z/2,
    };
    //    var cyl_pos = {
    //     x: start.x,
    //     y: start.y,
    //     z: start.z,
    // }

    var pointX = new THREE.Vector3(start.x, start.y, start.z);
    var pointY = new THREE.Vector3(end.x, end.y, end.z);
    var direction = new THREE.Vector3().subVectors( pointY, pointX );
    var arrow = new THREE.ArrowHelper( direction, pointX );

    var rot = {
        x: arrow.rotation.x * 180 / Math.PI,
        y: arrow.rotation.y * 180 / Math.PI,
        z: arrow.rotation.z * 180 / Math.PI,
    };


    document.querySelector("#detect-ray").setAttribute('position', cyl_pos.x + " " + cyl_pos.y + " " + cyl_pos.z);
    document.querySelector("#detect-ray").setAttribute('rotation', rot);
    document.querySelector("#detect-ray").setAttribute('height', len);

});
