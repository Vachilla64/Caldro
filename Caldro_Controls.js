"use strict"; // Controls

// [CO]
function dPad(x, y, size) {
	this.x = x;
	this.y = y;
	this.width = size;
	this.height = size;
	this.size = size;
	this.margin = size / 3;
	this.value = 0;
	let value = 0;
	let innerColor = 'grey';

	let up = this.up = new button(this.x, this.y - this.margin, this.margin, this.margin, '⬆️');
	this.up.effect = function () {
		value = 2;
		up.color = 'white';
		up.dolater(10, function () {
			up.color = innerColor;
		});
	};

	let down = this.down = new button(this.x, this.y + this.margin, this.margin, this.margin, '⬇️');
	this.down.effect = function () {
		value = 8;
		down.color = 'white';
		down.dolater(10, function () {
			down.color = innerColor;
		});
	};

	let left = this.left = new button(this.x - this.margin, this.y, this.margin, this.margin, '⬅️')
	this.left.effect = function () {
		value = 4;
		left.color = 'white';
		left.dolater(10, function () {
			left.color = innerColor;
		});
	};

	let right = this.right = new button(this.x + this.margin, this.y, this.margin, this.margin, '➡️');
	this.right.effect = function () {
		value = 6;
		right.color = 'white';
		right.dolater(10, function () {
			right.color = innerColor;
		});
	};

	this.buttons = [this.up, this.down, this.left, this.right];

	this.update = function (tap = null) {
		value = this.value = 0;
		this.margin = this.size / 3;
		this.up.position(this.x, this.y - this.margin, this.margin, this.margin);
		this.down.position(this.x, this.y + this.margin, this.margin, this.margin);
		this.left.position(this.x - this.margin, this.y, this.margin, this.margin);
		this.right.position(this.x + this.margin, this.y, this.margin, this.margin);
		for (let i = 0; i < this.buttons.length; ++i) {
			this.buttons[i].fontSize = this.margin;
			if (tap != null) {
				this.buttons[i].listen(tap);
				this.value = value;
			};
		};
		return this.value;
	}

	this.render = function () {
		for (let i = 0; i < this.buttons.length; ++i) {
			glow(0);
			this.buttons[i].drawingStyle = 2;
			this.buttons[i].render();
		};
	}
}

// [SID]
class Joystick {
	constructor(x = 0, y = 0, radius = 10, knobRadius = 4, color) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.active = true;
		this.isBeingControlled = false;
		this.values = [0, 0]
		this.knob = {
			x: this.x,
			y: this.y,
			radius: knobRadius,
			color: color
		}
		this.detectionAreaExtension = (this.radius)*0.5;
	}
	update(pointer = touchPoint, type = "idle") {
		if (!this.active) return;

		if (type == "start") {
			this.isBeingControlled = dist2D(pointer, this) < (this.radius + this.detectionAreaExtension);
			if (this.isBeingControlled) {
				place(this.knob, pointer)
			}
		}
		if (type == "move") {
			if (this.isBeingControlled) {
				place(this.knob, pointer)
				let angle = angleBetweenPoints(this, this.knob)
				if (dist2D(this.knob, this) > this.radius) {
					this.knob.x = this.x + (sine(angle) * this.radius)
					this.knob.y = this.y + (-cosine(angle) * this.radius)
				}
			}
		}
		if (type == "end") {
			this.isBeingControlled = false;
			place(this.knob, this);
		}


		this.values[0] = (this.knob.x - this.x) / (this.radius)
		this.values[1] = (this.knob.y - this.y) / this.radius;
		this.callback()
		return this.values;
	}
	callback() { };

	render() {
		if (this.isBeingControlled) {
			alpha(0.3)
			circle(this.x, this.y, this.radius + this.detectionAreaExtension, this.color);
			alpha(1)
		}
		stCircle(this.x, this.y, this.radius, this.color, 4);
		circle(this.knob.x, this.knob.y, this.knob.radius, this.knob.color)
	}
}


class Pointer{
	constructor(x, y){
		this.x = x; 
		this.y = y;
		this.oldX = x;
		this.oldY = y;
		this.ID = generateRandomId()
	}
}
var pointer = new Pointer(0, 0)
var touchSwipeTimer = new timer();
var touchDoubleTapTimer = new timer();
var touchDoubleTapCount = 0;
var touchSwipeStartPoint = new Pointer(0, 0);

function pointStartEvent(pointer, pointerType) { };
function pointMoveEvent(pointer, pointerType) { };
function pointEndEvent(pointer, pointerType) { };
function touchDoubleTapEvent() { };
function touchstartEvent() { }

function touchmoveEvent() { }

function touchSwipeUpEvent() { };
function touchSwipeDownEvent() { };
function touchSwipeLeftEvent() { };
function touchSwipeRightEvent() { };
function touchendEvent() { }

function mousedownEvent() { };
function mousemoveEvent() { };
function mouseupEvent() { };

function mousescrollUp() { }
function mousescrollDown() { }

function mouseLeftDown() { };
function mouseRightDown() { };

function keyPressHandler() { }
function keyEndHandler() { }

function adjustPointer(pointer, event){
	let paddingElement = window.document.body
	// let paddingElement = event.target
	// if(event.target.padding){
		pointer.x -= parseFloat(paddingElement.style.paddingLeft)
		pointer.y -= parseFloat(paddingElement.style.paddingTop)
	// }
	pointerAdjustment(pointer)
}

function pointerAdjustment() {};

function init_touch_controls(canvas = c) {
	canvas.addEventListener('touchstart', function (event) {
		if (Caldro.events.handleTouchEvents) {
			event.preventDefault()
			Caldro.screen.updatePointers(event, "start")
			pointer.x = event.touches[0].pageX
			pointer.y = event.touches[0].pageY
			adjustPointer(pointer, event)
			// Caldro.info.currentCamera.updatePointer(pointer)
			touchstartEvent(pointer);
			pointStartEvent(pointer, "touch")
			if (Caldro.events.hnadleTouchSwipeEvents) {
				touchSwipeTimer.setTime(0);
				place(touchSwipeStartPoint, pointer)
			}

			if (touchDoubleTapCount == 0) {
				touchDoubleTapTimer.setTime(0)
			} else if (touchDoubleTapCount == 1) {
				if (touchDoubleTapTimer.getCurrentTime() < 1) {
					touchDoubleTapEvent();
				}
				touchDoubleTapCount = 0
			}
		}
	}, false)


	canvas.addEventListener('touchmove', function (event) {
		if (Caldro.events.handleTouchEvents) {
			event.preventDefault()
			Caldro.screen.updatePointers(event, "move")
			place(pointer, { x: event.changedTouches[0].pageX, y: event.changedTouches[0].pageY })
			adjustPointer(pointer, event)
			// Caldro.info.currentCamera.updatePointer(pointer)
			touchmoveEvent(pointer);
			pointMoveEvent(pointer, "touch")
		}
	})


	canvas.addEventListener('touchend', function (event) {
		if (Caldro.events.handleTouchEvents) {
			event.preventDefault()
			Caldro.screen.updatePointers(event, "end")
			place(pointer, { x: event.changedTouches[0].pageX, y: event.changedTouches[0].pageY })
			adjustPointer(pointer, event)
			// Caldro.info.currentCamera.updatePointer(pointer)
			touchendEvent(pointer);
			pointEndEvent(pointer, "touch")
			if (Caldro.events.hnadleTouchSwipeEvents) {
				if (touchSwipeTimer.getCurrentTime() < Caldro.events.swipeEventDetectionTimeRange) {
					let diffX = Math.abs(touchSwipeStartPoint.x - pointer.x)
					let diffY = Math.abs(touchSwipeStartPoint.y - pointer.y)
					if (Math.abs(diffX - diffY) > Caldro.events.swipeEventDetectionDistanceRange)
						if (diffX >= diffY) {
							if (pointer.x <= touchSwipeStartPoint.x) {
								touchSwipeLeftEvent()
							} else {
								touchSwipeRightEvent()
							}
						} else {
							if (pointer.y <= touchSwipeStartPoint.y) {
								touchSwipeUpEvent()
							} else {
								touchSwipeDownEvent()
							}
						}
				}
				place(touchSwipeStartPoint, pointer)
			}
		}
	})
}

function init_mouse_controls(canvas = c) {
	canvas.addEventListener("mousedown", function (e) {
		if (Caldro.events.handleMouseEvents) {
			e.preventDefault();
			Caldro.screen.addPointer(e.clientX, e.clientY)
			pointer.x = e.clientX;
			pointer.y = e.clientY;
			adjustPointer(pointer, event)
			// Caldro.info.currentCamera.updatePointer(pointer);
			if(e.button == 0){
				mouseLeftDown();
			} else if(e.button == 2){
				mouseRightDown()
			}
			mousedownEvent();
			pointStartEvent(pointer, "mouse");
		}
	})

	canvas.addEventListener("mousemove", function (e) {
		if (Caldro.events.handleMouseEvents) {
			let spoint = Caldro.screen.pointers[0]
			if (spoint) {
				spoint.x = e.clientX
				spoint.y = e.clientY
			}
			pointer.x = e.clientX;
			pointer.y = e.clientY;
			adjustPointer(pointer, event)
			// Caldro.info.currentCamera.updatePointer(pointer)
			mousemoveEvent();
			pointMoveEvent(pointer, "mouse");
		}
	})

	canvas.addEventListener("mouseup", function (e) {
		if (Caldro.events.handleMouseEvents) {
			Caldro.screen.pointers.length = 0
			pointer.x = e.clientX;
			pointer.y = e.clientY;
			adjustPointer(pointer, event)
			// Caldro.info.currentCamera.updatePointer(pointer)
			pointEndEvent(pointer, "mouse");
			mouseupEvent();
		}
	})


	canvas.addEventListener("mousewheel", function (event) {
		if (Caldro.events.handleMouseEvents) {
			if (event.deltaY < 0) {
				mousescrollUp()
			} else {
				mousescrollDown();
			}
		}
	})
}

function init_keyboard_controls() {
	document.addEventListener("keydown", function (event) {
		Caldro.info.currentKeyStateHandler.activateKeyState(event);
		keyboard.addKey(event)
		keyPressHandler(event.which)
	})

	document.addEventListener("keyup", function (event) {
		Caldro.info.currentKeyStateHandler.deactivateKeyState(event);
		keyboard.removeKey(event)
		keyEndHandler(event.which)
	})
}

var keyboard = {
	currentKeys: new Array(),
	isBeingPressed(keyName) { 
		let found = false
		keyName = this.parseKey(keyName)
		for (let i = 0; i < this.currentKeys.length; ++i) {
			if (this.currentKeys[i] == keyName) {
				found = true;
				break;
			}
		}
		return found
	},
	addKey(event) {
		let key = event.key
		if(this.currentKeys.includes(key)) return;
		this.currentKeys.push(key)
	},
	removeKey(event) {
		let key = event.key
		for (let i = 0; i < this.currentKeys.length; ++i) {
			if (this.currentKeys[i] == key) {
				this.currentKeys.splice(i, 1)
			}
		}
	},
	parseKey(key) {
		if (key == "space") {
			key = ' '
		} else if (key == "left") {
			key = "ArrowLeft"
		} else if (key == "right") {
			key = "ArrowRight"
		} else if (key == "up") {
			key = "ArrowUp"
		} else if (key == "down") {
			key = "ArrowDown"
		} else if (key == "shift"){
			key = "Shift"
		} else if (key == "ctrl"){
			key = "Control"
		} else if (key == "alt"){
			key = "Alt"
		}
		return key;
	},
	keyDict: [
		"space", ' '
	]
}

function init_controls() {
	init_touch_controls();
	init_mouse_controls();
	init_keyboard_controls();
}

// [SID]
class keyStateHandler {
	constructor() {
		this.keys = [];
		this.active = true;
		this.strictMatch = true;
		this.strictCaps = false;

		this.keyListener = class {
			constructor(KeyNumber, keyName, effect = NULLFUNCTION, onclick = NULLFUNCTION, onlift = NULLFUNCTION) {
				this.keyNumber = KeyNumber;
				this.keyName = keyName;
				this.active = true;
				this.beingPressed = false;
				this.executeClick = true
				this.effect = effect;
				this.onclick = onclick;
				this.onlift = onlift;
			}
		}
	}
	hitKey(keyinfo){
		let key = this.getKey(keyinfo)
		if(key){
			key.onclick();
		}
	}
	addKey(keyNumber, keyName, onclick, effect, onlift) {
		if (typeof keyName == "object") {
			for (let n = 0; n < keyName.length; ++n) {
				this.keys.push(new this.keyListener(keyNumber, keyName[n], effect, onclick, onlift))
			}
		} else {
			this.keys.push(new this.keyListener(keyNumber, keyName, effect, onclick, onlift))
		}
	}
	bind = this.addKey;
	removeKey(keyName){
		this.keys = this.keys.filter(function(keyL){
			if(keyL.keyName == keyName){
				return false
			} else {
				return true
			}
	})
	}
	getKey(keyInfo) {
		let key = undefined;
		if (typeof keyInfo == "number") {
			for (let k = 0; k < this.keys.length; ++k) {
				if (this.keys[k].keyNumber == keyInfo) {
					key = this.keys[k];
					break
				}
			}
		} else if (typeof keyInfo == "string") {
			for (let k = 0; k < this.keys.length; ++k) {
				let condition = false;
				let keyToLow = this.keys[k].keyName.toLowerCase()
				let keyInfToLow = keyInfo.toLowerCase();
				if (this.strictMatch) {
					if (this.strictCaps) {
						condition = this.keys[k].keyName == keyInfo
					} else {
						condition = keyToLow == keyInfToLow;
					}
				} else {
					if (this.strictCaps) {
						condition = this.keys[k].keyName == keyInfo
					} else {
						condition = keyToLow.includes(keyInfToLow) || keyInfToLow.includes(keyToLow);
					}
				}
				if (condition) {
					key = this.keys[k];
					break;
				}
			}
		} else if (typeof keyInfo == "object") {
			for (let k = 0; k < this.keys.length; ++k) {
				let condition = false;
				let keyToLow = this.keys[k].keyName.toLowerCase()
				let keyInfToLow = keyInfo.key.toLowerCase();
				if (this.strictMatch) {
					if (this.strictCaps) {
						condition = this.keys[k].keyName == keyInfo
					} else {
						condition = keyToLow == keyInfToLow;
					}
				} else {
					if (this.strictCaps) {
						condition = this.keys[k].keyName == keyInfo
					} else {
						condition = keyToLow.includes(keyInfToLow) || keyInfToLow.includes(keyToLow);
					}
				}
				if (condition || this.keys[k].keyNumber == keyInfo.which) {
					key = this.keys[k];
					break
				}
			}
		}
		if (key == undefined) {
			if (Caldro.info.isloggingIssues()) {
				console.error("No key was found with the keyinfo '" + keyInfo + "'");
			}
		}
		return key;
	}
	updateKeys() {
		if (this.active && Caldro.events.handleKeyboardEvents) {
			for (let k = 0; k < this.keys.length; ++k) {
				let key = this.keys[k];
				if (key.active && key.beingPressed) {
					if (key.executeClick) {
						key.onclick();
						key.executeClick = false;
					}
					key.effect();
				}
			}
		}
	}
	activateKeyState(KeyInfo = 0) {
		let key = this.getKey(KeyInfo);
		if (key != undefined) {
			key.beingPressed = true;
		}
	}
	deactivateKeyState(KeyInfo = 0) {
		let key = this.getKey(KeyInfo);
		if (key != undefined) {
			key.onlift();
			key.beingPressed = false;
			key.executeClick = true;
		}
	}
}

class KeyShortCutHandler{
    constructor(){
        this.shortcuts = new Array();
        let KeyShortCutHandlerPointer = this
        document.addEventListener("keydown", function (event) {
            for(let shortcut of KeyShortCutHandlerPointer.shortcuts){
                if(shortcut.key.toLocaleLowerCase() == event.key.toLocaleLowerCase()){
                    if(shortcut.ctrl == event.ctrlKey && shortcut.shift == event.shiftKey && shortcut.alt == event.altKey){
                        event.preventDefault()
                        shortcut.onPerform()
                        break;
                    }
                }
            }
        })
    }
    addShortcut(key, onPerform = function(){}, ctrl = false, shift = false, alt = false){
        let shortcut = {
            key: key,
            onPerform: onPerform,
            ctrl: ctrl,
            shift: shift,
            alt: alt
        }
        this.shortcuts.push(shortcut)
    }
}

var keyAtlas = [

]

function getKeyName(keyNumber) {

}
