// Image_Canvas_Manager


// [SID]
export class CanvasImageManager {
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

