// Controls
import { generateRandomId } from "./Caldro_Utility_Functions";
import { timer } from "./Caldro_SpecialObjects";
import Caldro from "./Caldro";
import { c, getCanvas } from "./Caldro_Canvas";
import { NULLFUNCTION } from "./Caldro_Utility_Constants";
import { place } from "./Caldro_Utility_Functions";
import { cosine } from "./Caldro_Math";

// [SID]
export class Joystick {
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
		this.detectionAreaExtension = (this.radius) * 0.5;
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

export class Pointer {
	constructor(x, y, id) {
		this.x = x;
		this.y = y;
		this.oldX = x;
		this.oldY = y;
		this.ID = id
	}
}

// export let pointer = new Pointer(0, 0)
const touchSwipeTimer = new timer();
const touchDoubleTapTimer = new timer();
let touchDoubleTapCount = 0;
const touchSwipeStartPoint = new Pointer(0, 0);

export var events = {
	mouseIsDown: false,
	pointStartEvent() { },
	pointMoveEvent() { },
	pointEndEvent() { },
	mouseMiddleDown(){},
	mouseScrollUp(){},
	mouseScrollDown(){},
}

export function touchDoubleTapEvent() { };
export function touchstartEvent() { }

export function touchmoveEvent() { }

export function touchSwipeUpEvent() { };
export function touchSwipeDownEvent() { };
export function touchSwipeLeftEvent() { };
export function touchSwipeRightEvent() { };
export function touchendEvent() { }

export function mousedownEvent() { };
export function mousemoveEvent() { };
export function mouseupEvent() { };

export function mouseLeftDown() { };
export function mouseRightDown() { };

export function keyPressHandler() { }
export function keyEndHandler() { }


export function pointerAdjustment() { };

function getPointersFromEvent(event) {
	let point;
	if (event.changedTouches) {
		for (let i = 0; i < event.changedTouches.length; i++) {
			const touch = event.changedTouches[i];
			point = {
				x: touch.pageX,
				y: touch.pageY,
				ID: touch.identifier
			};
		}
	} else {
		point = {
			x: event.pageX,
			y: event.pageY,
		};
	}
	return point
}

export function init_touch_controls(canvas = c) {
	canvas.addEventListener('touchstart', function (event) {
		// console.log((logTouchEvent(event)))

		if (Caldro.events.handleTouchEvents) {
			event.preventDefault()
			let pointer = Caldro.screen.updatePointers(event, "start")

			// Caldro.info.currentCamera.updatePointer(pointer)
			// touchstartEvent(pointer);

			/// call the general event provied when the canvas is touched
			events.pointStartEvent(pointer, "touch")

			/// handle swipe events start
			if (Caldro.events.hnadleTouchSwipeEvents) {
				touchSwipeTimer.setTime(0);
				place(touchSwipeStartPoint, pointer)

				if (touchDoubleTapCount == 0) {
					touchDoubleTapTimer.setTime(0)
				} else if (touchDoubleTapCount == 1) {
					if (touchDoubleTapTimer.getCurrentTime() < 1) {
						touchDoubleTapEvent();
					}
					touchDoubleTapCount = 0
				}
			}
		}
	}, false)


	canvas.addEventListener('touchmove', function (event) {
		if (Caldro.events.handleTouchEvents) {
			event.preventDefault()
			let pointer = Caldro.screen.updatePointers(event, "move")
			// Caldro.info.currentCamera.updatePointer(pointer)
			// touchmoveEvent(pointer);
			events.pointMoveEvent(pointer, "touch")
		}
	})


	canvas.addEventListener('touchend', function (event) {
		// console.log((logTouchEvent(event)))

		if (Caldro.events.handleTouchEvents) {
			event.preventDefault()
			let pointer = Caldro.screen.updatePointers(event, "end")
			// Caldro.info.currentCamera.updatePointer(pointer)
			// touchendEvent(pointer);
			events.pointEndEvent(pointer, "touch")
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

export function init_mouse_controls(canvas = c) {
	canvas.addEventListener("mousedown", function (event) {
		if (Caldro.events.handleMouseEvents) {
			if(event.button == 1) {
				events.mouseMiddleDown();
				return;
			}
			event.preventDefault();
			let pointer = Caldro.screen.updatePointers(event, "start")
			// Caldro.info.currentCamera.updatePointer(pointer);
			events.mouseIsDown = true
			events.pointStartEvent(pointer, "mouse");
			if (event.button == 0) {
				mouseLeftDown(pointer);
			} else if (event.button == 2) {
				mouseRightDown(pointer)
			}
		}
	})
	
	canvas.addEventListener("mousemove", function (event) {
		if (Caldro.events.handleMouseEvents) {
			event.preventDefault();
			let pointer = Caldro.screen.updatePointers(event, "move")
			// Caldro.info.currentCamera.updatePointer(pointer)
			events.pointMoveEvent(pointer, "mouse");
		}
	})
	
	canvas.addEventListener("mouseup", function (e) {
		if (Caldro.events.handleMouseEvents) {
			event.preventDefault();
			let pointer = Caldro.screen.updatePointers(e, "end")
			// Caldro.info.currentCamera.updatePointer(pointer)
			events.mouseIsDown = false
			events.pointEndEvent(pointer, "mouse");
		}
	})


	canvas.addEventListener("mousewheel", function (event) {
		if (Caldro.events.handleMouseEvents) {
			if (event.deltaY < 0) {
				events.mouseScrollUp()
			} else {
				events.mouseScrollDown();
			}
		}
	})
}

export function init_keyboard_controls(canvas) {
	canvas.addEventListener("keydown", function (event) {
		Caldro.info.currentKeyStateHandler.activateKeyState(event);
		keyboard.addKey(event)
		keyPressHandler(event.which)
	})

	canvas.addEventListener("keyup", function (event) {
		Caldro.info.currentKeyStateHandler.deactivateKeyState(event);
		keyboard.removeKey(event)
		keyEndHandler(event.which)
	})
}

export var keyboard = {
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
		if (this.currentKeys.includes(key)) return;
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
		} else if (key == "shift") {
			key = "Shift"
		} else if (key == "ctrl") {
			key = "Control"
		} else if (key == "alt") {
			key = "Alt"
		}
		return key;
	},
	keyDict: {
		SHIFT: "shift",
		SPACE: " "
	}
}

export function init_controls() {
	if (!Caldro.events.initializedImputControls) {
		let canvas = getCanvas();
		init_touch_controls(canvas);
		init_mouse_controls(canvas);
		init_keyboard_controls(canvas);
		Caldro.events.initializedImputControls = true
	} else {
		console.error("Can't init controls more than once")
	}
}


// [SID]
export class keyStateHandler {
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
	hitKey(keyinfo) {
		let key = this.getKey(keyinfo)
		if (key) {
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
	removeKey(keyName) {
		this.keys = this.keys.filter(function (keyL) {
			if (keyL.keyName == keyName) {
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

export class KeyShortCutHandler {
	constructor() {
		this.shortcuts = new Array();
		let KeyShortCutHandlerPointer = this
		document.addEventListener("keydown", function (event) {
			for (let shortcut of KeyShortCutHandlerPointer.shortcuts) {
				if (shortcut.key.toLocaleLowerCase() == event.key.toLocaleLowerCase()) {
					if (shortcut.ctrl == event.ctrlKey && shortcut.shift == event.shiftKey && shortcut.alt == event.altKey) {
						event.preventDefault()
						shortcut.onPerform()
						break;
					}
				}
			}
		})
	}
	addShortcut(key, onPerform = function () { }, ctrl = false, shift = false, alt = false) {
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

