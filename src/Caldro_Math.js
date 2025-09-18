"use strict";
import { limit } from "./Caldro_Utility_Functions";

 // Math
export const ROOT_1_2 = Math.sqrt(0.5)
export const ROOT_2 = Math.sqrt(2)
export const ROOT_3 = Math.sqrt(3)
export const PI_2 = Math.PI*2;

export function degToRad(degree) {
	return degree * (Math.PI / 180);
}

export function radToDeg(radians) {
	return (radians * 180) / Math.PI;
}

export function tan(angle) {
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

export function tanInverse(ratio) {
	return radToDeg(Math.atan((ratio)))
}

export function sine(angle) {
	return (Math.sin(degToRad(angle)))
}

export function cosine(angle) {
	return (Math.cos(degToRad(angle)))
}


export function slope(point1, point2) {
	return (point2.y - point1.y) / (point2.x - point1.x)
}

export function toDecimalPlace(num, decimalPlace = 0) {
	return parseFloat(num.toFixed(decimalPlace))
}

export function scaleTo(number = 5, numberMin = 0, numberMax = 10, scaleMin = 0, scaleMax = 1, limitNumberToMinAndMax = false) {
	if(limitNumberToMinAndMax){
		number = limit(number, numberMin, numberMax)
	}
	let percentage = (number - numberMin) / (numberMax - numberMin)
	return interpolate(percentage, scaleMin, scaleMax)
}

export function wrapNumber(number, min, max){
	return min + (number % (max - min))
}

// console.log("warrinia: ", wrapNumber(-2, 5, 10))

export function approach(number = 10, destination = 0, speed = 0.2, deltatime = Caldro.time.deltatime, margin = 0.001) {
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

export function interpolate(decimal_percentage = 0.5, minNumber = 0, maxNumber = 1) {
	return minNumber + (maxNumber - minNumber) * (decimal_percentage);
}

export function interpolatePoints(pointsArray, percentage) {
	let i = Math.floor(pointsArray.length * (percentage / 100))
	let point1 = points[i]
	let point2 = points[i + 1]
	if (point2) {
		return {
			x: interpolate(percentage, point1.x, point2.x),
			y: interpolate(percentage, point1.y, point2.y)
		}
	} else {
		return point1
	}
}

export function clip(value, lowerLimit = 0, higherLimit = 1) {
	return Math.max(lowerLimit, Math.min(value, higherLimit))
}



export function roundToSignificantFigure(number, numberPlace = 0, fromNumberEnd = true) {
	/// if we are starting the significant figure search from the cmd of the number instead, effectively rounding up but for integers (in base 10)
	if (!fromNumberStart) {
		numberPlace = (`${number}`).length - numberPlace
	}
	/// devie by 10 * numberoplace to get a decimal, then Maht.round it to get the integer, then multiply by the inital devision to get the number back to the number place it was
	number = Math.round(number / (10 ** numberPlace)) * (10 ** numberPlace)
	return number
}

export function floorToSignificantFigure(number, numberPlace = 0, fromNumberEnd = true) {
	/// if we are starting the significant figure search from the cmd of the number instead, effectively flooring down but for integers (in base 10)
	if (!fromNumberStart) {
		numberPlace = (`${number}`).length - numberPlace
	}
	/// devie by 10 * numberoplace to get a decimal, then Maht.round it to get the integer, then multiply by the inital devision to get the number back to the number place it was
	number = Math.floor(number / (10 ** numberPlace)) * (10 ** numberPlace)
	return number
}

export function ceilToSignificantFigure(number, numberPlace = 0, fromNumberEnd = true) {
	/// if we are starting the significant figure search from the cmd of the number instead, effectively ceiling up but for integers (in base 10)
	if (!fromNumberStart) {
		numberPlace = (`${number}`).length - numberPlace
	}
	/// devie by 10 * numberoplace to get a decimal, then Maht.round it to get the integer, then multiply by the inital devision to get the number back to the number place it was
	number = Math.ceil(number / (10 ** numberPlace)) * (10 ** numberPlace)
	return number
}

export function floorToNearestMutliple(number, multiple) {
	/// e.g 11 % 5 would give 1
	let multipleDifference = number % multiple;
	// flooring down the number to the nearest multiple
	return number - multipleDifference
}

export function ceilToNearestMutliple(number, multiple) {
	/// e.g 11 % 5 would give 1
	let multipleDifference = number % multiple;
	// ceiling up the number to the nearest multiple
	return number + (multiple - multipleDifference)
}

export function roundToNearestMutliple(number, multiple, favourFloor = true) {
	/// e.g 11 % 5 would give 1
	let multipleDifference = number % multiple;

	if (favourFloor) {
		// rounding up or down the number to the nearest multiple favouring Flooriing (<=)
		if (multipleDifference <= multiple / 2) {
			return number - multipleDifference
		} else {
			return number + (multiple - multipleDifference)
		}
	} else {
		// rounding up or down the number to the nearest multiple favouring ceiling (<)
		if (multipleDifference < multiple / 2) {
			return number - multipleDifference
		} else {
			return number + (multiple - multipleDifference)
		}
	}
}