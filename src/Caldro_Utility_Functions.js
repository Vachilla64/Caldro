"use strict";
import { ceilToNearestMutliple, floorToNearestMutliple } from "./Caldro_Math";
import { vec2D } from "./Caldro_Vectors_and_Matrices";

// Utility_Functions

export const doings = {
	ids: [],
	tasks: [],
};
export function getTask(id) {
	return doings.tasks[id];
}
export function doTask(id, what = function () { }, onlyIf = true, maxCallCount = 1, frequencyInMS = null) {
	if (onlyIf) {
		let newTask = doings.ids.includes(id);
		let condition = !newTask;
		if (condition) {
			what();
			doings.ids.push(id);
			doings.tasks[id] = {
				calls: 1,
				performed: 1,
				frequencyInMS: frequencyInMS,
				id: id,
				maxCallCount: maxCallCount,
				passedTime: 0,
				timeOFLastCall: 0,
			};
		} else {
			++doings.tasks[id].calls;
			let task = doings.tasks[id];
			if (task.performed < task.maxCallCount) {
				let time = window.performance.now();
				let task = doings.tasks[id];
				if (task.frequencyInMS) {
					if ((time - task.timeOFLastCall) < task.frequencyInMS) {
						return;
					}
				}
				what();
				task.timeOFLastCall = time
				++task.performed;
			};
		}
		return condition;
	}
	return onlyIf;
}

export function clearDoTask(id = 'Vachila64') {
	for (let i in doings.ids) {
		if (doings.ids[i] == id) {
			doings.ids.splice(i, 1)
			doings.tasks[id] == undefined;
			return true;
		}
	}
	return false;
}

export function clearAllTasks() {
	doings.ids.length = doings.tasks.length = 0;
}

export function getDoTask(id) {
	return doings.tasks[id];
}


let timedTasks = new Array();
export function timeoutTask(task, timeout, oneshotTask = true) {
	let Task = {
		task: task,
		timeout: timeout / 1000,
		time: 0,
		isOneShot: oneshotTask
	}
	timedTasks.push(Task)
	return Task;
}
export function deleteTimeoutTask(task) {
	timedTasks = timedTasks.filter((Task) => {
		return task != Task
	})
}
export function updateTimedTasks() {
	for (let task of timedTasks) {
		task.time += Caldro.time.deltatime;
		if (task.time > task.timeout) {
			task.task();
			if (task.isOneShot) {
				task.toDelete = true;
			}
		}
	}
	timedTasks = timedTasks.filter((task) => {
		return !task.toDelete
	})
}




export var secMap = {
	second: 1
}
secMap["minute"] = 60
secMap["hour"] = 60 * secMap.minute;
secMap["day"] = 24 * secMap.hour;
secMap["week"] = 7 * secMap.day;
secMap["month"] = 30 * secMap.week;
secMap["year"] = 12 * secMap.month;

export var timeMap = [
	{
		name: "second",
		valueInSeconds: 1
	},
	{
		name: "minute",
		valueInSeconds: secMap["minute"]
	},
	{
		name: "hour",
		valueInSeconds: secMap['hour']
	},
	{
		name: "day",
		valueInSeconds: secMap['day']
	},
	{
		name: "week",
		valueInSeconds: secMap['week']
	},
	{
		name: "month",
		valueInSeconds: secMap['month']
	},
	{
		name: "year",
		valueInSeconds: secMap['year']
	},
]


export function secondsToTime(amountOfSeconds, showAll = false) {
	let secondsLeft = amountOfSeconds;
	let timeObject = { seconds: 0 }
	for (let i = timeMap.length - 1; i >= 0; --i) {
		let time_div = Math.floor(secondsLeft / timeMap[i].valueInSeconds)
		if (time_div == 0 && showAll == false) continue;
		secondsLeft -= time_div * timeMap[i].valueInSeconds;
		timeObject[timeMap[i].name + "s"] = time_div
	}
	return timeObject
}

export function timeToSeconds(seconds = 0, minutes = 0, hours = 0, days = 0, weeks = 0, months = 0, years = 0) {
	let totalSeconds = 0;
	totalSeconds += seconds
	totalSeconds += minutes * secMap["minute"]
	totalSeconds += hours * secMap["hour"]
	totalSeconds += days * secMap["day"]
	totalSeconds += weeks * secMap["week"]
	totalSeconds += months * secMap["month"]
	totalSeconds += years * secMap["year"]
	return totalSeconds;
}

function counter(min = 0, max = 10, elapsedTime = Caldro.time.elapsedTime) {
	let range = max - min;
	if (range <= 0) return min
	let time = elapsedTime - Math.floor(elapsedTime / range) * range
	time = toDecimalPlace(time, 2)
	return min + time
}

export function snapCoordinatesToGrid(x, y, gridSize) {
	let snappedCoordinates = new vec2D(x, y)
	snappedCoordinates.x = floorToNearestMutliple(x, gridSize)
	snappedCoordinates.y = floorToNearestMutliple(y, gridSize)

	if (x < 0)
		snappedCoordinates.x -= gridSize

	if (y < 0)
		snappedCoordinates.y -= gridSize

	return snappedCoordinates
}

export function generateRandomId(model = "XXXXXXXX-XXXX-4XXX-" + ['8', '9', 'a', 'b'][Math.round(Math.random() * 3)] + "XXX-XXXXXXXXXXXX", combinations = "0/1/2/3/4/5/6/7/8/9/a/b/c/d/e/f") {
	let id = model;
	let hex = combinations.split('/')
	id = id.replace(/X/g, () => {
		return hex[Math.round(Math.random() * (hex.length - 1))]
	})
	return id
}


export function psuedoUUID() {
	let id = "XXXXXXXX-XXXX-4XXX-" + ['8', '9', 'a', 'b'][Math.round(Math.random() * 3)] + "XXX-XXXXXXXXXXXX";
	let hex = "0123456789abcdef".split('')
	id = id.replace(/X/g, () => {
		return hex[Math.round(Math.random() * (hex.length - 1))]
	})
	return id
}

/**
 * 
 * @param {*Number} percentageSuccess A number between 0 - 100
 * @returns {*boolean} Either true or false depending on the percentage Sussess
 */
export function chance(percentageSuccess = 50) {
	return (Math.random()) <= percentageSuccess * 0.01
}

export function greater(valuesToCompare) {
	let max = -INFINITY
	for (let i = 0; i < arguments.length; ++i) {
		max = Math.max(max, arguments[i])
	}
	return max
}

export function lesser(valuesToCompare) {
	let min = INFINITY
	for (let i = 0; i < arguments.length; ++i) {
		min = Math.min(min, arguments[i])
	}
	return min
}

let heavy;
function startHeavyTask(magnitude = 100) {
	if (heavy) clearTimeout(heavy);
	heavy = setInterval(() => {
		for (let i = 0; i < magnitude; ++i) {
			let num = 0;
			for (let i = 0; i < 10000; ++i) {
				num += Math.sqrt(Math.sin(Math.cos(Math.tan(Math.sqrt(Math.random())))))
			}
		}
	}, 30 / 1000)
}
function stopHeavyTask() {
	clearTimeout(heavy)
}



export function getConstructorName(object) {
	return object.__proto__.constructor.name;
}

export function checkNaN(value = 0, setToIfNaN = true, logMessage = null) {
	if (typeof value != "number") {
		if (logMessage != null) {
			console.log(logMessage);
		}
		return setToIfNaN;
	}
	return false
}

export function checkUndefined(value){
	return (value === undefined || value === null)
}


/*function taskManager(){
	
}
taskManager.prototype = {
	
	chainTasks: function(taskArray){
		let lastTime = 0
		for(let t = 0; t < taskArray.length; t+=2){
			let task = taskArray[t];
			let timer = lastTime + taskArray[t+1];
			log(task + " is a task?")
			log(timer + " is a number?")
			// setTimeout(task, lastTime)
			lastTime += timer
		}
		lastTime = null;
	},
}

let ts = new taskManager();
ts.chainTasks([
	log(0), 2000,
	log, 2000,
	log(2), 2000,
	])*/
//==========//


//==========//


export function timeTask(task = NULLFUNCTION) {
	if (typeof task != "function") return false;
	let startTime = performance.now() / 1000;
	task();
	return (performance.now() / 1000) - startTime;
}


// primitve utilities
export function typeMatch(primitive, arrayOfTypes) {
	return arrayOfTypes.includes(typeof primitive)
}

export function matchType(primitiveType, arrayOfPrimitives) {
	for (let primitive of arrayOfPrimitives) {
		if (typeof primitive == primitiveType) {
			return true;
		}
	}
	return false;
}

export function randomNumber(minimumNumber = 0, maximumNumber = 1, float = true, exacc = false) {
	let number = minimumNumber + (Math.random() * (maximumNumber - minimumNumber))
	if (!float) number = Math.round(number);
	if (exacc) return choose([minimumNumber, maximumNumber])
	return number;
}

export function limit(what, lowThreshold, highThreshold, setToIfLow = null, setToIfHigh = null) {
	if (what < lowThreshold && lowThreshold != null) {
		what = setToIfLow != null ? setToIfLow : lowThreshold;
	} else if (what > highThreshold && highThreshold != null) {
		what = setToIfHigh != null ? setToIfHigh : highThreshold;
	}
	return what;
}

export function withinRange(number = 0, mininmumNumber = 0, maximumNumber = 1) {
	if (number >= mininmumNumber && number <= maximumNumber) return true;
	return false;
}

export function dist2D(a, b) {
	return Math.sqrt(Math.abs(a.x - b.x) ** 2 + Math.abs(a.y - b.y) ** 2)
}

export function place(point, target) {
	if (point != undefined && target != undefined) {
		point.x = target.x
		point.y = target.y
	} else {
		console.error("A variable passed to the function 'place' is udefinded\n\npoint:" + point + "\n" + "Where: " + target)
	}
}

export function getRandomPointIn(x, y, width, height, precise = true) {
	return {
		x: x + randomNumber(-width / 2, width / 2, precise),
		y: y + randomNumber(-height / 2, height / 2, precise)
	}
}

export function closest(who, array) {
	let closest = array[0]
	if (closest != undefined) {
		for (let l = 0; l < array.length; ++l) {
			if (dist2D(who, array[l]) < dist2D(who, closest)) {
				closest = array[l]
			}
		}
		return closest;
	} else {
		return undefined;
	}
}

export function linspace(start, end, amount = 10) {
	let array = new Array();
	if (amount < 2) {
		return n === 1 ? [start] : [];
	}
	--amount;
	for (let i = amount; i >= 0; --i) {
		array[i] = (i * end + (amount - i) * start) / amount;
	}
	return array;
}




// Array Utilities
export function arraySum(array) {
	let sum = 0;
	for (let i = 0; i < array.length; ++i) {
		sum += array[i]
	}
	return sum;
}

export function arrayMax(array) {
	let max = -INFINITY
	for (let i = 0; i < array.length; ++i) {
		max = Math.max(max, array[i])
	}
	return max
}

export function choose(array) {
	return array[randomNumber(0, array.length - 1, false)]
}
