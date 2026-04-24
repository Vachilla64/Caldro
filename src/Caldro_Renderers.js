// Renderers
import { clip, ceilToNearestMutliple, scaleTo, floorToNearestMutliple } from "./Caldro_Math.js";
import { Rect, txt, font, alpha, rect, line, circle } from "./Caldro_Rendering.js";
import { dist2D, doTask, place, snapCoordinatesToGrid } from "./Caldro_Utility_Functions.js";
import { vec2D } from "./Caldro_Vectors_and_Matrices.js";
import { log } from "./debug/Caldro_Debug.js";
import { limit } from "./Caldro_Utility_Functions.js";
import { stRect } from "./Caldro_Rendering.js";

export function cordShow(who, fill = 'green', w = 300, h = 2, showCordValue = false, camera = null) {
  if (who != undefined) {
    let x = who.x;
    let y = who.y;
    if(camera){
      w *= (1/camera.zoom.x)
      h *= (1/camera.zoom.y)
    }
    Rect(x, y, w, h, fill)
    Rect(x, y, h, w, fill)
    if (showCordValue) {
      txt('x : ' + x + ', y : ' + y, x + w * 0.15, y - w * 0.15, font(20))
    }
  }
}

export function meter(x, y, width, height, value = 50, lowest_limit = 0, highest_limit = 100, colors = ['#22ff12', 'orange', 'red'], backgroundColor = "transparent", steps = 100) {
  // steps = width / steps
  value = limit(value, lowest_limit, highest_limit);
  let percent = (value / (highest_limit-lowest_limit)) 
  let valueLenght = width * percent
  // let valueLenght = limit(steps * percent, 0, width)
  if (backgroundColor != "transparent") {
    rect(x - width / 2, y - height / 2, width, height, backgroundColor)
  }
  rect(x - width / 2, y - height / 2, valueLenght, height, colors)
  stRect(x, y, width, height, backgroundColor, 1)
}

export function checkBoard(x, y, width, height, rows = 8, columns = 8, color1 = "white", color2 = "black") {
  let rowHeight = height / rows;
  let columnWidth = width / columns;
  let drawX = x;
  let drawY = y;
  let colorIndex = 0
  for (let r = 0; r < rows; ++r) {
    for (let c = 0; c < columns; ++c) {
      let color = colorIndex == 0 ? color1 : color2;
      rect(drawX, drawY, columnWidth, rowHeight, color);
      drawX += columnWidth;
      colorIndex = (colorIndex + 1) % 2
    }
    colorIndex = (colorIndex + 1) % 2
    drawX = x;
    drawY += rowHeight;
  }
}

/// TODO: => add gimber like drawing or indicator
///       => add option for showwwing pointer cords and for keeping cord text visibkle even if the origin and intercet of the both axis are out of frame of the camera
export function drawCoordinateGraph(camera, gridSize = 10, color = "white", subdivisions = 5, dynamic = false, showCoordinates = true, showCCameraPointerCoordinates = true, snapMouse = true) {
  const { x, y, width, height } = camera;
  const ctx = camera.context
  const zoom =  camera.zoom.x

  let subdivisionCounter = 0

  if (dynamic) {
    gridSize = width / (gridSize)
    gridSize = ceilToNearestMutliple(gridSize, 10)
    gridSize = clip(gridSize, 1, Infinity)
  }

  const gridSizeMain = gridSize
  // gridSize /= subdivisions


  // Calculate visible area
  const left = x - (width * 0.5)
  const right = x + (width * 0.5)
  const top = y - (height * 0.5)
  const bottom = y + (height * 0.5)

  // Calculate grid lines
  const startX = Math.floor(left / gridSize) * gridSize;
  const startY = Math.floor(top / gridSize) * gridSize;
  const endX = Math.ceil(right / gridSize) * gridSize;
  const endY = Math.ceil(bottom / gridSize) * gridSize;

  /// start of drawings
  ctx.save();


  circle(0, 0, 2 * (1 / zoom), color)
  /// draw main axis cross
  const mainAxisThickness = 4 / zoom

  const thickLineWidth = 1 / zoom
  const thinLineWidth = 0.3 / zoom

  ctx.strokeStyle = color;

  subdivisionCounter = 0
  // Draw vertical lines
  for (let x = startX; x <= endX; x += gridSize) {
    ctx.lineWidth = thinLineWidth
    if ((x % subdivisions == 0))
      ctx.lineWidth = thickLineWidth;

    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
  }

  subdivisionCounter = 0
  // Draw horizontal lines
  for (let y = startY; y <= endY; y += gridSize) {
    ctx.lineWidth = thinLineWidth
    if ((y % subdivisions == 0))
      ctx.lineWidth = thickLineWidth;

    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }

  let mouse = camera.getPointer()
  if (mouse) {
    if(snapMouse)
    mouse = snapCoordinatesToGrid(mouse.x, mouse.y, gridSize)
  }

  const textOffset = 20 / zoom
  // Draw coordinates
  ctx.fillStyle = color
  ctx.font = `${16 / zoom}px Arial`;
  subdivisionCounter = 0
  for (let x = startX; x <= endX; x += gridSize) {
    for (let y = startY; y <= endY; y += gridSize) {

      if (mouse && showCCameraPointerCoordinates) {
        // let distanceFromPointer = dist2D(new vec2D(x, y), camera.getPointer())
        // if (distanceFromPointer < gridSize) {
        if (x == mouse.x && y == mouse.y) {
          ctx.save()
          // alpha(scaleTo(distanceFromPointer, 0, gridSize, 1, 0))
          ctx.font = `${22 / zoom}px Arial`;
          circle(x, y, thickLineWidth*4, color)
          txt(`(${x}    ${y})`, x, y, null, color, camera.angle, "center")
          ctx.restore()
          continue
        }
      }

      if(showCoordinates){
        if (x == 0) {
          if ((y % subdivisions == 0))
            txt(`${y}`, x - textOffset, y, null, color, camera.angle)
        }
        if (y == 0) {
          if ((x % subdivisions == 0))
            txt(`${x}`, x, y + textOffset, null, color, camera.angle)
        }
      }
    }
  }

  ctx.restore();
  return gridSize;
}


export function drawGraph0(x = 0, y = 0, width = 1000, height = 1000, minorStep = 10, majorStepCount = 10, color = "white", camera = null, size = null) {
  let sizer = size || minorStep * 0.1
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
