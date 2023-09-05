"use strict"; // Rendering

"use strict"; // Rendering

var c = createMainCanvas(true, "Caldro_Canvas");
var cc = c.getContext("2d")
c.style.position = 'fixed';
c.onresize = NULLFUNCTION;

function getCanvasDimensions(canvas) {
	return {
		w: canvas.width,
		h: canvas.height,
		vw: canvas.width / 100,
		vh: canvas.height / 100,
		hw: canvas.width / 2,
		hh: canvas.height / 2,
		xc: canvas.width / 2,
		yc: canvas.height / 2,
		min: Math.min(canvas.width, canvas.height),
		max: Math.max(canvas.width, canvas.height),
		vmin: Math.min(canvas.width, canvas.height) / 100,
		vmax: Math.max(canvas.width, canvas.height) / 100,
	}
}

function setImageSmoothing(context = Caldro.renderer.context, state = false) {
	context.imageSmoothingEnabled = state
}

function adjustCanvas(canvas = c, width = window.innerWidth, height = window.innerHeight, aspectRatio = Caldro.display.aspectRatio) {
	canvas.formerWidth = canvas.width;
	canvas.formerHeight = canvas.height;

	if (aspectRatio) {
		let cw, ch;
		c.style.padding = "0px"
		{
			if (width > height) { // landscape
				ch = height;
				cw = (height * aspectRatio[0]) / aspectRatio[1]
				c.style.paddingLeft = `${(width - cw) / 2}px`
			} else { // potraint
				cw = width;
				ch = (width * aspectRatio[1]) / aspectRatio[0]
				c.style.paddingTop = `${(height - ch) / 2}px`
			}
		}
		width = cw
		height = ch
	}

	canvas.width = width
	canvas.height = height
	if (canvas.formerWidth != canvas.width || canvas.formerHeight != canvas.height) {
		if (canvas.onresize) {
			canvas.onresize();
		} else {
			canvas.onresize = NULLFUNCTION;
		}
	}
	canvas.w = canvas.width;
	canvas.h = canvas.height;
	canvas.hw = canvas.w / 2;
	canvas.hh = canvas.h / 2;
	canvas.min = canvas.w < canvas.h ? canvas.w : canvas.h;
	canvas.max = canvas.w > canvas.h ? canvas.w : canvas.h;
	canvas.vmin = canvas.min / 100;
	canvas.vmax = canvas.max / 100
	canvas.vw = canvas.w / 100;
	canvas.vh = canvas.h / 100;
	canvas.xc = canvas.width / 2;
	canvas.yc = canvas.height / 2;
	canvas.center = { x: canvas.xc, y: canvas.yc };
	canvas.font = '10px Arial';
	canvas.orientation = (canvas.w == canvas.max ? 'landscape' : 'potrait')
	Caldro.rendering.context.imageSmoothingEnabled = Caldro.rendering.imageSmoothing;
	Caldro.rendering.context.lineCap = "round"
	Caldro.rendering.context.lineJoin = "round"
};

function adjustCanvasToRatio(w = 1, h = 1) {

}

let renderingInfo = {
	fill: null
}

function saveRenderingContext(context = Caldro.rendering.context) {
	context.save();
}

function restoreRenderingContext(context = Caldro.rendering.context) {
	context.restore();
}

function clear(x = 0, y = 0, w = c.width, h = c.height) {
	Caldro.rendering.context.clearRect(x, y, w, h)
}

function fillColor(color = "skyblue", context = Caldro.rendering.context) {
	if (context.fillStyle != color) {
		context.fillStyle = parseColor(color)
		// renderingInfo.fill = context.fillStyle;
	}
}

function hsl(hue, saturation = 100, lightness = 60) {
	return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function parseColor(color) {
	if (!color) return
	if (typeof color == "string") {
		return color
	} else if (getConstructorName(color) == "colorObject") {
		return colorObjectToString(color)
	}
	return color;
}

function strokeColor(color = "skyblue", context = Caldro.rendering.context) {
	if (context.strokeStyle != color) {
		context.strokeStyle = parseColor(color)
	}
}

function rect(x = 0, y = 0, w = c.width, h = c.height, color = CALDGRAY) {
	fillColor(color)
	Caldro.rendering.context.fillRect(x, y, w, h);
	// rounding down is impractical when things are scaled down lover than 0.5
	// Caldro.rendering.context.fillRect(x, y, Math.round(w), Math.round(h));
}

function strect(x, y, w, h, color, lineWidth) {
	strokeColor(color);
	Caldro.rendering.context.lineWidth = lineWidth
	Caldro.rendering.context.strokeRect(x, y, w, h);
}

function clrect(x, y, w, h) {
	Caldro.rendering.context.rect(x, y, w, h);
	Caldro.rendering.context.clip();
}


function chord(x, y, r, theta, angle, fill) {
	Caldro.rendering.context.beginPath();
	Caldro.rendering.context.arc(x, y, r, -Math.PI / 2 + degToRad(angle - theta / 2), -Math.PI / 2 + degToRad(angle + theta / 2));
	Caldro.rendering.context.closePath();
	fillColor(fill)
	Caldro.rendering.context.fill();
}

function sector(x, y, r, theta, angle, fill, lw) {
	Caldro.rendering.context.beginPath();
	Caldro.rendering.context.moveTo(x, y);
	Caldro.rendering.context.arc(x, y, r, -Math.PI / 2 + degToRad(angle - theta / 2), -Math.PI / 2 + degToRad(angle + theta / 2));
	Caldro.rendering.context.closePath();
	fillColor(fill)
	Caldro.rendering.context.fill();
}

function stAarc(x, y, r, theta, angle, fill, lineWidth = 5) {
	Caldro.rendering.context.beginPath();
	Caldro.rendering.context.arc(x, y, r, -Math.PI / 2 + degToRad(angle - theta / 2), -Math.PI / 2 + degToRad(angle + theta / 2));
	Caldro.rendering.context.closePath();
	strokeColor(fill)
	cc.lineWidth = lineWidth
	Caldro.rendering.context.fill();
}

function circle(x, y, r, fill) {
	Caldro.rendering.context.beginPath();
	Caldro.rendering.context.arc(x, y, r, 0, 2 * Math.PI);
	Caldro.rendering.context.closePath();
	fillColor(fill)
	Caldro.rendering.context.fill();
}

function stCircle(x, y, r, fill, lw) {
	Caldro.rendering.context.beginPath();
	Caldro.rendering.context.arc(x, y, r, 0, 2 * Math.PI);
	Caldro.rendering.context.closePath();
	Caldro.rendering.context.lineWidth = lw;
	strokeColor(fill);
	Caldro.rendering.context.stroke();
}

function clCircle(x, y, r) {
	Caldro.rendering.context.beginPath();
	Caldro.rendering.context.arc(x, y, r, 0, 2 * Math.PI);
	Caldro.rendering.context.closePath();
	Caldro.rendering.context.clip();
}

function line(a, b, c, d, col, lw) {
	Caldro.rendering.context.beginPath();
	Caldro.rendering.context.moveTo(a, b);
	Caldro.rendering.context.lineTo(c, d);
	Caldro.rendering.context.closePath();
	strokeColor(col)
	Caldro.rendering.context.lineWidth = lw
	Caldro.rendering.context.stroke();
}

function drawLine(startX, startY, length = 100, angle = 0, color = "skyblue", lineWidth = 2) {
	Caldro.rendering.context.beginPath();
	Caldro.rendering.context.moveTo(startX, startY);
	let rad = degToRad(angle);
	Caldro.rendering.context.lineTo(startX + (length * Math.sin(rad)), (startY - (length * Math.cos(rad))))
	Caldro.rendering.context.closePath();
	strokeColor(color);
	Caldro.rendering.context.lineWidth = lineWidth
	Caldro.rendering.context.stroke();
}

function font(size = 30, font = 'Arial', thickness = "") {
	let fnt = "" + thickness + "" + size + "px " + font;
	Caldro.rendering.context.font = fnt;
	return fnt;
}

function txt(text, x, y, font = '30px Arial', fill = 'skyblue', angle = 0, alignment = "center", baseLine = "middle") {
	Caldro.rendering.context.font = font
	Caldro.rendering.context.textAlign = alignment
	Caldro.rendering.context.textBaseline = baseLine
	fillColor(fill)
	fillText(text, x, y, angle)
}

function sttxt(text, x, y, font = '30px Arial', fill = 'skyblue', lineWidth = 5, angle = 0, alignment = "center", baseLine = "middle") {
	Caldro.rendering.context.font = font
	Caldro.rendering.context.textAlign = alignment
	Caldro.rendering.context.textBaseline = baseLine
	Caldrp.rendering.context.lineWidth = lineWidth
	strokeColor(fill)
	strokeText(text, x, y, angle)
}

function cltxt(text, x, y, font = '30px Arial', fill = 'skyblue', angle = 0, alignment = "center", baseLine = "middle") {
	Caldro.rendering.context.font = font
	Caldro.rendering.context.textAlign = alignment
	Caldro.rendering.context.textBaseline = baseLine
	Caldro.rendering.context.clip();
}

function fillText(text, x, y, angle = 0) {
	Caldro.rendering.context.save()
	Caldro.rendering.context.translate(x, y)
	Caldro.rendering.context.rotate(degToRad(angle))
	if (Caldro.rendering.textOutlineThickness > 0) {
		Caldro.rendering.context.lineWidth = Caldro.rendering.textOutlineThickness
		strokeColor(Caldro.rendering.textOutlineColor)
		Caldro.rendering.context.strokeText(text, 0, 0)
		glow(0)
	}
	Caldro.rendering.context.fillText(text, 0, 0)
	Caldro.rendering.context.restore();
}

function strokeText(text, x, y, angle = 0) {
	Caldro.rendering.context.save()
	Caldro.rendering.context.translate(x, y)
	Caldro.rendering.context.rotate(degToRad(angle))
	if (Caldro.rendering.textOutlineThickness > 0) {
		Caldro.rendering.context.lineWidth = Caldro.rendering.textOutlineThickness
		strokeColor(Caldro.rendering.textOutlineColor)
		Caldro.rendering.context.strokeText(text, 0, 0)
		glow(0)
	}
	Caldro.rendering.context.strokeText(text, 0, 0)
	Caldro.rendering.context.restore();
}

function textOutline(thickness = 0, fillStyle = "black") {
	if (thickness >= 0) {
		Caldro.rendering.textOutlineThickness = thickness;
	}
	Caldro.rendering.textOutlineColor = parseColor(fillStyle)
}

function wrapText(text, x, y, maxWidth, lineHeight, color = "green", font = "50px Arial", angle = 0, textAlignment = "center", baseline = "middle") {
	Caldro.rendering.context.save()
	Caldro.rendering.context.textAlign = textAlignment
	Caldro.rendering.context.textBaseline = baseline
	Caldro.rendering.context.font = font;
	Caldro.rendering.context.lineWidth = 5
	Caldro.rendering.context.lineCap = "round";
	Caldro.rendering.context.lineJoin = "round";

	if (lineHeight == null) {
		lineHeight = parseFloat(font) * 1.1
	} else if (typeof lineHeight == "string") {
		if (lineHeight.includes("auto"))
			lineHeight = parseFloat(font) * 1.1
	}

	let spaceSplit = text.split(' ')
	let words = new Array()
	// doTask("hmmmm", 
	// ()=>{console.log(spaceSplit)})

	let lastWordWasSpace = false
	let savedIndex = 0;
	for (let i = 0; i < spaceSplit.length; ++i) {
		let unCutWord = spaceSplit[i]
		let cutWords = unCutWord.split('\n');
		for (let j = 0; j < cutWords.length; ++j) {
			let word = cutWords[j];
			if (word != "") {
				// if (word == ' ') {
				// if (!lastWordWasSpace) {
				// savedIndex = j-1
				// lastWordWasSpace = true
				// }
				// words[savedIndex] += word
				// } else {
				// if(lastWordWasSpace){
				// words.push(cutWords[savedIndex])
				// lastWordWasSpace = false
				// } else {
				words.push(word);
				// }
				// }
				if (j != cutWords.length - 1) {
					words.push(null)
				}


			} else {
				words.push(null)
			}
		}
	}

	// doTask("hmmmm",
	// () => { console.log(words) })

	let line = '';
	let height = lineHeight
	let width = 0

	fillColor(color)
	strokeColor("black")
	for (let n = 0; n < words.length; ++n) {
		if (words[n] == null) {
			fillText(line, x, y, angle);
			width = Math.max(width, Caldro.rendering.context.measureText(line).width)
			y += lineHeight;
			height += lineHeight;
			line = ''
			/* doTask("sjd", function(){
				console.log("I did a line break\nfor: "+words[n]+"")
			}) */
			continue;
		}
		let testLine = line + words[n] + ' ';
		let metrics = Caldro.rendering.context.measureText(testLine);
		let testWidth = metrics.width;
		// width = Math.max(width, testWidth)
		if (testWidth > maxWidth && n > 0) {
			fillText(line, x, y, angle);
			width = Math.max(width, Caldro.rendering.context.measureText(line).width)
			line = words[n] + ' ';
			y += lineHeight;
			height += lineHeight;
		}
		else {
			line = testLine;
		}
	}
	fillText(line, x, y, angle);

	// return {x: x, y: y, width: width, height: height};
	/* alpha(0.4)
	rect(x- width/2, y-height, width, height, "black")
	alpha(1) */
	Caldro.rendering.context.restore();
}

function edges(w, h, blur, color, canvas = c, camera) {
	let cn = getCanvasDimensions(canvas)
	Caldro.rendering.context.save();
	glow(blur, color)
	fillColor(color)
	if (camera) {
		Caldro.rendering.context.translate(camera.x - camera.width / 2, camera.y - camera.height / 2)
	}
	rect(cn.w, 0, w, h)
	rect(-w, 0, w, h)
	rect(cn.w, cn.h - h, w, h)
	rect(-w, cn.h - h, w, h)
	rect(0, -h, w, h)
	rect(cn.w - w, -h, w, h)
	rect(0, cn.h, w, h)
	rect(cn.w - w, cn.h, w, h)
	glow(0)
	Caldro.rendering.context.restore();
}
/* function edge(x, y, color, glowAmount, w, h) {
	glow(glowAmount, parseColor(color))
	rect(x, y, w, h, color)
	glow(0)
}

function edges(w, h, blur, color, canvas = c) {
	let c = getCanvasDimensions(canvas)
	Caldro.rendering.context.save();
	edge(c.w, 0, color, blur, w, h)
	edge(-w, 0, color, blur, w, h)
	edge(c.w, c.h - h, color, blur, w, h)
	edge(-w, c.h - h, color, blur, w, h)
	edge(0, -h, color, blur, w, h)
	edge(c.w - w, -h, color, blur, w, h)
	edge(0, c.h, color, blur, w, h)
	edge(c.w - w, c.h, color, blur, w, h)
	Caldro.rendering.context.restore();
} */

function glow(amount = 10, color = 'white') {
	if (Caldro.renderer.glow) {
		Caldro.rendering.context.shadowBlur = amount;
		Caldro.rendering.context.shadowColor = parseColor(color);
	}
}

function shadow(amount = 10, color = 'white', offsetX = 0, offsetY = 0) {
	if (Caldro.renderer.glow) {
		Caldro.rendering.context.shadowBlur = amount;
		Caldro.rendering.context.shadowColor = parseColor(color);
		Caldro.rendering.context.shadowOffsetX = offsetX;
		Caldro.rendering.context.shadowOffsetY = offsetY;
	}
}

function alpha(value) {
	if (Caldro.renderer.alpha) {
		Caldro.rendering.context.globalAlpha = value;
	}
}

function Rect(x, y, w, h, fill, angle = 0) {
	if (Caldro.rendering.shapeClipping) {
		let cam = Caldro.rendering.shapeClippingCamera;
		if (cam.capturing) {
			if (!collided(cam, { x: x, y: y, width: w, height: h })) return;
		}
	}
	Caldro.rendering.context.save();
	Caldro.rendering.context.translate(x, y);
	Caldro.rendering.context.rotate(degToRad(angle));
	x = -w / 2;
	y = -h / 2;
	rect(x, y, w, h, fill);
	Caldro.rendering.context.restore();
}

function stRect(x, y, w, h, fill, lineWidth = 20, angle = 0) {
	Caldro.rendering.context.save();
	Caldro.rendering.context.translate(x, y);
	Caldro.rendering.context.rotate(degToRad(angle));
	x = -w / 2; y = -h / 2;
	strect(x, y, w, h, fill, lineWidth);
	Caldro.rendering.context.restore();
}

function curvedRect(x, y, width, height, fill, angle = 0, dotBorderRadius = 10) {
	let hw = width / 2;
	let hh = height / 2;
	Caldro.rendering.context.save();
	Caldro.rendering.context.translate(x, y);
	Caldro.rendering.context.rotate(degToRad(angle));
	Caldro.rendering.context.beginPath();

	if (typeof dotBorderRadius == "number") {
		let borderRadius = dotBorderRadius
		Caldro.rendering.context.moveTo(hw / 2 - borderRadius, - hh);
		Caldro.rendering.context.lineTo(hw - borderRadius, - hh);
		Caldro.rendering.context.arc(hw - borderRadius, - hh + borderRadius, borderRadius, Math.PI * 1.5, Math.PI * 2);

		Caldro.rendering.context.lineTo(hw, hh - borderRadius);
		Caldro.rendering.context.arc(hw - borderRadius, hh - borderRadius, borderRadius, 0, Math.PI / 2);

		Caldro.rendering.context.lineTo(- hw + borderRadius, hh);
		Caldro.rendering.context.arc(- hw + borderRadius, hh - borderRadius, borderRadius, Math.PI / 2, Math.PI);

		Caldro.rendering.context.lineTo(- hw, - hh + borderRadius);
		Caldro.rendering.context.arc(- hw + borderRadius, - hh + borderRadius, borderRadius, Math.PI, Math.PI * 1.5);

	} else if (typeof dotBorderRadius == "object") {
		let borderRadius = dotBorderRadius[1]
		Caldro.rendering.context.moveTo(hw / 2 - borderRadius, - hh);
		Caldro.rendering.context.lineTo(hw - borderRadius, - hh);
		Caldro.rendering.context.arc(hw - borderRadius, - hh + borderRadius, borderRadius, Math.PI * 1.5, Math.PI * 2);

		borderRadius = dotBorderRadius[2]
		Caldro.rendering.context.lineTo(hw, hh - borderRadius);
		Caldro.rendering.context.arc(hw - borderRadius, hh - borderRadius, borderRadius, 0, Math.PI / 2);

		borderRadius = dotBorderRadius[3]
		Caldro.rendering.context.lineTo(- hw + borderRadius, hh);
		Caldro.rendering.context.arc(- hw + borderRadius, hh - borderRadius, borderRadius, Math.PI / 2, Math.PI);

		borderRadius = dotBorderRadius[0]
		Caldro.rendering.context.lineTo(- hw, - hh + borderRadius);
		Caldro.rendering.context.arc(- hw + borderRadius, - hh + borderRadius, borderRadius, Math.PI, Math.PI * 1.5);
	}
	Caldro.rendering.context.closePath();
	fillColor(fill)
	Caldro.rendering.context.fill();
	Caldro.rendering.context.restore();
	/*circle(this.x-this.hw,this.y,this.hh,this.color)
	circle(this.x+this.hw,this.y,this.hh,this.color)*/
};

function stCurvedRect(x, y, width, height, fill, angle, dotBorderRadius = 10, lw = 5) {
	let hw = width / 2;
	let hh = height / 2;
	Caldro.rendering.context.save();
	Caldro.rendering.context.translate(x, y);
	Caldro.rendering.context.rotate(degToRad(angle));
	Caldro.rendering.context.beginPath();
	if (typeof dotBorderRadius == "number") {
		let borderRadius = dotBorderRadius
		Caldro.rendering.context.moveTo(hw / 2 - borderRadius, - hh);
		Caldro.rendering.context.lineTo(hw - borderRadius, - hh);
		Caldro.rendering.context.arc(hw - borderRadius, - hh + borderRadius, borderRadius, Math.PI * 1.5, Math.PI * 2);

		Caldro.rendering.context.lineTo(hw, hh - borderRadius);
		Caldro.rendering.context.arc(hw - borderRadius, hh - borderRadius, borderRadius, 0, Math.PI / 2);

		Caldro.rendering.context.lineTo(- hw + borderRadius, hh);
		Caldro.rendering.context.arc(- hw + borderRadius, hh - borderRadius, borderRadius, Math.PI / 2, Math.PI);

		Caldro.rendering.context.lineTo(- hw, - hh + borderRadius);
		Caldro.rendering.context.arc(- hw + borderRadius, - hh + borderRadius, borderRadius, Math.PI, Math.PI * 1.5);

	} else if (typeof dotBorderRadius == "object") {
		let borderRadius = dotBorderRadius[1]
		Caldro.rendering.context.moveTo(hw / 2 - borderRadius, - hh);
		Caldro.rendering.context.lineTo(hw - borderRadius, - hh);
		Caldro.rendering.context.arc(hw - borderRadius, - hh + borderRadius, borderRadius, Math.PI * 1.5, Math.PI * 2);

		borderRadius = dotBorderRadius[2]
		Caldro.rendering.context.lineTo(hw, hh - borderRadius);
		Caldro.rendering.context.arc(hw - borderRadius, hh - borderRadius, borderRadius, 0, Math.PI / 2);

		borderRadius = dotBorderRadius[3]
		Caldro.rendering.context.lineTo(- hw + borderRadius, hh);
		Caldro.rendering.context.arc(- hw + borderRadius, hh - borderRadius, borderRadius, Math.PI / 2, Math.PI);

		borderRadius = dotBorderRadius[0]
		Caldro.rendering.context.lineTo(- hw, - hh + borderRadius);
		Caldro.rendering.context.arc(- hw + borderRadius, - hh + borderRadius, borderRadius, Math.PI, Math.PI * 1.5);
	}
	Caldro.rendering.context.closePath();
	Caldro.rendering.context.lineWidth = lw;
	strokeColor(fill)
	Caldro.rendering.context.stroke();
	Caldro.rendering.context.restore();
};


function triangle(x, y, length, color, angle = 0) {
	let sqrt3 = 1.7321;
	let height = length * (sqrt3 / 2)
	let a = new Point2D(0, -height / 2);
	let b = new Point2D(-length / 2, +height / 2);
	let c = new Point2D(length / 2, +height / 2);
	Caldro.rendering.context.save()
	Caldro.rendering.context.translate(x, y)
	Caldro.rendering.context.rotate(degToRad(angle))
	Caldro.rendering.context.beginPath();
	Caldro.rendering.context.moveTo(a.x, a.y);
	Caldro.rendering.context.lineTo(b.x, b.y);
	Caldro.rendering.context.lineTo(c.x, c.y);
	Caldro.rendering.context.closePath();
	fillColor(color);
	Caldro.rendering.context.fill();
	Caldro.rendering.context.restore()
}

function stTriangle(x, y, length, color, angle = 0, lineWidth = 2) {
	let sqrt3 = 1.7321;
	let height = length * (sqrt3 / 2)
	// length = height
	let a = new Point2D(0, -height / 2);
	let b = new Point2D(-length / 2, +height / 2);
	let c = new Point2D(length / 2, +height / 2);
	Caldro.rendering.context.save()
	Caldro.rendering.context.translate(x, y)
	Caldro.rendering.context.rotate(degToRad(angle))
	Caldro.rendering.context.beginPath();
	Caldro.rendering.context.moveTo(a.x, a.y);
	Caldro.rendering.context.lineTo(b.x, b.y);
	Caldro.rendering.context.lineTo(c.x, c.y);
	Caldro.rendering.context.closePath();
	strokeColor(color)
	Caldro.rendering.context.lineWidth = lineWidth
	Caldro.rendering.context.stroke();
	Caldro.rendering.context.restore()
}

function renderRectBody(body, color) {
	Rect(body.x, body.y, body.width, body.height, color)
}

function stDrawPolypon(verticies, color, lineWidth) {
	let context = Caldro.rendering.context;
	context.beginPath();
	context.moveTo(verticies[0].x, verticies[0].y);
	for (let i = 0; i < verticies.length; ++i) {
		context.lineTo(verticies[i].x, verticies[i].y)
	}
	context.closePath();
	strokeColor(color)
	context.lineWidth = lineWidth;
	context.stroke();
}

function drawPolypon(verticies, color) {
	let context = Caldro.rendering.context;
	context.beginPath();
	context.moveTo(verticies[0].x, verticies[0].y);
	for (let i = 0; i < verticies.length; ++i) {
		context.lineTo(verticies[i].x, verticies[i].y)
	}
	context.closePath();
	fillColor(color)
	context.fill()
}

function stDrawPolypon(verticies, color, lw = 2) {
	let context = Caldro.rendering.context;
	context.beginPath();
	context.moveTo(verticies[0].x, verticies[0].y);
	for (let i = 0; i < verticies.length; ++i) {
		context.lineTo(verticies[i].x, verticies[i].y)
	}
	context.closePath();
	strokeColor(color)
	context.lineWidth = lw
	context.stroke()
}

function clipPolypon(verticies) {
	let context = Caldro.rendering.context;
	context.beginPath();
	context.moveTo(verticies[0].x, verticies[0].y);
	for (let i = 0; i < verticies.length; ++i) {
		context.lineTo(verticies[i].x, verticies[i].y)
	}
	context.closePath();
	context.clip()
}

function drawRegularSidedPolygon(x = 0, y = 0, radius = 1, numberOfVertices = 3, color = "skyblue") {
	let TWO_PI = Math.PI * 2;
	Caldro.rendering.context.beginPath()
	for (let angle = 0; angle < TWO_PI; angle += TWO_PI / numberOfVertices) {
		let px = x + radius * Math.sin(angle);
		let py = y + radius * Math.cos(angle)
		if (angle == 0) {
			Caldro.rendering.context.moveTo(px, py)
		} else {
			Caldro.rendering.context.lineTo(px, py)
		}
	}
	Caldro.rendering.context.closePath()
	fillColor(color);
	Caldro.rendering.context.fill()
}



/// ========== CANVAS AND COLOR =================
function colorToRGB(color) { }
function getColor(x, y, context = Caldro.rendering.context, method2 = false) { }
{
	let canv = document.createElement("canvas");
	canv.width = 1;
	canv.height = 1;
	let cont = canv.getContext("2d", {
		willReadFrequently: true
	});

	colorToRGB = function (color) {
		let col = parseColor(color);
		cont.fillStyle = col;
		cont.fillRect(0, 0, 1, 1);
		return getColor(0, 0, canv);
	}

	getColor = function (x, y, canvas = Caldro.rendering.canvas) {
		cont.drawImage(canvas, x, y, 1, 1, 0, 0, 1, 1);
		let src = cont.getImageData(0, 0, 1, 1)
		return {
			r: src.data[0],
			g: src.data[1],
			b: src.data[2],
			a: src.data[3],
		}
	}
	/* getColor = function(x, y, context = Caldro.rendering.context, method2 = false, canvas = Caldro.rendering.canvas) {
		if (!method2) {
			let src = context.getImageData(x, y, 1, 1)
			return {
				r: src.data[0],
				g: src.data[1],
				b: src.data[2],
				a: src.data[3],
			}
		} else {
			cont.drawImage(canvas, x, y, 1, 1, 0, 0, 1, 1);
			return getColor(0, 0, cont)
		}
	} */
}

function pickRandomColor(r = [0, 255], g = [0, 255], b = [0, 255], a = [0, 1]) {
	let color = 'rgba(' + randomNumber(r[0], r[1], false) + ',' + randomNumber(g[0], g[1], false) + ',' + randomNumber(b[0], b[1], false) + ',1)';
	return color;
}


function grayscale(r, g, b) {
	value = (r + g + b) / 3
	return "rgb(" + value + ',' + value + ',' + value + ')';
}

function colorObjectToString(colorObject) {
	let co = colorObject;
	if (co.r) {
		return 'rgba(' + co.r + ',' + co.g + ',' + co.b + ',' + co.a + ')';
	} else if (typeof co == 'object') {
		return 'rgba(' + co[0] + ',' + co[1] + ',' + co[2] + ',' + co[3] + ')';
	}
}




class colorObject {
	constructor(r = 123, g = 123, b = 123, a = 1) {
		if (arguments.length == 1) {
			let color = colorToRGB(r)
			this.r = color.r
			this.g = color.g
			this.b = color.b
			this.a = color.a
		} else {
			this.r = r;
			this.g = g;
			this.b = b;
			this.a = a;
		}
	}
	addValue(value = 10, editAlpha = false) {
		this.r = limit(this.r + value, 0, 255);
		this.g = limit(this.g + value, 0, 255);
		this.b = limit(this.b + value, 0, 255);
		if (editAlpha) {
			this.a = limit((this.a + value) / 255, 0, 1);
		}
	}
	addCollor(colorObject, editAlpha = false) {
		this.r = limit(this.r + colorObject.r, 0, 255);
		this.g = limit(this.g + colorObject.g, 0, 255);
		this.b = limit(this.b + colorObject.b, 0, 255);
		if (editAlpha) {
			this.a = limit((this.a + colorObject.a) / 255, 0, 1);
		}
	}
	subtractCollor(colorObject, editAlpha = false) {
		this.r = limit(this.r - value, 0, 255);
		this.g = limit(this.g - value, 0, 255);
		this.b = limit(this.b - value, 0, 255);
		if (editAlpha) {
			this.a = limit((this.a + colorObject.a), 0, 1);
		}
	}
	setAll(value = 0, alpha = 1) {
		this.r = limit(value, 0, 255);
		this.b = limit(value, 0, 255);
		this.g = limit(value, 0, 255);
		this.a = limit(alpha, 0, 1);
	}
	sumTotal() {
		return this.r + this.g + this.b;
	}
	getString() {
		return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
	}
}

const colorUtils = {
	addValue(color, value = 10, editAlpha = false) {
		return new colorObject(
			limit(color.r + value, 0, 255),
			limit(color.g + value, 0, 255),
			limit(color.b + value, 0, 255),
			editAlpha ? this.a = limit((this.a + value) / 255, 0, 1) : 1,
		)
	},
	subtractValue(color, value = 10, editAlpha = false) {
		return new colorObject(
			limit(color.r - value, 0, 255),
			limit(color.g - value, 0, 255),
			limit(color.b - value, 0, 255),
			editAlpha ? this.a = limit((this.a - value) / 255, 0, 1) : 1,
		)
	},
	add(color1, color2) {
		return new colorObject(
			limit(color1.r + color2.r, 0, 255),
			limit(color1.g + color2.g, 0, 255),
			limit(color1.b + color2.b, 0, 255),
			(color1.a + color2.a) / 2
		)
	},
	subtract(color1, color2) {
		return new colorObject(
			limit(color1.r - color2.r, 0, 255),
			limit(color1.g - color2.g, 0, 255),
			limit(color1.b - color2.b, 0, 255),
			(color1.a + color2.a) / 2
		)
	},
	multiply(color1, color2, dampener = 0.01) {
		return new colorObject(
			limit((color1.r * color2.r) * dampener, 0, 255),
			limit((color1.g * color2.g) * dampener, 0, 255),
			limit((color1.b * color2.b) * dampener, 0, 255),
			(color1.a + color2.a) / 2
		)
	},
	raise(color1, color2) {
		return new colorObject(
			limit(color1.r ^ color2.r, 0, 255),
			limit(color1.g ^ color2.g, 0, 255),
			limit(color1.b ^ color2.b, 0, 255),
			(color1.a + color2.a) / 2
		)
	},
	divide(color1, color2, multiplier = 50) {
		return new colorObject(
			limit((color1.r / color2.r) * multiplier, 0, 255),
			limit((color1.g / color2.g) * multiplier, 0, 255),
			limit((color1.b / color2.b) * multiplier, 0, 255),
			(color1.a + color2.a) / 2
		)
	},
	interpolate(color1, color2, percentage) {
		return new colorObject(
			interpolate(percentage, color1.r, color2.r),
			interpolate(percentage, color1.g, color2.g),
			interpolate(percentage, color1.b, color2.b),
			(color1.a + color2.a) / 2
		)
	},
	sumTotal(colorObject) {
		return colorObject.r + colorObject.g + colorObject.b;
	}
}


function interpolatePoints(pointsArray, percentage) {
	let i = Math.floor(pointsArray.length * (percentage / 100))
	let point1 = points[i]
	let point2 = points[i + 1]
	if (point2) {
		return {
			x: interpolate(percentage, point1.x, point2.x),
			y: interpolate(percentage, point1.y, point2.y)
		}
	} else {
		return point1
	}
}


// SPECIAL EFFECTS
function pixelatedCanvas(canvas, percentage = 50, anti_aliasing = false, x = 0, y = 0, width = c.w, height = c.h) {
	let pixelator = Caldro.renderer._pixelatorCanvas;
	let drawingCanvas = Caldro.renderer.canvas;
	percentage = (clip(percentage, 0, 100) * 0.01);
	let cwidth = clip(Math.floor(canvas.width * percentage), 1, INFINITY);
	let cheight = clip(Math.floor(canvas.height * percentage), 1, INFINITY);
	pixelator.width = cwidth;
	pixelator.height = cheight;
	pixelator.getContext('2d').imageSmoothingEnabled = anti_aliasing;
	Caldro.renderer.setRenderingCanvas(pixelator)
	drawImage(canvas, 0, 0, cwidth, cheight)
	Caldro.renderer.setRenderingCanvas(drawingCanvas)
	drawImagePortion(pixelator, 0, 0, cwidth, cheight, x, y, width, height)
}



function manipulateImageData(canvas, operation) {
	let context = canvas.getContext("2d");
	let imageData = context.getImageData(0, 0, canvas.width, canvas.height)
	let pixels = imageData.data;
	for (let pix = 0; pix < pixels.length; pix += 4) {
		let i = pix * 0.25
		let y = Math.floor(i / canvas.width);
		let x = i - (canvas.width * y)
		let r = pixels[pix]
		let g = pixels[pix + 1]
		let b = pixels[pix + 2]
		let a = pixels[pix + 3]
		let manipulation = operation(x, y, r, g, b, a)
		pixels[pix] = manipulation[0]
		pixels[pix + 1] = manipulation[1]
		pixels[pix + 2] = manipulation[2]
		pixels[pix + 3] = manipulation[3]
	}
	context.putImageData(imageData, 0, 0, 0, 0, c.w, c.h)
}