"use strict"; // Image_Canvas_Manager


// [SID]
class canvasImageManager {
	constructor(imageCanvas = document.createElement('canvas')) {
		this.canvas = imageCanvas;
		this.maxWidth = 10000; this.maxHeight = 10000;
		this.context = this.canvas.getContext("2d");
		this.backupCanvas = document.createElement('canvas');
		this.backupContext = this.backupCanvas.getContext("2d");
		this.resetCanvas = document.createElement('canvas');
		this.resetContext = this.resetCanvas.getContext("2d");
		this.drawingIds = [];
		this.drawings = [];
		this.spacing = 10;
		this.positioning = {
			x: this.spacing,
			y: this.spacing,
		};
	}
	createDrawingObject(id, x, y, width, height, drawing, ImageData) {
		return {
			id: id,
			x: x,
			y: y,
			width: width,
			height: height,
			ImageData: ImageData,
		}
	};
	addDrawing(canvas, id = 'drawing', x = 0, y = 0, drawingWidth = -1, drawingHeight = -1, imageSmoothing = false) {
		if (!this.drawingIds.includes(id)) {
			/*let src = context.getImageData(x, y, drawingWidth, drawingHeight);
			let copy = context.createImageData(src.width, src.height)
			for (let i = 0; i < src.data.length; ++i) {
				copy.data[i] = src.data[i]
			}
			this.context.putImageData(src, x, y)
			context.restore();
			*/
			let copy;
			this.context.imageSmoothingEnabled = false;
			if (this.positioning.x + drawingWidth > this.canvas.width) {
				this.backupCanvas.width = this.canvas.width;
				this.backupCanvas.height = this.canvas.height;
				this.backupContext.imageSmoothingEnabled = false
				this.backupContext.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.backupCanvas.width, this.backupCanvas.height);
				this.canvas.width = (this.positioning.x + drawingWidth + this.spacing)
				this.context.imageSmoothingEnabled = false
				this.context.drawImage(this.backupCanvas, 0, 0);
			}

			if (this.positioning.y + drawingHeight > this.canvas.height) {
				this.backupCanvas.width = this.canvas.width;
				this.backupCanvas.height = this.canvas.height;
				this.backupContext.imageSmoothingEnabled = false
				this.backupContext.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.backupCanvas.width, this.backupCanvas.height);
				this.canvas.height = (this.positioning.y + drawingHeight + this.spacing)
				this.context.imageSmoothingEnabled = false
				this.context.drawImage(this.backupCanvas, 0, 0);
			}

			this.context.imageSmoothingEnabled = imageSmoothing
			this.context.drawImage(canvas, x, y, drawingWidth, drawingHeight, this.positioning.x, this.positioning.y, drawingWidth, drawingHeight)
			this.drawings.push(this.createDrawingObject(id, this.positioning.x, this.positioning.y, drawingWidth, drawingHeight, copy));
			this.positioning.y += drawingHeight + this.spacing;
			this.drawingIds.push(id);
		};
	};
	setDrawing(canvas, id = 'drawing', x = 0, y = 0, drawingWidth = -1, drawingHeight = -1) {
		if (!this.drawingIds.includes(id)) {
			/*let src = context.getImageData(x, y, drawingWidth, drawingHeight);
			let copy = context.createImageData(src.width, src.height)
			for (let i = 0; i < src.data.length; ++i) {
				copy.data[i] = src.data[i]
			}
			this.context.putImageData(src, x, y)
			context.restore();
			*/
			let copy;
			this.context.imageSmoothingEnabled = false;
			if (this.positioning.x + drawingWidth > this.canvas.width) {
				this.backupCanvas.width = this.canvas.width;
				this.backupCanvas.height = this.canvas.height;
				this.backupContext.imageSmoothingEnabled = false
				this.backupContext.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.backupCanvas.width, this.backupCanvas.height);
				this.canvas.width = (this.positioning.x + drawingWidth + this.spacing)
				this.context.imageSmoothingEnabled = false
				this.context.drawImage(this.backupCanvas, 0, 0);
			}

			if (this.positioning.y + drawingHeight > this.canvas.height) {
				this.backupCanvas.width = this.canvas.width;
				this.backupCanvas.height = this.canvas.height;
				this.backupContext.imageSmoothingEnabled = false
				this.backupContext.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.backupCanvas.width, this.backupCanvas.height);
				this.canvas.height = (this.positioning.y + drawingHeight + this.spacing)
				this.context.imageSmoothingEnabled = false
				this.context.drawImage(this.backupCanvas, 0, 0);
			}

			this.context.imageSmoothingEnabled = false
			this.context.drawImage(canvas, x, y, drawingWidth, drawingHeight, this.positioning.x, this.positioning.y, drawingWidth, drawingHeight)
			this.drawings.push(this.createDrawingObject(id, this.positioning.x, this.positioning.y, drawingWidth, drawingHeight, copy));
			this.positioning.y += drawingHeight + this.spacing;
			this.drawingIds.push(id);
		} else {
			let drawing;
			let drawingNotFound = true;
			this.drawings.find(function (Drawing) {
				let sameDrawing = Drawing.id == id;
				if (sameDrawing) {
					drawing = Drawing;
					drawingNotFound = false;
				}
				return sameDrawing;
			});
			if (drawingNotFound) {
				console.error("Drawing not found, No drawing with and Id of '" + id + "' was found")
			}
			this.context.drawImage(canvas, x, y, drawingWidth, drawingHeight, drawing.x, drawing.y, drawing.width, drawing.height)
			drawing.width = drawingWidth
			drawing.height = drawingHeight	
		};
	};
	draw(context, drawingId = 'Vachila64', x = 0, y = 0, width = null, height = null, centralizeImage = false, angle = 0) {
		if (this.drawingIds.includes(drawingId)) {
			let drawing;
			let drawingNotFound = true;
			this.drawings.find(function (Drawing) {
				let sameDrawing = Drawing.id == drawingId;
				if (sameDrawing) {
					drawing = Drawing;
					drawingNotFound = false;
				}
				return sameDrawing;
			});
			/*for(let i = 0; i < this.drawings.length; ++i){
				if(this.drawings[i].id == drawingId){
					drawing = this.drawings[i];
					drawingNotFound = false;
					drawingNotFound = false;
					break;
				}
			}
			*/
			if (width == null) {
				width = drawing.width
			}
			if (height == null) {
				height = drawing.height
			}
			if (!centralizeImage) {
				context.drawImage(this.canvas, drawing.x, drawing.y, drawing.width, drawing.height, x, y, width, height)
			} else {
				context.save();
				context.translate(x, y);
				context.rotate(degToRad(angle));
				context.drawImage(this.canvas, drawing.x, drawing.y, drawing.width, drawing.height, -width / 2, -height / 2, width, height);
				context.restore();
			}
		} else {
			console.error("Drawing not found, No drawing with and Id of '" + drawingId + "' was found")
		}
	};

	updateDrawings() {
	};
}



// rendering classes
class imageHandler {
	constructor() {
		this.images = new Array();
		this.addImages = 0;
		this.loadedImages = 0;
		this.loaded = false
		this.fileNamePrefix = ""
	}
	createImageObject(image) {
		return image;
	}
	getImage(imageID){
		return this.images[imageID];
	}
	addImage(imageID, src, ImageWidth = 64, ImageHeight = 64, onload = null) {
		let img = new Image(ImageWidth, ImageHeight)
		let handler = this;
		img.src = this.fileNamePrefix + src;
		img.hasLoaded = false;
		img.onload =  ()=> {
			if(onload) onload(img);
			img.hasLoaded = true
			handler.loadedImages++
			if(handler.loadedImages == handler.addImages){
				handler.loaded = true
				handler.onload()
			}
		}
		this.images[imageID] = handler.createImageObject(img)
		this.addImages++
	}
	draw(imageID, x = 0, y = 0, width = null, height = null, centralized = false, angle = 0) {
		let img = this.images[imageID];
		if (!img) {
			console.error(`Image HandlerError: No image with an id of '${imageID}' was found`)
			// return;
		}
		if (!img.hasLoaded) return;
		if (!width) {
			width = img.width
		}
		if (!height) {
			height = img.height
		}
		let context = Caldro.renderer.context;
		if (centralized) {
			context.save();
			context.translate(x, y);
			context.rotate(degToRad(angle));
			context.drawImage(img, -width / 2, -height / 2, width, height)
			context.restore();
			return;
		}
		context.imageSmoothingEnabled = false;
		context.drawImage(img, x, y, width, height)
	}
	onload(){};
}

class spriteSheetManager {
	constructor(spritesheet, spriteSheetWidth = 1280, spriteSheetHeight = 1280) {
		if (spritesheet) {
			this.initialize(spritesheet, spriteSheetWidth, spriteSheetHeight)
		}
		this.spriteSheet;
		this.initialized = false;
		this.sprites = new Array()
	}
	initialize(spritesheet, spriteSheetWidth, spriteSheetHeight) {
		if(this.initialized) return;
		if (typeof spritesheet == "string") {
			this.spriteSheet = new Image(spriteSheetWidth, spriteSheetHeight);
			this.spriteSheet.src = spritesheet;
			let SPmanager = this;
			this.spriteSheet.onload = function () {
				SPmanager.initialized = true;
				SPmanager.onInit()
			}
		} else if(getConstructorName(spritesheet) == 'HTMLImageElement'){
			this.spritesheet = spritesheet;
			this.onInit()
		} else {
			console.error(`${getConstructorName(this)} error: Spritesheet passed is neither an image src or a HTMLImageElement`)
		}
	}
	cutSubImage(spriteID, x, y, width, height) {
		if (x + width > this.spriteSheet.width || y + height > this.spriteSheet.height) {
			console.error("SpriteSheet Error: Selected area for subImage '" + spriteID + "' is not within the bounds of the spritesheet :(")
			return;
		}
		let spriteInfo = {
			x: x,
			y: y,
			width: width,
			height: height,
		}
		this.sprites[spriteID] = spriteInfo;
	}
	draw(spriteID, x, y, width = null, height = null, centralized = false, angle = 0, flippedX = false, flippedY = false) {
		if (!this.initialized) return;
		let subImage = this.sprites[spriteID];
		if (!subImage) {
			console.error("SpriteSheet Error: No subImage with an ID of '" + spriteID + "' was cut for the spriteSheetManager")
			return false;
		}
		drawImagePortion(this.spriteSheet, subImage.x, subImage.y, subImage.width, subImage.height, x, y, width, height, centralized, angle, flippedX, flippedY)
		return true
	}
	onInit() { }
}

var CaldroSSM = new spriteSheetManager();
var CaldroCIM = new canvasImageManager();
var CaldroIH = new imageHandler();



function drawImage(img, x, y, width, height, centralized = false, angle = 0, flippedX = false, flippedY = false) {
	let context = Caldro.renderer.context;
	if (!centralized) {
		context.save();
		context.rotate(degToRad(angle));
		context.scale(1 + (-2 * flippedX), 1 + (-2 * flippedY))
		context.drawImage(img, x, y, width, height)
		context.restore();
	} else {
		context.save();
		context.translate(x, y);
		context.rotate(degToRad(angle));
		context.scale(1 + (-2 * flippedX), 1 + (-2 * flippedY))
		context.drawImage(img, -width / 2, -height / 2, width, height)
		context.restore();
	}
}

function drawImagePortion(img, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height, centralized = false, angle = 0, flippedX = false, flippedY = false) {
	let context = Caldro.renderer.context;
	if (!centralized) {
		context.save();
		context.rotate(degToRad(angle));
		context.scale(1 + (-2 * flippedX), 1 + (-2 * flippedY))
		context.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
		context.restore();
	} else {
		context.save();
		context.translate(x, y);
		context.rotate(degToRad(angle));
		context.scale(1 + (-2 * flippedX), 1 + (-2 * flippedY))
		context.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, -width / 2, -height / 2, width, height);
		context.restore();
	}
}