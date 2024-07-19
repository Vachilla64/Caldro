// Caldro
import { keyStateHandler, Pointer } from "./Caldro_Controls";
import { CALDBLUE, INFINITY, NULLFUNCTION } from "./Caldro_Utility_Constants";
import { c } from "./Caldro_Canvas";
import {
	rect,
	glow,
	font,
	txt,
	adjustCanvas,
	cc,
} from "./Caldro_Rendering";
import { place, randomNumber } from "./Caldro_Utility_Functions";
import { arraySum } from "./Caldro_Utility_Functions";
import { init_controls } from "./Caldro_Controls";
import { Lvector2D, vec2 } from "./Caldro_Vectors_and_Matrices";
import { getConstructorName } from "./Caldro_Utility_Functions";
import { spriteSheetManager } from "./Caldro_Image";
import { canvasImageManager } from "./Caldro_Image_Canvas_Manager";
import { imageHandler } from "./Caldro_Image";
/* var CaldroCam = new camera();
var CaldroPs = new particleSystem();
var CaldroKeys = new keyStateHandler(); */
var CaldroKeys = new keyStateHandler();
// let c = getCanvas();

export var CaldroSSM = new spriteSheetManager ();
export var CaldroCIM = new canvasImageManager();
export var CaldroIH = new imageHandler();



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
				if ((deltatime < 1 / ct._maxFPS)) {
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
		currentKeyStateHandler: CaldroKeys,
		// currentParticleSystem: CaldroPs,
	},

	renderer: {
		initializedImputControls: false,
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
		hidingCursor: false,
		cursorType: "",
		shouldHideCursor: function (bool = false) {
			if (bool) {
				this.canvas.style.cursor = "none"
			} else {
				this.canvas.style.cursor = this.cursorType;
			}
			this.hidingCursor = bool
		},
		setCursorType: function (cursorType = "arrow") {
			this.cursorType = this.canvas.style.cursor = cursorType;
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
		checkForPointerIn: function (area) {
			for (let point of Caldro.screen.pointers) {
				if (!point) continue
				if (pointIsIn(point, area)) {
					return true
				}
			}
			return false;
		},
		getFirstPointerIn: function (area) {
			for (let point of Caldro.screen.pointers) {
				if (!point) continue
				if (pointIsIn(point, area)) {
					return point;
				}
			}
			return null;
		},
		getPointersIn: function (area) {
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
		getPointer(ID = 0){
			return this.pointers[ID]
		},
		addPointer: function (x, y, id = generateRandomId()) {
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
		updatePointers: function (touchEvent, type = "idle") {
			let event = touchEvent;
			let pointer = new vec2(0, 0);
			if (event.changedTouches) {
				if (type == "start") {
					const changedTouches = event.changedTouches;
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
					const changedTouches = event.changedTouches;
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
					const changedTouches = event.changedTouches;
					for (let i = 0; i < changedTouches.length; i++) {
						const touch = changedTouches[i];
						if (this.pointers[touch.identifier]) {
							delete this.pointers[touch.identifier];
							// console.log(`Touch ${touch.identifier} ended`);
						}
					}
				}
			} else {
				// console.log(touchEvent)
				if (type == "start") {
					const touch = touchEvent;
					let point = {
						x: touch.pageX,
						y: touch.pageY,
						ID: touch.button
					};
					place(pointer, point)
					this.pointerAdjustment(point)
					this.pointers[touch.button] = point
				} else if (type == "move") {
					const touch = touchEvent;
					let point = this.pointers[touch.button];
					if (point) {
						point.x = touch.clientX;
						point.y = touch.clientY;
					} else {
						point = {
							x: touch.pageX,
							y: touch.pageY,
							ID: touch.button
						};
					}
					place(pointer, point)
					this.pointerAdjustment(point)
					this.pointers[touch.button] = point
				} else if (type == "end") {
					const touch = touchEvent
					if (this.pointers[touch.button]) {
						delete this.pointers[touch.button];
						// console.log(`Touch ${touch.identifier} ended`);
					}
				}
			}
			return pointer;
		},
		showPointers: function () {
			for (let point of this.pointers) {
				cordShow(point)
			}
		},
		pointerAdjustment: function () { }
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
		START() {
			this.running = true;
		},
		KILL() {
			this.running = false
		},
	}
}



const INFINITE_UPDATE_LOOP = function () {
	window.requestAnimationFrame(INFINITE_UPDATE_LOOP);
	if (Caldro.time.update()) {
		if(Caldro.engine.running){
			Caldro.engine.UPDATE();
			// c.getContext('2d').save();
			/// flipping coordinate system to match graph
			// c.getContext('2d').scale(1, -1);
			Caldro.engine.RENDER();
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
	console.log("running")
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

export default Caldro