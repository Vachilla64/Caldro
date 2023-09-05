"use strict"; // Caldro

/* var CaldroCam = new camera();
var CaldroPs = new particleSystem();
var CaldroKeys = new keyStateHandler(); */
var CaldroKeys = new keyStateHandler(); 



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
			ct.previousFrame = now
			ct._lastUpdateElapsedTime += deltatime
			
			if (ct._maxFPS) {
				if ((ct._lastUpdateElapsedTime < 1 / ct._maxFPS)) {
				// if ((deltatime < 1 / ct._maxFPS)) {
					return false;
				}
				ct._lastUpdateElapsedTime = 0
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
				meters: c.min / 10,
			}
		},
	},

	display: {
		aspectRatio: null,
	},

	info: {
		version: "0.3.0",
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
		canvas: c,
		context: c.getContext("2d"),
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
		handleMouseEvents: true,
		hnadleTouchSwipeEvents: false,
		handleTouchEvents: true,
		handleKeyboardEvents: true,
		swipeEventDetectionTimeRange: 0.3,
		swipeEventDetectionDistanceRange: 20,
		forceMapPointerEventToWindow: function (browserWindow = window) {
			browserWindow.ontouchstart = browserWindow.onmousedown = function(){
				pointStartEvent();
			}
			browserWindow.ontouchmove = browserWindow.onmousemove = function(){
				pointMoveEvent();
			};
			browserWindow.ontouchend = browserWindow.onmouseup = function(){
				pointEndEvent();
			};
		},
	},

	screen: {
		clicks: 0,
		pointers: new Array(),
		checkForPointerIn: function (area) {
			for (let point of Caldro.screen.pointers) {
				if (pointIsIn(point, area)) {
					return true
				}
			}
			return false;
		},
		getFirstPointerIn: function (area) {
			for (let point of Caldro.screen.pointers) {
				if (pointIsIn(point, area)) {
					return point;
				}
			}
			return null;
		},
		addPointer: function (x, y, id = generateRandomId()) {
			this.pointers.push(new Point2D(x, y))
		},
		updatePointers: function (touchEvent, type = "idle") {
			this.pointers.length = touchEvent.targetTouches.length;
			for (let touch = 0; touch < touchEvent.targetTouches.length; ++touch) {
				let point = new Point2D();
				point.x = touchEvent.targetTouches[touch].pageX
				point.y = touchEvent.targetTouches[touch].pageY
				this.pointers[touch] = point
			}
			if (type == "start") {

			} else if (type == "move") {

			} else if (type == "end") {

			}
		},
		showPointers: function () {
			for (let point of this.pointers) {
				cordShow(point)
			}
		}
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

	auto: {
		layout: {
			updateLayouts: NULLFUNCTION,
			updateButtons: function () {

			},
			updateJoysticks: function () {

			},
		}
	},

	show: function () {
		if (this.showActive) {
			let ratio = 1.6;
			rect(0, 0, c.w, c.h, "black")
			// let twidth = cc.measureText(Caldro.info.displayText.text).width
			glow(gen(0, 30), Caldro.info.displayText.color)
			txt(Caldro.info.displayText.text, c.xc, c.yc, font(c.w * ratio / (Caldro.info.displayText.text.length)), Caldro.info.displayText.color)
			txt(Caldro.info.displayText.text, c.xc, c.yc, font(c.w * ratio / (Caldro.info.displayText.text.length)), Caldro.info.displayText.color)
			txt(Caldro.info.displayText.text, c.xc, c.yc, font(c.w * ratio / (Caldro.info.displayText.text.length)), Caldro.info.displayText.color)
			glow(0)
		};
	},

	startAutoLoop: function () {
		CALDRO_INFINITE_LOOP()
	},
	init() {
		this.renderer._pixelatorCanvasContext = this.renderer._pixelatorCanvas.getContext("2d")
		init_controls();
	}
}
Caldro.init();



function MainLoop() { };
const CALDRO_INFINITE_LOOP = function () {
	window.requestAnimationFrame(CALDRO_INFINITE_LOOP);
	MainLoop()
}

if(onCaldroLoad){
	onCaldroLoad();
}