"use strict"; // Math
function degToRad(degree) {
	return degree * (Math.PI / 180);
}

function radToDeg(radians) {
	return (radians * 180) / Math.PI;
}

function tan(angle) {
	if (angle == 180) {
		return 0;
	} else if (angle == 360) {
		return 0;
	} else if (angle == 90 || angle == 270) {
		return "Invalid Input :(";
	} else {
		return (Math.tan(degToRad(angle)))
	}
}

function tanInverse(ratio) {
	return radToDeg(Math.atan((ratio)))
}

function sine(angle) {
	return (Math.sin(degToRad(angle)))
}

function cosine(angle) {
	return (Math.cos(degToRad(angle)))
}


function slope(point1, point2) {
	return (point2.y - point1.y) / (point2.x - point1.x)
}

function toDecimalPlace(num, decimalPlace = 0) {
	return parseFloat(num.toFixed(decimalPlace))
}

function scaleTo(number = 5, numberMin = 0, numberMax = 10, scaleMin = 0, scaleMax = 1) {
	let percentage = (number - numberMin) / (numberMax - numberMin)
	return interpolate(percentage, scaleMin, scaleMax)
}

function approach(number = 10, destination = 0, speed = 0.2, deltatime = Caldro.time.deltatime, margin = 0.001) {
	let arrived = false
	if (Math.abs(destination - number) < margin) {
		arrived = true;
		number = destination
	} else {
		speed = 1 / (1 + (deltatime * speed))
		number = destination + (number - destination) * speed;
	}
	return { value: number, arrived: arrived };
}

function interpolate(decimal_percentage = 0.5, minNumber = 0, maxNumber = 1) {
	return minNumber + (maxNumber - minNumber) * (decimal_percentage);
}

function clip(value, lowerLimit = 0, higherLimit = 1) {
	return Math.max(lowerLimit, Math.min(value, higherLimit))
}

