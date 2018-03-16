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
    hand.setAttribute('color', color);
    if (hand.id === "right") {
        COLOR_RIGHT = color;
    } else {
        COLOR_LEFT = color;
    }
	MESH_DEFAULT_COLOR = color;
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

