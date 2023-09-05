"use strict"; // Renderers

function cordShow(who, fill = 'green', w = 300, h = 2, showCordValue = false) {
	if (who != undefined) {
		let x = who.x;
		let y = who.y;
		Rect(x, y, w, h, fill)
		Rect(x, y, h, w, fill)
		if (showCordValue) {
			txt('x : ' + x + ', y : ' + y, x + w*0.15, y - w*0.15, font(20))
		}
	}
}

function meter(x, y, width, height, value = 50, lowest_limit = 0, highest_limit = 100, colors = ['#22ff12', 'orange', 'red'], backgroundColor = "transparent", steps = 100)
{
	let color = colors[0]
	steps = width / steps
	limit(value, lowest_limit, highest_limit);
	let percent = (value / highest_limit) * 100
	let valueLenght = limit(steps * percent, 0, width)
	if(backgroundColor!="transparent"){
		rect(x - width / 2, y - height / 2, width, height, backgroundColor)
	}
	rect(x - width / 2, y - height / 2, valueLenght, height, color)
	stRect(x, y, width, height, 'white', 2)
}

function checkBoard(x, y, width, height, rows = 8, columns = 8, color1 = "white", color2 = "black"){
	let rowHeight = height / rows;
	let columnWidth = width / columns;
	let drawX = x;
	let drawY = y;
	let colorIndex = 0
	for(let r = 0; r < rows; ++r){
		for(let c = 0; c < columns; ++c){
			let color = colorIndex == 0? color1 : color2;
			rect(drawX, drawY, columnWidth, rowHeight, color);
			drawX += columnWidth;
			colorIndex = (colorIndex + 1) % 2
		}
		colorIndex = (colorIndex + 1) % 2
		drawX = x;
		drawY += rowHeight;
	}
}


function drawGraph(x = 0, y = 0, width = 1000, height = 1000, minorStep = 10, majorStepCount = 10, color = "white", camera = null, size = null) {
    let sizer = size || minorStep*0.1
    let startX = x - (width / 2);
    let startY = y - (height / 2);
    let endX = x + (width / 2)
    let endY = y + (height / 2)
    let majLw = 1 * sizer
    let minLw = 0.5 * sizer
    let lineSteps = 4
    let textSteps = lineSteps * 2
    x = Math.floor(x)
    y = Math.floor(y)
    alpha(0.1)
    rect(startX, startY, width, height, color)
    alpha(0.9)
    Rect(0, 0, width, majLw, color)
    Rect(0, 0, majLw, height, color)
    Rect(0, 0, majLw * 2, 50 * sizer, color, 45)
    Rect(0, 0, majLw * 2, 50 * sizer, color, 135)
    alpha(0.7)
    for (let vx = startX; vx <= endX; vx += minorStep) {
        if (lineSteps < 4) {
            Rect(vx, y, minLw, height, color)
            ++lineSteps;
        } else {
            Rect(vx, y, majLw, height, color)
            alpha(0.9)
            txt(vx, vx, y + 40 * sizer / 2, font(30 * sizer / 2), color)
            textSteps = 0
            alpha(0.7)
            lineSteps = 0;
        }
    }
    alpha(0.7)
    lineSteps = 4;
    for (let vy = startY; vy <= endY; vy += minorStep) {
        if (lineSteps < 4) {
            Rect(x, vy, width, minLw, color)
            ++lineSteps;
        } else {
            Rect(x, vy, width, majLw, color)
            alpha(0.9)
            txt(vy, x - 40 * sizer / 2, vy, font(30 * sizer / 2), color)
            alpha(0.7)
            lineSteps = 0;
        }
    }
    alpha(0.1)


    alpha(1)
}