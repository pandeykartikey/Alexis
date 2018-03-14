const radius = 0.5;

var hand1 = document.getElementById('left');
var hand2 = document.getElementById('right');

var color1 = document.getElementById('color1');
var color2 = document.getElementById('color2');
var color3 = document.getElementById('color3');
var color4 = document.getElementById('color4');
var color5 = document.getElementById('color5');
var color6 = document.getElementById('color6');
var color7 = document.getElementById('color7');

function changeColor(color, hand){
	console.log(color);
	hand.setAttribute('color', color);
}	


function checkCollision(color, hand, call_func){

	var pos1 = color.getAttribute('position'),
	pos2 = hand.getAttribute('position');
	console.log(JSON.stringify(pos1)+JSON.stringify(pos2));
	var x1 = pos1.x,
	x2 = pos2.x,
	y1 = pos2.y,
	y2 = pos1.y,
	z1 = pos2.z,
	z2 = pos1.z;

	if((Math.sqrt(Math.pow((x1-x2),2) + Math.pow((y1-y2),2) + Math.pow((z1-z2),2))) < radius){
		var setColor = color.getAttribute('color');
		console.log((Math.sqrt(Math.pow((x1-x2),2) + Math.pow((y1-y2),2) + Math.pow((z1-z2),2))));
		call_func(setColor, hand);
	}

	setTimeout(checkCollision.bind(this, color, hand, call_func), 200);
}

checkCollision(color1, hand1, changeColor);
checkCollision(color2, hand1, changeColor);
checkCollision(color3, hand1, changeColor);
checkCollision(color4, hand1, changeColor);
checkCollision(color5, hand1, changeColor);
checkCollision(color6, hand1, changeColor);
checkCollision(color7, hand1, changeColor);

checkCollision(color1, hand2, changeColor);
checkCollision(color2, hand2, changeColor);
checkCollision(color3, hand2, changeColor);
checkCollision(color4, hand2, changeColor);
checkCollision(color5, hand2, changeColor);
checkCollision(color6, hand2, changeColor);
checkCollision(color7, hand2, changeColor);