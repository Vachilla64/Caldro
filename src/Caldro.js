// Caldro
import { keyStateHandler, Pointer } from "./Caldro_Controls.js";
import { CALDBLUE, CURSOR_TYPES, INFINITY, NULLFUNCTION } from "./Caldro_Utility_Constants.js";
import { c } from "./Caldro_Canvas.js";
import {
	rect,
	glow,
	font,
	txt,
	adjustCanvas,
	cc,
} from "./Caldro_Rendering.js";
import { place, randomNumber, timeTask } from "./Caldro_Utility_Functions.js";
import { arraySum } from "./Caldro_Utility_Functions.js";
import { init_controls } from "./Caldro_Controls.js";
import { getConstructorName } from "./Caldro_Utility_Functions.js";
import { spriteSheetManager } from "./Caldro_Image.js";
import { canvasImageManager } from "./Caldro_Image_Canvas_Manager.js";
import { imageHandler } from "./Caldro_Image.js";
import { DEBUGGER } from "./debug/Caldro_Debug.js";
/* var CaldroCam = new camera();
var CaldroPs = new particleSystem();
var CaldroKeys = new keyStateHandler(); */
// let c = getCanvas();

export const CaldroSSM = new spriteSheetManager();
export const CaldroCIM = new canvasImageManager();
export const CaldroIH = new imageHandler();
export const CaldroKeys = new keyStateHandler();



var Caldro = {
	time: {
		deltatime: 0,
		fixedTime: 0.016,
		elapsedTime: 0,
		currentFrame: 0,
		previousFrame: 0,
		_lastFrame: 0,
		framesPerSecond: 0,
		lastRecordedFramesPerSecond: new Array(),
		avergeFrameRateRecordingSpan: 10,
		cycles: 0,
		_minFPS: 1,
		safetyDeltatimeCap: null,
		_maxFPS: null,
		_lastUpdateElapsedTime: 0,
		setFixedTime(FPS) {
			Caldro.time.fixedTime = 1 / FPS
			Caldro.time.fixedTime = clip(Caldro.time.fixedTime, 1 / this.time._maxFPS, 1 / this.time._minFPS)
		},
		update: function () {
			let ct = Caldro.time
			let now = window.performance.now() / 1000
			let deltatime = now - ct.previousFrame
			// ct._lastUpdateElapsedTime += deltatime

			if (ct._maxFPS) {
				if ((deltatime < (1 / ct._maxFPS))) {
					return false;
				}
				ct._lastUpdateElapsedTime = 0
				ct.previousFrame = now
			}

			ct.currentFrame = window.performance.now() / 1000;
			ct.deltatime = ct.currentFrame - ct._lastFrame //+ ((ct.currentFrame - ct._lastFrame) - (1/ct._maxFPS))
			ct._lastFrame = ct.currentFrame

			if (ct.safetyDeltatimeCap != null) {
				if (deltatime > ct.safetyDeltatimeCap) {
					return false;
				}
			}

			++ct.cycles;
			ct.elapsedTime += ct.deltatime;
			ct.framesPerSecond = 1 / ct.deltatime;
			ct.lastRecordedFramesPerSecond.push(ct.framesPerSecond)
			if (ct.lastRecordedFramesPerSecond.length > ct.avergeFrameRateRecordingSpan) {
				ct.lastRecordedFramesPerSecond.shift();
			}
			if (ct.deltatime == Infinity) {
				console.log(ct)
			}
			return true;
		},
		setMaxFPS(maxFPS) {
			let ct = Caldro.time
			if (typeof maxFPS != "number") {
				console.error("Caldro.time error: maxFPS provided is not a primitive of type 'number'")
				return;
			}
			ct._maxFPS = maxFPS;
			ct._lastUpdateElapsedTime = 1 / maxFPS
		},
		setSafetyDeltatimeCapAtFPS(deltatimeToleranceInFPS = 1) {
			let ct = Caldro.time;
			ct.safetyDeltatimeCap = 1 / deltatimeToleranceInFPS
		},
		getAverageFrameRate: function () {
			let ct = Caldro.time;
			if (!ct.lastRecordedFramesPerSecond.length > 0) return 0;
			return arraySum(ct.lastRecordedFramesPerSecond) / ct.lastRecordedFramesPerSecond.length;
		}
	},

	game: {
		// ! ~Not in use~ !
		world: {
			dimensions: {
				meters: 10
			}
		},
	},

	display: {
		aspectRatio: null,
	},

	info: {
		version: "0.5.0",
		logIssues: false,
		debuggingLogs: {
			// ! ~Not in use~ !
			audio: true,
			rendering: true,
			particleSystem: true,
			setAll: function (value = true) {
				this.audio = value;
				this.rendering = value;
				this.particleSystem = value;
			}
		},
		isloggingIssues: function () {
			return this.logIssues
		},
		// currentCamera: CaldroCam,
		// currentKeyStateHandler: CaldroKeys,
		// currentParticleSystem: CaldroPs,
		// currentCamera: CaldroCam,
		// currentKeyStateHandler: CaldroKeys,
		// currentParticleSystem: CaldroPs,
	},

	renderer: {
		canvas: c,
		context: c.getContext('2d'),
		setRenderingCanvas: function (canvas) {
			if (getConstructorName(canvas) == "HTMLCanvasElement") {
				this.canvas = canvas
				this.context = this.canvas.getContext("2d")
				Caldro.rendering.canvas = this.canvas
				Caldro.rendering.context = this.canvas.getContext("2d")
			}
		},
		getCurrentRenderingInfo: function () {
			return {
				canvas: this.canvas,
				context: this.context
			}
		},

		_pixelatorCanvas: document.createElement("canvas"),
		glow: true,
		alpha: true,
	},

	rendering: {
		canvas: c,
		context: c.getContext("2d"),
		plafrom: "CanvasRenderingContext2D",
		shapeClipping: false,
		shapeClippingCamera: null,
		imageSmoothing: false,
		textOutlineThickness: 0,
		textOutlineColor: "black",
		defaultColor: "skyblue",
	},

	events: {
		handledEvents: {
			touchStart: true,
			touchMove: true,
			touchEnd: true,
			mouseLeftDown: true,
			mouseRightDown: true,
			mouseMove: true,
			mouseUp: true,
			mousescrollDown: true,
			mousescrollUp: true,
			keyDown: true,
			keyUp: true,
		},
		handleMouseEvents: true,
		hnadleTouchSwipeEvents: false,
		handleTouchEvents: true,
		handleKeyboardEvents: true,
		swipeEventDetectionTimeRange: 0.3,
		swipeEventDetectionDistanceRange: 20,
		forceMapPointerEventToWindow: function (browserWindow = window) { // need to work on this
			browserWindow.ontouchstart = browserWindow.onmousedown = function () {
				pointStartEvent();
			}
			browserWindow.ontouchmove = browserWindow.onmousemove = function () {
				pointMoveEvent();
			};
			browserWindow.ontouchend = browserWindow.onmouseup = function () {
				pointEndEvent();
			};
		},
	},

	screen: {
		clicks: 0,
		pointers: new Array(),
		checkForPointerIn(area) {
			for (let point of Caldro.screen.pointers) {
				if (!point) continue
				if (pointIsIn(point, area)) {
					return true
				}
			}
			return false;
		},
		getFirstPointerIn(area) {
			for (let point of Caldro.screen.pointers) {
				if (!point) continue
				if (pointIsIn(point, area)) {
					return point;
				}
			}
			return null;
		},
		getPointersIn(area) {
			let pointers = new Array();
			let foundOne = false
			for (let point of Caldro.screen.pointers) {
				if (!point) continue
				if (pointIsIn(point, area)) {
					foundOne = true
					pointers.push(point);
				}
			}
			if (foundOne) return pointers
			else return foundOne;
		},
		getPointer(ID = 0) {
			return this.pointers[ID]
		},
		addPointer(x, y, id = generateRandomId()) {
			this.pointers.push(new Pointer(x, y, 0))
		},
		getPointerByID(ID) {
			try {
				let pointer = this.pointer[ID]
				return pointer
			} catch {
				return null
			}
		},
		updatePointers(event, type = "idle") {
			const changedTouches = event.changedTouches;
			let pointer;
			if (event.changedTouches) {
				pointer = this.pointers[changedTouches[0].identifier]
				if (type == "start") {
					for (let i = 0; i < changedTouches.length; i++) {
						const touch = changedTouches[i];
						let point = {
							x: touch.pageX,
							y: touch.pageY,
							ID: touch.identifier
						};
						place(pointer, point)
						this.pointerAdjustment(point)
						this.pointers[touch.identifier] = point
					}
				} else if (type == "move") {
					for (let i = 0; i < changedTouches.length; i++) {
						const touch = changedTouches[i];
						let point = this.pointers[touch.identifier];
						if (point) {
							point.x = touch.pageX;
							point.y = touch.pageY;
						}
						place(pointer, point)
						this.pointerAdjustment(point)
					}
				} else if (type == "end") {
					for (let i = 0; i < changedTouches.length; i++) {
						const touch = changedTouches[i];
						if (this.pointers[touch.identifier]) {
							delete this.pointers[touch.identifier];
						}
					}
				}
			} else {
				let ID = event.button
				if (type == "start") {
					/// Add a new pointer to the list
					// const touch = event;
					// let point = {
					// 	x: touch.pageX,
					// 	y: touch.pageY,
					// 	ID: touch.button /// could be used to differntiate left and right clicks
					// };
					pointer = new Pointer(event.pageX, event.pageY, ID)
					this.pointerAdjustment(pointer)
					this.pointers[ID] = pointer
				} else if (type == "move") {
					/// upaate the pointer in the list, if none, then add a new one
					// const touch = event;

					/// check if the pointer already exsists
					pointer = this.pointers[ID];
					if (pointer) {
						// point.x = touch.clientX;
						// point.y = touch.clientY;

						/// if it does, update the position to the new one
						pointer.x = event.clientX;
						pointer.y = event.clientY;
					} else {
						// point = {
						// 	x: touch.pageX,
						// 	y: touch.pageY,
						// };

						/// if it doesn't, create a new poknter
						pointer = new Pointer(event.pageX, event.pageY, ID)
					}

					this.pointerAdjustment(pointer)
					this.pointers[ID] = pointer
				} else if (type == "end") {
					const touch = event
					// if (this.pointers[touch.button]) {
					// 	// delete this.pointers[touch.button];
					// }

					/// delete the pointer from the list if it esisits
					if (this.pointers[ID]) {
						// delete this.pointers[ID];
					}
				}
			}

			return pointer;
		},
		showPointers() {
			for (let point of this.pointers) {
				cordShow(point)
			}
		},
		pointerAdjustment() { },
		clearAllPointers() {
			console.log(this.pointers)
			this.pointers.length = 0
			console.log(this.pointers)
		},


		hidingCursor: false,
		cursorType: "",
		shouldHideCursor(bool = false) {
			if (bool) {
				Caldro.renderer.canvas.style.cursor = "none"
			} else {
				Caldro.renderer.canvas.style.cursor = this.cursorType;
			}
			this.hidingCursor = bool
		},
		setCursorType(cursorType = "default") {
			this.cursorType = Caldro.renderer.canvas.style.cursor = cursorType;
		},
	},

	debug(info, source = "Annonymous") {
		if (!this.info.logIssues) return;
		console.log("Error at " + source + ": " + info)
	},

	getVersion: function () {
		return this.info.version;
	},

	setCamera: function (CAMERA) {
		this.info.currentCamera = CAMERA
	},
	getCamera: function () {
		return this.info.currentCamera;
	},

	setShapeClippingCamera: function (CAMERA) {
		this.rendering.shapeClippingCamera = CAMERA;
	},

	setPlayer: function (PLAYER) {
		this.info.currentPlayer = PLAYER;
	},

	setKeyStateHandler: function (KEYSTATEHANDLER) {
		this.info.currentKeyStateHandler = KEYSTATEHANDLER
	},

	reportError: function (errorDescription, errorSource, caldroCausedError = false) {
		console.error(errorDescription + "\n" + "Error Source: " + errorSource)
		if (caldroCausedError) {
			// needs a better error handling system currently
		}
	},

	// ! ~Not in use~ !
	physics: {

		entities: {
			blocks: new Array(),
			triggers: new Array(),
			bodies: new Array(),
			autoUpdate: function () {

			},
		},

	},

	layout: {
		updateLayouts: NULLFUNCTION,
		updateButtons: function () {

		},
		updateJoysticks: function () {

		},
	},

	show: function () {
		let ratio = 1.6;
		let text = "Caldro";
		let color = "white"
		rect(0, 0, c.w, c.h, "black")
		// let twidth = cc.measureText(Caldro.info.displayText.text).width
		glow(randomNumber(0, 30), color)
		txt(text, c.xc, c.yc, font(c.w * ratio / (text.length)), color)
		txt(text, c.xc, c.yc, font(c.w * ratio / (text.length)), color)
		txt(text, c.xc, c.yc, font(c.w * ratio / (text.length)), color)
		glow(0)
	},

	start: function () {
		START_INFINITE_LOOPS()
		this.engine.START();
		this.engine.ONSTART();
	},
	init() {
		this.renderer._pixelatorCanvasContext = this.renderer._pixelatorCanvas.getContext("2d")
		this.screen.addPointer(0, 0, 0)
		try {
			init_controls();
			this.events.initializedImputControls = true
		} catch {
			console.error("Controls could not be initalized, try manually initiallzing in this page")
		}
	},
	engine: {
		running: false,
		UPDATE() { },
		FIXEDUPDATE() { },
		RENDER() { },
		ONSTART() { },
		START() {
			this.running = true;
		},
		KILL() {
			this.running = false
		},
	}
}

window.addEventListener("error", () => {
	Caldro.engine.KILL();
})



const INFINITE_UPDATE_LOOP = function () {
	window.requestAnimationFrame(INFINITE_UPDATE_LOOP);

	/// update Caldro time
	if (Caldro.time.update()) {
		if (Caldro.engine.running) {
			let updateTime = timeTask(() => {
				Caldro.engine.UPDATE();
			})
			let renderTime = timeTask(() => {
				Caldro.engine.RENDER();
			})

			/// heave task simulation
			// for(let i = 0; i < Math.round(Caldro.time.elapsedTime)*100000; ++i){
			// 	Math.sin(Math.cos(Math.sqrt(Math.random())))
			// }

			DEBUGGER.UPDATE(updateTime, renderTime)
			// c.getContext('2d').save();
			/// flipping coordinate system to match graph
			// c.getContext('2d').scale(1, -1);
			// c.getContext('2d').restore();
		}
		try {
		} catch {
			// console.error("Caldro infinite loop ain't looping")
		}
	}
}

let startedLoop = false
// start the infinite loop handled by Caldro
const START_INFINITE_LOOPS = function () {
	try {
		if (startedLoop) console.error("Cannot initialize the infinite loop more than once")
		INFINITE_UPDATE_LOOP()
		startedLoop = true
	} catch {
		console.error("Could not start loops for some reason")
	}
}

try {
	onCaldroLoad();
} catch { }

window.addEventListener("error", () => {
	Caldro.engine.KILL();
	Caldro.screen.setCursorType(CURSOR_TYPES.DEFAULT)
	console.warn("Killed the Engine to prevent infinite error messages")
})

export default Caldro