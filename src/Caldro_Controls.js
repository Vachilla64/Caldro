// Controls
import { Timer } from "./Caldro_SpecialObjects.js";
import Caldro from "./Caldro.js";
import { c, getCanvas } from "./Caldro_Canvas.js";
import { place, } from "./Caldro_Utility_Functions.js";
import { cosine } from "./Caldro_Math.js";
import { EventManager } from "./Caldro_EventManager.js";


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

const touchSwipeTimer = new Timer();
const touchDoubleTapTimer = new Timer();
let touchDoubleTapCount = 0;
const touchSwipeStartPoint = new Pointer(0, 0);

const SCREEN_EVENT_MANAGER = new EventManager("Global Screen Event Manager")
SCREEN_EVENT_MANAGER.filterListenersOnCreation = true
SCREEN_EVENT_MANAGER.registerEventType("clickStart")
SCREEN_EVENT_MANAGER.registerEventType("clickMove")
SCREEN_EVENT_MANAGER.registerEventType("clickEnd")

SCREEN_EVENT_MANAGER.registerEventType("mouseDown")
SCREEN_EVENT_MANAGER.registerEventType("mouseMove")

SCREEN_EVENT_MANAGER.registerEventType("mouseScrollUp")
SCREEN_EVENT_MANAGER.registerEventType("mouseScrollDown")
SCREEN_EVENT_MANAGER.registerEventType("mouseLeftUp")
SCREEN_EVENT_MANAGER.registerEventType("mouseLeftDown")
SCREEN_EVENT_MANAGER.registerEventType("mouseRightUp")
SCREEN_EVENT_MANAGER.registerEventType("mouseRightDown")
SCREEN_EVENT_MANAGER.registerEventType("mouseMiddleUp")
SCREEN_EVENT_MANAGER.registerEventType("mouseMiddleDown")

/// equavaltent of window.onload = () => {};
export var events = {
	mouseIsDown: false,

	/// general pointer events (mouse and touch)
	pointStartEvent() { },
	pointMoveEvent() { },
	pointEndEvent() { },


	/// mouse evnets
	mouseMove() { },
	mouseScrollUp() { },
	mouseScrollDown() { },
	mouseLeftDown() { },
	mouseRightDown() { },
	mouseMiddleDown() {},
	mouseLeftUp() { },
	mouseRightUp() { },
	mouseMiddleUp() {},
}

/// TODO: Make touch event handlers like the ones below
// function touchDoubleTapEvent() { };
// function touchstartEvent() {};
// function touchmoveEvent() {};
// function touchSwipeUpEvent() { };
// function touchSwipeDownEvent() { };
// function touchSwipeLeftEvent() { };
// function touchSwipeRightEvent() { };
// function touchendEvent() {};
// function mousedownEvent() { };
// function mousemoveEvent() { };
// function mouseupEvent() { };

/// ___Pointer Event (tap or mouse) listners___
export const onClickStart = function (callback) {
	return SCREEN_EVENT_MANAGER.addListener("clickStart", callback)
}
export const onClickMove = function (callback) {
	return SCREEN_EVENT_MANAGER.addListener("clickMove", callback)
}
export const onClickEnd = function (callback) {
	return SCREEN_EVENT_MANAGER.addListener("clickEnd", callback)
}

/// ___Mouse event listners___
export const onMouseMove = function(callback) {
	return SCREEN_EVENT_MANAGER.addListener("mouseMove", callback)
 };
export const onMouseScrollUp = function(callback) {
	return SCREEN_EVENT_MANAGER.addListener("mouseScrollUp", callback)
 };
export const onMouseScrollDown = function(callback) {
	return SCREEN_EVENT_MANAGER.addListener("mouseScrollDown", callback)
 };
export const onMouseLeftDown = function(callback) {
	return SCREEN_EVENT_MANAGER.addListener("mouseLeftDown", callback)
 };
export const onMouseRightDown = function(callback) {
	return SCREEN_EVENT_MANAGER.addListener("mouseRightDown", callback)
 };
export const onMouseMiddleDown = function(callback) {
	return SCREEN_EVENT_MANAGER.addListener("mouseMiddleDown", callback)
};
export const onMouseLeftUp = function(callback) {
	return SCREEN_EVENT_MANAGER.addListener("mouseLeftUp", callback)
 };
export const onMouseRightUp = function(callback) {
	return SCREEN_EVENT_MANAGER.addListener("mouseRightUp", callback)
 };
export const onMouseMiddleUp = function(callback) {
	return SCREEN_EVENT_MANAGER.addListener("mouseMiddleUp", callback)
};


export function pointerAdjustment() { };

/// function to get clicker informatin from a click event
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

export const MOUSE = {
	isBeingPressed: false
}

export function init_touch_controls(DOMElement = c) {
	DOMElement.addEventListener('touchstart', function (event) {
		// console.log((logTouchEvent(event)))

		if (Caldro.events.handleTouchEvents) {
			event.preventDefault()
			let pointer = Caldro.screen.updatePointers(event, "start")

			// Caldro.info.currentCamera.updatePointer(pointer)
			// touchstartEvent(pointer);

			/// call the general event provied when the DOMElement is touched
			events.pointStartEvent(pointer, "touch")
			SCREEN_EVENT_MANAGER.fireEvent("clickStart", pointer)


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


	DOMElement.addEventListener('touchmove', function (event) {
		if (Caldro.events.handleTouchEvents) {
			event.preventDefault()
			let pointer = Caldro.screen.updatePointers(event, "move")
			// Caldro.info.currentCamera.updatePointer(pointer)
			// touchmoveEvent(pointer);
			events.pointMoveEvent(pointer, "touch")
			SCREEN_EVENT_MANAGER.fireEvent("clickMove", pointer)
		}
	})


	DOMElement.addEventListener('touchend', function (event) {
		// console.log((logTouchEvent(event)))

		if (Caldro.events.handleTouchEvents) {
			event.preventDefault()
			let pointer = Caldro.screen.updatePointers(event, "end")
			// Caldro.info.currentCamera.updatePointer(pointer)
			// touchendEvent(pointer);
			events.pointEndEvent(pointer, "touch")
			SCREEN_EVENT_MANAGER.fireEvent("clickEnd", pointer)
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

export function init_mouse_controls(DOMElement = c) {
	DOMElement.addEventListener("mousedown", function (event) {
		if (Caldro.events.handleMouseEvents) {
			MOUSE.isBeingPressed = true

			/// if this is the mouse middle button
			let pointer = Caldro.screen.updatePointers(event, "start")

			/// prevent things like right click pop-up menus
			event.preventDefault();
			event.stopPropagation();

			events.mouseIsDown = true

			/// fire the generate pointStart Events
			events.pointStartEvent(pointer, "mouse");
			SCREEN_EVENT_MANAGER.fireEvent("clickStart", pointer)


			/// middle mouse click
			if (event.button == 1) {
				events.mouseMiddleDown(pointer);
				SCREEN_EVENT_MANAGER.fireEvent("mouseMiddleDown", pointer)
			} else
				/// left mouse click
				if (event.button == 0) {
					events.mouseLeftDown(pointer);
					SCREEN_EVENT_MANAGER.fireEvent("mouseLeftDown", pointer)
					/// right mouse click
				} else if (event.button == 2) {
					events.mouseRightDown(pointer)
					SCREEN_EVENT_MANAGER.fireEvent("mouseRightDown", pointer)
				}
		}
	})

	DOMElement.addEventListener("mousemove", function (event) {
		if (Caldro.events.handleMouseEvents) {
			event.preventDefault();
			event.stopPropagation();

			let pointer = Caldro.screen.updatePointers(event, "move")
			SCREEN_EVENT_MANAGER.fireEvent("clickMove", pointer)


			events.pointMoveEvent(pointer, "mouse");
			SCREEN_EVENT_MANAGER.fireEvent("mouseMove", pointer)
		}
	})

	DOMElement.addEventListener("mouseup", function (event) {
		if (Caldro.events.handleMouseEvents) {
			MOUSE.isBeingPressed = false
			event.preventDefault();
			event.stopPropagation();

			events.mouseIsDown = false

			let pointer = Caldro.screen.updatePointers(event, "end")

			events.pointEndEvent(pointer, "mouse");
			SCREEN_EVENT_MANAGER.fireEvent("clickEnd", pointer)


			/// middle mouse click
			if (event.button == 1) {
				events.mouseMiddleUp(pointer);
				SCREEN_EVENT_MANAGER.fireEvent("mouseMiddleUp", pointer)
			} else
				/// left mouse click
				if (event.button == 0) {
					events.mouseLeftUp(pointer);
					SCREEN_EVENT_MANAGER.fireEvent("mouseLeftUp", pointer)
					/// right mouse click
				} else if (event.button == 2) {
					events.mouseRightUp(pointer)
					SCREEN_EVENT_MANAGER.fireEvent("mouseRightUp", pointer)
				}
		}
	})

	/// TODO: Aint aorkin
	/// stop mouse pointers form being pressed
	DOMElement.addEventListener("blur", () => {
		console.log("Poiteres cleard")
		Caldro.screen.clearAllPointers()
	})


	DOMElement.addEventListener("mousewheel", function (event) {
		if (Caldro.events.handleMouseEvents) {
			/// prevetn browser default zoom behaviour
			if (event.ctrlKey) {
				event.preventDefault()
			}
			if (event.deltaY < 0) {
				events.mouseScrollUp()
				SCREEN_EVENT_MANAGER.fireEvent("mouseScrollUp")
			} else {
				events.mouseScrollDown();
				SCREEN_EVENT_MANAGER.fireEvent("mouseScrollDown")

			}
		}
	})
}

export function init_keyboard_controls(DOMElement) {
	DOMElement.addEventListener("keydown", (event) => {
		keyboard.keyDownEvent(event)
	})

	DOMElement.addEventListener("keyup", (event) => {
		keyboard.keyUpEvent(event)
	})

	/// stop keyboard keuys form being pressed
	DOMElement.addEventListener("blur", () => {
		// keyboard.removeAllKeys()
		// Caldro.events.heldDownKeystateHandler.deactivateAllKeyStates();
	})
}

const KEYDOWN_EVENT_MANAGER = new EventManager("keydown Event Manager")
const KEYHELD_EVENT_MANAGER = new EventManager("keyheld Event Manager")
const KEYUP_EVENT_MANAGER = new EventManager("Keyup Event Manager")
export const keyboard = {
	heldDownKeys: new Array(),
	stictCaps: true,


	onKeyDown(keyName, callback) {
		KEYDOWN_EVENT_MANAGER.addListener(keyName, callback)
	},

	onKeyHold(keyName, callback) {
		KEYHELD_EVENT_MANAGER.addListener(keyName, callback)
	},
	
	onKeyUp(keyName, callback){
		KEYUP_EVENT_MANAGER.addListener(keyName, callback)
	},
	
	isBeingPressed(keyName) {
		let found = false
		keyName = this.parseKey(keyName)
		for (let i = 0; i < this.heldDownKeys.length; ++i) {
			if (this.heldDownKeys[i] == keyName) {
				found = true;
				break;
			}
		}
		return found
	},
	
		
	keyDownEvent(event) {
		let key = this.parseKey(event.key)
		if (this.heldDownKeys.includes(key)) return;
		this.heldDownKeys.push(key)
		key = this.stictCaps?key:key.toLowerCase()
		KEYDOWN_EVENT_MANAGER.fireEvent(key)
	},
	_executeHeldKeysCallback(){
		for (let i = 0; i < this.heldDownKeys.length; ++i) {
			KEYHELD_EVENT_MANAGER.fireEvent(this.parseKey(this.heldDownKeys[i]))
		}
	},
	keyUpEvent(event) {
		let key = this.parseKey(event.key)
		for (let i = 0; i < this.heldDownKeys.length; ++i) {
			if (this.heldDownKeys[i] == key) {
				this.heldDownKeys.splice(i, 1)
				break
			}
		}
		KEYUP_EVENT_MANAGER.fireEvent(key)
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
	/// to make a variale usefull instad of the actual sting
	keyDict: {
		SHIFT: "shift",
		SPACE: " "
	}
}
window.keyboard = keyboard

export function init_controls() {
	if (!Caldro.events.initializedImputControls) {
		let canvas = getCanvas();
		init_touch_controls(canvas);
		init_mouse_controls(canvas);
		init_keyboard_controls(window);
		Caldro.events.initializedImputControls = true
	} else {
		console.error("Can't initialize controls more than once")
	}
}


var keyAtlas = [

]

function getKeyName(keyNumber) {

}

