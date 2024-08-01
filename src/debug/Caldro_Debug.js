import { scaleTo } from "../Caldro_Math";

const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")

const offScreenCanvas = document.createElement("canvas");
const offCtx = offScreenCanvas.getContext("2d");

/// size of the debug canvas
let WIDTH = window.innerWidth;
let HEIGHT = 150;
let bgColor = "black"

let resolution = 2

const MAX_FRAMETIME = fpsToDecimal(20)
const MIN_FRAMETIME = 0
const FPS_30 = fpsToDecimal(30) // around 0.033 ms
const FPS_60 = fpsToDecimal(60) // around 0.016 ms

export const DEBUGGER = {
    active: true,
    time: {
        updateTime: 0,
        renderTime: 0,
        browserDelay: 0,
        _lastUpdateTime: 0,
    },
    UPDATE(updateTime, renderTime) {
        let now = performance.now() / 1000;

        /// deltatiem - update time and render time
        this.time.browserDelay = (now - this.time._lastUpdateTime) - (updateTime + renderTime);

        this.time._lastUpdateTime = now;

        this.time.updateTime = updateTime;
        this.time.renderTime = renderTime;

        UPDATE();
        RENDER();
    },
    getFPS(){
        return  1 / this.time.updateTime + this.time.renderTime
    }
}
window.debug = DEBUGGER



function UPDATE() {

}

function RENDER() {
    let updateTimeHeight = getHeightFromTimeStamp(DEBUGGER.time.updateTime)
    let renderTimeHeight = getHeightFromTimeStamp(DEBUGGER.time.renderTime)
    let browserDelayHeight = getHeightFromTimeStamp(DEBUGGER.time.browserDelay)
    ctx.fillStyle = bgColor;

    // ctx.fillRect(0, 0, WIDTH, HEIGHT)
    ctx.fillStyle = bgColor;
    ctx.fillRect(canvas.width-resolution, 0, resolution, HEIGHT)
    
    
    /// draw time information
    ctx.fillStyle = "lime"
    if(DEBUGGER.updateTime > FPS_60)
        ctx.fillStyle = "orange"
    if(DEBUGGER.updateTime > FPS_30)
        ctx.fillStyle = "red"
    ctx.fillRect(canvas.width-resolution, HEIGHT-updateTimeHeight, resolution, updateTimeHeight)
    ctx.fillStyle = "skyblue"
    ctx.fillRect(canvas.width-resolution, HEIGHT-updateTimeHeight-renderTimeHeight, resolution, renderTimeHeight)
    ctx.fillStyle = "orange"
    ctx.fillRect(canvas.width-resolution, HEIGHT-browserDelayHeight-updateTimeHeight-renderTimeHeight, resolution, browserDelayHeight)

    /// move the drawwing currently on the canvas to one resolution worht of pixeld to the left
    smearCanvas()

    /// draw various FPS markers
    ctx.fillStyle = "white"
    ctx.fillRect(0, getYCoordsFromTimeStamp(FPS_60), WIDTH, 1)
    ctx.fillStyle = "white"
    ctx.fillRect(0, getYCoordsFromTimeStamp(FPS_30), WIDTH, 1)
}

function smearCanvas(){
    // offCtx.fillStyle = "white"
    // offCtx.fillRect(0, 0, 100, 100)
    offCtx.drawImage(canvas, 0, 0);
    ctx.drawImage(offScreenCanvas, -resolution, 0)
}



export function SETUP_DEBUG(parentElement = document.body) {
    setupCanvas();
    parentElement.appendChild(canvas)
    initialize();
}

export function showDebugger(bool = true) {
    canvas.style.zIndex = bool ? "100" : "-100"
}










function initialize() {
    resizeCanvas();
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
}

/// convert the update time of a freame to a y coordinate on the canvwa dependent on the height
function getYCoordsFromTimeStamp(timeInMS){
    return HEIGHT - scaleTo(timeInMS, MIN_FRAMETIME, MAX_FRAMETIME, 0, HEIGHT);
}
function getHeightFromTimeStamp(timeInMS){
    return scaleTo(timeInMS, MIN_FRAMETIME, MAX_FRAMETIME, 0, HEIGHT);
}

function fpsToDecimal(fps = 60){
    return (1/fps)
}

function resizeCanvas() {
    canvas.width = WIDTH = window.innerWidth;
}

function setupCanvas() {
    canvas.style.position = "absolute"
    canvas.style.bottom = "0px"
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    offScreenCanvas.style.position = "absolute"
    offScreenCanvas.style.bottom = "0px"
    offScreenCanvas.width = canvas.width;
    offScreenCanvas.height = canvas.height

    ctx.imageSmoothingEnabled = offCtx.imageSmoothingEnabled = false
}