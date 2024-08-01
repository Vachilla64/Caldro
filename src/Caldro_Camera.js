import { c } from "./Caldro_Canvas.js";
import { classicAABB } from "./Caldro_ClassicPhysics.js";
import { Point2D } from "./Caldro_Physics.js";
import Caldro from "./Caldro.js";
import { clip, cosine, degToRad, sine } from "./Caldro_Math.js";
import { Lvector2D, vec2D, vecMath } from "./Caldro_Vectors_and_Matrices.js";
import { NULLFUNCTION, ORIGIN } from "./Caldro_Utility_Constants.js";
import { angleBetweenPoints, castRay } from "./Caldro_Physics_Utilities.js";
import { dist2D, doTask, generateRandomId, getConstructorName, getRandomPointIn, place } from "./Caldro_Utility_Functions.js";
import { alpha, circle, drawRay, Rect, stRect, stTriangle, triangle } from "./Caldro_Rendering.js";
import { cordShow } from "./Caldro_Renderers.js";
import { loadFromLocalStorage, saveToLocalStorage } from "./Caldro_LocalStorage.js";

// [SID]
export class Camera {
	constructor(canvas = c) {
		this.x = 0;
		this.y = 0;
		this.width = canvas.width;
		this.height = canvas.height;
		this.aabb = new classicAABB(this.x - this.width * 0.5, this.y - this.height * 0.5, this.x + this.width * 0.5, this.y + this.height * 0.5)
		this.inWorldBounds = {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
		}
		this.zoom = new vec2D(1, 1); // a vector specifiying the x and y zoom levels
		this.canvas = Caldro.renderer.canvas // storing the cnavas for reference 
		this.context = Caldro.renderer.canvas.getContext('2d') // storing the context for reference
		this.capturing = false; // will be true inbeween start() and end() calls of the camear
		this.autoUpdateAssignedCanvas = false; // if true, will update the refernce canvas to the current Caldro main canvas
		this.angle = 0; // angle in degrees
		this.frame = 0; // 0 means nothing rendered
		this.translationX = this.camtranslationX = 0;
		this.translationY = this.camtranslationY = 0;
		this.pointer = new Point2D();

	}

	getAABB() {
		this.aabb.min.x = this.x - this.width * 0.5
		this.aabb.max.x = this.x + this.width * 0.5
		this.aabb.min.y = this.y - this.height * 0.5
		this.aabb.max.y = this.y + this.height * 0.5
		return this.aabb
	}
	clipZoom(zoom, min, max) {
		if (!zoom) zoom = this.zoom.x
		this.zoom.x = clip(zoom, min, max)
		this.zoom.y = clip(zoom, min, max)
	}
	setZoom(zoom) {
		this.zoom.x = zoom
		this.zoom.y = zoom
		this.width = this.canvas.width * (1 / this.zoom.x);
		this.height = this.canvas.height * (1 / this.zoom.y);
	}
	addZoom(zoom, targetPoint) {
		zoom *= 0.1
		// camera.zoom += camera.zoomSpeed * camera.zoom * Caldro.time.deltatime;
		this.zoom.x += zoom * this.zoom.x
		this.zoom.y += zoom * this.zoom.y
		// this.zoom
		this.width = this.canvas.width * (1 / this.zoom.x);
		this.height = this.canvas.height * (1 / this.zoom.y);
		if (targetPoint) {
			let difference = vecMath.subtract(this, targetPoint)
			vecMath.subtract(this, vecMath.divideByVector(difference, this.zoom), true)
		}
	}

	getBounds() {
		this.width = this.canvas.width * (1 / this.zoom.x);
		this.height = this.canvas.height * (1 / this.zoom.y);
		return {
			top: this.y - this.height * 0.5,
			bottom: this.y + this.height * 0.5,
			left: this.x - this.width * 0.5,
			right: this.x + this.width * 0.5,
			width: this.width,
			height: this.height,
		}
	}

	setCanvas(canvas) {
		if (getConstructorName(canvas) !== "HTMLCanvasElement") {
			console.log("Canvas argument passed is not a canvas: ", canvas); return;
		}
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
	}

	persistStart() { };
	persistContinuous() { };
	enablePersistence(localStorageID) {
		this.persistStart = () => {
			if (this.frame === 0) {
				let posInfo = loadFromLocalStorage(localStorageID)
				if (posInfo) {
					posInfo = JSON.parse(posInfo)
					this.x = parseFloat(posInfo.x)
					this.y = parseFloat(posInfo.y)
					place(this.zoom, posInfo.zoom)
					this.angle = parseFloat(posInfo.angle)
				}
			}
		}
		this.persistContinuous = () => {
			saveToLocalStorage(localStorageID, JSON.stringify({
				x: this.x, y: this.y, zoom: this.zoom, angle: this.angle
			}))
		}
	}

	showCamera(otherCamera) {
		otherCamera.start();
		otherCamera.end();

		let sizeMultiplier = 1 / this.zoom.x
		alpha(0.4)
		drawRay(otherCamera, 100 * sizeMultiplier, otherCamera.angle, "red", 10 * sizeMultiplier)
		triangle(otherCamera.x, otherCamera.y, 100 * sizeMultiplier, "lime", otherCamera.angle)
		stTriangle(otherCamera.x, otherCamera.y, 100 * sizeMultiplier, "white", otherCamera.angle, 10 * sizeMultiplier)
		alpha(0.2)
		Rect(otherCamera.x, otherCamera.y, otherCamera.width, otherCamera.height, "white", otherCamera.angle)
		let borderWidth = 40 * sizeMultiplier
		// stRect(otherCamera.x, otherCamera.y, otherCamera.width - borderWidth, otherCamera.height - borderWidth, "white", borderWidth, otherCamera.angle)
		alpha(1)
	}

	updatePointer(pointer) {
		let magnificationX = ((this.canvas.width * (1 / this.zoom.x)) / this.canvas.wwith)
		let magnificationY = ((this.canvas.height * (1 / this.zoom.y)) / this.canvas.height)
		this.pointer.x = this.x + (pointer.x * magnificationX) - ((this.canvas.width / 2) * magnificationX)
		this.pointer.y = this.y + (pointer.y * magnificationY) - ((this.canvas.height / 2) * magnificationY)
		return new Point2D(this.pointer.x, this.pointer.y)
	}

	getPointer(pointer = Caldro.screen.getPointer()) {
		if (!pointer) return
		let screenSpace = this.canvas
		let magnificationX = ((screenSpace.width * (1 / this.zoom.x)) / screenSpace.width)
		let magnificationY = ((screenSpace.height * (1 / this.zoom.y)) / screenSpace.height)
		let point = new Point2D(
			this.x + (pointer.x * magnificationX) - ((screenSpace.width / 2) * magnificationX)
			,
			this.y + (pointer.y * magnificationY) - ((screenSpace.height / 2) * magnificationY)
		);
		point = castRay(this.x, this.y, this.angle + angleBetweenPoints(this, point), dist2D(this, point))
		return point
	}


	start() {
		this.persistStart()
		this.clipZoom(null, 2, 20)
		if (this.autoUpdateAssignedCanvas) this.setCanvas(Caldro.renderer.canvas);
		this.capturing = true;
		this.pre_shot();

		let cc = this.context

		// adjust camera width and height accounting for zoom
		this.width = this.canvas.width * (1 / this.zoom.x);
		this.height = this.canvas.height * (1 / this.zoom.y);


		// canvas likes radians so yeah
		let radAngle = degToRad(this.angle)

		// save the context so we can do weird stuff
		cc.save();

		// scale the canvas for zoom. I apply this first cos the other transformations already take the scale into considerations throught the width and height of the camera
		cc.scale(this.zoom.x, this.zoom.y)
		// translate the canvas origin to the camera center but at 0, 0
		cc.translate(this.width / 2, this.height / 2)
		// rotate the canvas here so that eveything takes on this rotation properly
		cc.rotate(-radAngle);
		// translate the canavs to the x and y of the camera, since translates stack, this already takes into account the center translation from ealier
		cc.translate(-this.x, -this.y)

		// updating the frame counter here so the callback can access the correct frame number
		++this.frame;
		this.callback();
		this.persistContinuous();


		// do any blurs or white screen or blackscreen stuff here
	};

	pre_shot() { };
	callback() { };
	post_shot() { };

	end() {
		let cc = this.context
		cc.restore();
		this.capturing = false
		this.post_shot();
	};

	mimicCamera(referrence_camera = this) {
		this.x = referrence_camera.x;
		this.y = referrence_camera.y;
		this.zoom = referrence_camera.zoom;
		// this.actualOffsetX = referrence_camera.actualOffsetX;
		// this.actualOffsetY = referrence_camera.actualOffsetY;
		this.angle = referrence_camera.angle;
	};
}

/// acting as a backup, will remove soon
// [SID]
export class Cimera {
	constructor(canvas = c) {
		this.x = 0;
		this.y = 0;
		this.width = canvas.width;
		this.height = canvas.height;
		this.aabb = new classicAABB(this.x - this.width * 0.5, this.y - this.height * 0.5, this.x + this.width * 0.5, this.y + this.height * 0.5)
		this.inWorldBounds = {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
		}
		this.target = {
			position: new Point2D(0, 0),
			zoom: 1,
			trackingSpeed: new Point2D(3, 3),
			offsetTrackingSpeed: new Point2D(3, 3),
			zoomSpeed: 3,
			active: false,
			followX: true,
			followY: true,
			affectZoom: true,
			affectOffset: true,
			offset: {
				x: 0,
				y: 0,
			},
			setTrackingSpeed(x, y) {
				if (x != null)
					this.trackingSpeed.x = x
				if (y != null)
					this.trackingSpeed.y = y
			},
			setTarget(target) {
				this.position.x = target.x
				this.position.y = target.y
			},
			setOffset(x, y) {
				this.offset.x = x;
				this.offset.y = y;
			},
		}
		this.zoom = 1;
		this.canvas = Caldro.renderer.canvas
		this.context = Caldro.renderer.context
		this.zoomSpeed = 3;
		this.zoomRatio = 446;
		this.adjustedZoom = 1;
		this.attachment = null;
		this.attached = false;
		this.capturing = false;
		this.autoUpdateAssignedCanvas = false;
		this.actualOffsetX = 0;
		this.actualOffsetY = 0;
		this.shakeOffsetX = 0;
		this.shakeOffsetY = 0;
		this.angle = 0;
		this.frame = 0;
		this.speed = 200;
		this.shakeOffsetResetFrequency = 20;
		this.lastOFfsetReset = 0;
		this.translationX = this.camtranslationX = 0;
		this.translationY = this.camtranslationY = 0;
		this.pointer = new Point2D();
		this.shakeResolutioinsSpeed = 100
		this.data = new Array();
		let thisCamera = this
		this.Frame = {
			visible: false,
			type: "fill",
			color: "black",
			visibleFrames: [1, 2, 3, 4],
			thickness: 10,
			lineWidth: 5,
			render() {
				if (!this.visible) return;
				let w = thisCamera.canvas.width;
				let h = thisCamera.canvas.height;
				let x = this.x;
				let y = this.y;
				let color = this.color
				let size = this.thickness * 2
				let lineWidth = this.lineWidth;
				if (this.type == "fill") {
					if (this.visibleFrames.includes(1)) {
						Rect(w / 2, 0 + size / 2, w, size, color)
					}
					if (this.visibleFrames.includes(2)) {
						Rect(0 + size / 2, h / 2, size, h, color)
					}
					if (this.visibleFrames.includes(3)) {
						Rect(w / 2, h - size / 2, w, size, color)
					}
					if (this.visibleFrames.includes(4)) {
						Rect(w - size / 2, h / 2, size, h, color)
					}
				} else if (this.type == "stroke") {
					if (this.visibleFrames.includes(1)) {
						stRect(w / 2, 0 + size / 2, w - size * 2, size, color, lineWidth)
					}
					if (this.visibleFrames.includes(2)) {
						stRect(0 + size / 2, h / 2, size, h, color, lineWidth)
					}
					if (this.visibleFrames.includes(3)) {
						stRect(w / 2, h - size / 2, w - size * 2, size, color, lineWidth)
					}
					if (this.visibleFrames.includes(4)) {
						stRect(w - size / 2, h / 2, size, h, color, lineWidth)
					}
				} else if (this.type == "" || this.type == "custom") {
					this.costumFrame(x, y, w, h, this.visibleFrames, this.color)
				}
			},
			costumFrame() { }
		}
	}

	getAABB() {
		this.aabb.min.x = this.x - this.width * 0.5
		this.aabb.max.x = this.x + this.width * 0.5
		this.aabb.min.y = this.y - this.height * 0.5
		this.aabb.max.y = this.y + this.height * 0.5
		return this.aabb
	}

	setZoom(zoom) {
		this.zoom = zoom;
		this.width = this.canvas.width * (1 / this.zoom);
		this.height = this.canvas.height * (1 / this.zoom);
	}

	limitWithinBox(boundingBox) {
		if (this.x - this.width / 2 < boundingBox.x - boundingBox.width / 2) {
			this.x = boundingBox.x - boundingBox.width / 2 + this.width / 2
		} else if (this.x + this.width / 2 > boundingBox.x + boundingBox.width / 2) {
			this.x = boundingBox.x + boundingBox.width / 2 - this.width / 2
		}
		if (this.y - this.height / 2 < boundingBox.x - boundingBox.height / 2) {
			this.y = boundingBox.y - boundingBox.height / 2 + this.height / 2
		} else if (this.y + this.height / 2 > boundingBox.y + boundingBox.height / 2) {
			this.y = boundingBox.y + boundingBox.height / 2 - this.height / 2
		}
	}

	getBounds() {
		this.width = this.canvas.w * (1 / this.zoom);
		this.height = this.canvas.h * (1 / this.zoom);
		return {
			top: this.y - this.height * 0.5,
			bottom: this.y + this.height * 0.5,
			left: this.x - this.width * 0.5,
			right: this.x + this.width * 0.5,
			width: this.width,
			height: this.height,
		}
	}

	setCanvas(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
	}

	persistStart() { };
	persistContinuous() { };
	enablePersistence(localStorageID) {
		this.persistStart = () => {
			if (this.frame === 0) {
				let posInfo = loadFromLocalStorage(localStorageID)
				if (posInfo) {
					posInfo = JSON.parse(posInfo)
					this.x = parseFloat(posInfo.x)
					this.y = parseFloat(posInfo.y)
					this.zoom = parseFloat(posInfo.zoom)
				}
			}
		}
		this.persistContinuous = () => {
			saveToLocalStorage(localStorageID, JSON.stringify({
				x: this.x, y: devCam.y, zoom: devCam.zoom
			}))
		}
	}

	mimicCamera(referrence_camera = this) {
		this.x = referrence_camera.x;
		this.y = referrence_camera.y;
		this.zoom = referrence_camera.zoom;
		this.actualOffsetX = referrence_camera.actualOffsetX;
		this.actualOffsetY = referrence_camera.actualOffsetY;
		this.angle = referrence_camera.angle;
	};

	showCamera(otherCamera) {

		otherCamera.start();
		circle(-otherCamera.x, otherCamera.y, 30, "yellow")
		// Rect(otherCamera.width*0.5, otherCamera.height*0.5, otherCamera.width, otherCamera.height, "white")
		// Rect(otherCamera.x, otherCamera.y, otherCamera.width, otherCamera.height, "white", otherCamera.angle)
		cordShow(otherCamera, "lime", 100, 2)
		otherCamera.end();

		alpha(0.4)
		drawRay(camera, 100, camera.angle, "red", 10)
		triangle(otherCamera.x, otherCamera.y, 100, "lime", otherCamera.angle)
		stTriangle(otherCamera.x, otherCamera.y, 100, "white", otherCamera.angle, 10)
		alpha(0.2)
		Rect(otherCamera.x, otherCamera.y, otherCamera.width, otherCamera.height, "white", otherCamera.angle)
		let borderWidth = 40
		stRect(otherCamera.x, otherCamera.y, otherCamera.width - borderWidth, otherCamera.height - borderWidth, "white", borderWidth, otherCamera.angle)
		alpha(1)
	}

	updatePointer(pointer) {
		let magnificationX = ((this.canvas.width * (1 / this.adjustedZoom)) / this.canvas.wwith)
		let magnificationY = ((this.canvas.height * (1 / this.adjustedZoom)) / this.canvas.height)
		this.pointer.x = this.x + (pointer.x * magnificationX) - ((this.canvas.width / 2) * magnificationX)
		this.pointer.y = this.y + (pointer.y * magnificationY) - ((this.canvas.height / 2) * magnificationY)
		return new Point2D(this.pointer.x, this.pointer.y)
	}

	getPointer(pointer = Caldro.screen.getPointer()) {
		if (!pointer) return
		let magnificationX = ((this.canvas.width * (1 / this.adjustedZoom)) / this.canvas.width)
		let magnificationY = ((this.canvas.height * (1 / this.adjustedZoom)) / this.canvas.height)
		this.pointer.x = this.x + (pointer.x * magnificationX) - ((this.canvas.width / 2) * magnificationX)
		this.pointer.y = this.y + (pointer.y * magnificationY) - ((this.canvas.height / 2) * magnificationY)
		return new Point2D(this.pointer.x, this.pointer.y)
	}

	resetOffset(resetShakeOffset = true, resetActualOffset = false) {
		if (resetActualOffset) {
			this.actualOffsetX = this.actualOffsetY = 0;
		}
		if (resetShakeOffset) {
			this.shakeOffsetX = this.shakeOffsetY = 0;
		}
	};

	start(deltatime = Caldro.time.deltatime) {
		this.persistStart()
		if (this.autoUpdateAssignedCanvas) this.setCanvas(Caldro.renderer.canvas);
		this.pre_shot();

		if (this.target.active) {
			let speedX = this.target.trackingSpeed.x
			let speedY = this.target.trackingSpeed.y
			let targetZoom = this.target.zoom
			let targetPosition = this.target.position
			if (this.target.affectZoom)
				this.zoom = approach(this.zoom, targetZoom, this.target.zoomSpeed, deltatime).value
			if (this.target.followX)
				this.x = approach(this.x, targetPosition.x, speedX, deltatime).value
			if (this.target.followY)
				this.y = approach(this.y, targetPosition.y, speedY, deltatime).value
			if (this.target.affectOffset) {
				this.actualOffsetX = approach(this.actualOffsetX, this.target.offset.x, this.target.offsetTrackingSpeed.x, deltatime).value
				this.actualOffsetY = approach(this.actualOffsetY, this.target.offset.y, this.target.offsetTrackingSpeed.y, deltatime).value
			}
		}

		let cc = this.context
		this.capturing = true;
		this.width = this.canvas.width * (1 / this.zoom);
		this.height = this.canvas.height * (1 / this.zoom);
		if (this.attached == true) {
			place(this, this.attachment);
		}
		// this.adjustedZoom = this.zoom

		let offsetX = this.actualOffsetX + this.shakeOffsetX;
		let offsetY = this.actualOffsetY + this.shakeOffsetY;

		// distance from 0.0 to the top left of the canvas (in screen space)
		let topLeftToCenterLength = dist2D(ORIGIN, new vec2D(this.width / 2, this.height / 2));
		// let topLeftToCenterLength = vecMath.distance(ORIGIN, new vec2D(this.width / 2, this.height / 2));

		this.camtranslationX = -((this.x + offsetX) - ((this.canvas.width / 2) * 1 / this.adjustedZoom))
		this.camtranslationY = -((this.y + offsetY) - ((this.canvas.height / 2) * 1 / this.adjustedZoom))

		// displacedmt of camear from 0.0 to half with and height of the canvas, taking into account tzoom level (in screen space)
		let translation = new vec2D(this.camtranslationX, this.camtranslationY);

		// angle from a vector straight up to a vector top left of the canvas
		let offsetAngle = angleBetweenPoints(ORIGIN, translation);

		// same as tranlation
		let castVec = castRay(this.x, this.y, offsetAngle - this.angle, topLeftToCenterLength)


		place(translation, castVec)






		let radAngle = -degToRad(this.angle)
		// offsetX = offsetY = null;

		cc.save();
		cc.scale(this.zoom, this.zoom);
		cc.translate(translation.x, translation.y);
		// cc.rotate(-radAngle);
		++this.frame;
		this.callback();
		this.persistContinuous();
	};

	pre_shot() { };
	callback() { };
	post_shot() { };

	end() {
		let cc = this.context
		cc.restore();
		let lastOFfsetReset = performance.now() - this.lastOFfsetReset;
		if (this.shakeOffsetResetFrequency < lastOFfsetReset) {
			this.lastOFfsetReset = performance.now();
			this.shakeOffsetX += (-this.shakeOffsetX * 1.9)
			this.shakeOffsetY += (-this.shakeOffsetY * 1.9)
		}
		this.capturing = false
		this.post_shot();
		this.Frame.render();
	};

	setOffset(offsetX, offsetY) {
		if (offsetX != null) {
			this.actualOffsetX = offsetX
		}
		if (offsetY != null) {
			this.actualOffsetY = offsetY
		}
	}

	shake(maxOffsetX, maxOffsetY = 0) {
		this.shakeOffsetX = randomNumber(-maxOffsetX, maxOffsetX)
		this.shakeOffsetY = randomNumber(-maxOffsetY, maxOffsetY)
	}

	attach(object) {
		this.attachment = object;
		this.attached = true;
	};

	dettach() {
		this.attachment = null;
		this.attached = false;
	};
}

// current Cammra is from the game (camera beeing seen),
// camera is the caemra to make a devcam
// otherCames is the game camea
export function setupDevcamControls(currentCamera, devCamera, otherCamera, keyStateHandler, speed = 200, zoomSpeed = 3) {
	keyStateHandler.addKey(0, "m", NULLFUNCTION, function () {
		devCamera.mimicCamera(otherCamera)
	})
	keyStateHandler.addKey(0, "u", NULLFUNCTION, function () {
		devCamera.addZoom(zoomSpeed)
	})

	keyStateHandler.addKey(0, "o", NULLFUNCTION, function () {
		devCamera.addZoom(-zoomSpeed)
	})

	keyStateHandler.addKey(0, "i", NULLFUNCTION, function () {
		devCamera.y -= speed * (1 / devCamera.zoom.y) * Caldro.time.deltatime;
	})

	keyStateHandler.addKey(0, "j", NULLFUNCTION, function () {
		devCamera.x -= speed * (1 / devCamera.zoom.x) * Caldro.time.deltatime;
	})

	keyStateHandler.addKey(0, "k", NULLFUNCTION, function () {
		devCamera.y += speed * (1 / devCamera.zoom.y) * Caldro.time.deltatime;
	})

	keyStateHandler.addKey(0, "l", NULLFUNCTION, function () {
		devCamera.x += speed * (1 / devCamera.zoom.x) * Caldro.time.deltatime;
	})
}
