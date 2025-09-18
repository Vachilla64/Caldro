import { scaleTo } from "../Caldro_Math";

const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")

const offScreenCanvas = document.createElement("canvas");
const offCtx = offScreenCanvas.getContext("2d");

/// size of the debug canvas
let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight*0.2;
let bgColor = "black"

let resolution = 2

let DEBUG_KEY = ""
const MAX_FRAMETIME = fpsToDecimal(20)
const MIN_FRAMETIME = 0
const FPS_30 = fpsToDecimal(30) // around 0.033 ms
const FPS_60 = fpsToDecimal(60) // around 0.016 ms

let MAX_MEMORY = 2

export function log(message) {
    console.log(message)
}

export const DEBUGGER = {
    active: true,
    visible: true,
    time: {
        updateTime: 0,
        renderTime: 0,
        browserDelay: 0,
        _lastUpdateTime: 0,
    },
    memory: {

    },
    setVisibility(visibility) {
        DEBUGGER.visible = visibility
        canvas.style.display = DEBUGGER.visible ? "block" : "none"
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
    getFPS() {
        return 1 / this.time.updateTime + this.time.renderTime
    },
    getMemoryUsage() {
        if (performance.memory) {
            const usedHeapSize = performance.memory.usedJSHeapSize;
            const heapSizeLimit = performance.memory.jsHeapSizeLimit;
            const memoryUsagePercentage = (usedHeapSize / heapSizeLimit) * 100;
            return parseFloat(memoryUsagePercentage.toFixed(2))
        } else {
            console.log("The performance.memory API is not supported in this browser.");
        }
    }
}
window.debug = DEBUGGER



function UPDATE() {

}

export function trackObject(obj) {
    const creationTime = {
        date: new Date(),
        highPrecision: performance.now(),
    };

    console.log(`[CREATE] Object created at ${creationTime.date.toISOString()} (${creationTime.highPrecision.toFixed(3)}ms since page load)`);

    return new Proxy(obj, {
        get(target, prop, receiver) {
            const accessTime = {
                date: new Date(),
                highPrecision: performance.now(),
            };
            const stackTrace = new Error().stack.split("\n").slice(2).join("\n");

            console.log(`[GET] Property "${String(prop)}" accessed at ${accessTime.date.toISOString()} (${accessTime.highPrecision.toFixed(3)}ms)\nCall Stack:\n${stackTrace}`);
            return Reflect.get(target, prop, receiver);
        },
        set(target, prop, value, receiver) {
            const modificationTime = {
                date: new Date(),
                highPrecision: performance.now(),
            };
            const stackTrace = new Error().stack.split("\n").slice(2).join("\n");

            console.log(`[SET] Property "${String(prop)}" set to "${value}" at ${modificationTime.date.toISOString()} (${modificationTime.highPrecision.toFixed(3)}ms)\nCall Stack:\n${stackTrace}`);
            return Reflect.set(target, prop, value, receiver);
        },
        deleteProperty(target, prop) {
            const deletionTime = {
                date: new Date(),
                highPrecision: performance.now(),
            };
            const stackTrace = new Error().stack.split("\n").slice(2).join("\n");

            console.log(`[DELETE] Property "${String(prop)}" deleted at ${deletionTime.date.toISOString()} (${deletionTime.highPrecision.toFixed(3)}ms)\nCall Stack:\n${stackTrace}`);
            return Reflect.deleteProperty(target, prop);
        },
    });
}


function RENDER() {
    ctx.fillStyle = bgColor;

    /// draw a background
    ctx.fillStyle = bgColor;
    ctx.fillRect(canvas.width - resolution, 0, resolution, HEIGHT)

    renderMSDelayTimeline();
    renderMemoryTimeline();

    /// move the drawwing currently on the canvas to one resolution worht of pixeld to the left
    smearCanvas()

    /// draw various FPS markers
    ctx.fillStyle = "white"
    ctx.fillRect(0, getYCoordsFromTimeStamp(FPS_60), WIDTH, 1)
    ctx.fillStyle = "white"
    ctx.fillRect(0, getYCoordsFromTimeStamp(FPS_30), WIDTH, 1)
}



function renderMSDelayTimeline() {
    let updateTimeHeight = getHeightFromTimeStamp(DEBUGGER.time.updateTime)
    let renderTimeHeight = getHeightFromTimeStamp(DEBUGGER.time.renderTime)
    let browserDelayHeight = getHeightFromTimeStamp(DEBUGGER.time.browserDelay)


    /// draw time information
    ctx.fillStyle = "lime"
    if (DEBUGGER.updateTime > FPS_60)
        ctx.fillStyle = "orange"
    if (DEBUGGER.updateTime > FPS_30)
        ctx.fillStyle = "red"
    ctx.fillRect(canvas.width - resolution, HEIGHT - updateTimeHeight, resolution, updateTimeHeight)
    ctx.fillStyle = "skyblue"
    ctx.fillRect(canvas.width - resolution, HEIGHT - updateTimeHeight - renderTimeHeight, resolution, renderTimeHeight)
    ctx.fillStyle = "orange"
    ctx.fillRect(canvas.width - resolution, HEIGHT - browserDelayHeight - updateTimeHeight - renderTimeHeight, resolution, browserDelayHeight)
}
function renderMemoryTimeline() {
    let memoryUsage = DEBUGGER.getMemoryUsage();
    if (memoryUsage) {
        /// draw memory
        ctx.fillStyle = "red"
        if (memoryUsage > MAX_MEMORY) {
            ctx.fillStyle = "white"
            ctx.globalAlpha = 0.5
            ctx.fillRect(canvas.width - resolution, 0, resolution, HEIGHT)
            ctx.globalAlpha = 1
            MAX_MEMORY = memoryUsage
        } else {
            ctx.fillRect(canvas.width - resolution, getYCoordsFromTimeStamp(scaleTo(memoryUsage, 0, MAX_MEMORY, MIN_FRAMETIME, MAX_FRAMETIME)), resolution, resolution)
        }
    }
}

function smearCanvas() {
    // offCtx.fillStyle = "white"
    // offCtx.fillRect(0, 0, 100, 100)
    offCtx.drawImage(canvas, 0, 0);
    ctx.drawImage(offScreenCanvas, -resolution, 0)
}

canvas.style.display = "block"
window.addEventListener("keydown", (event) => {
    if ((event.key == DEBUG_KEY)) {
        DEBUGGER.setVisibility(!DEBUGGER.visible)
    }
})
window.dc = canvas


export function SETUP_DEBUG(debugToggleKey = "d", parentElement = document.body) {
    DEBUG_KEY = debugToggleKey
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
function getYCoordsFromTimeStamp(timeInMS) {
    return HEIGHT - scaleTo(timeInMS, MIN_FRAMETIME, MAX_FRAMETIME, 0, HEIGHT);
}
function getHeightFromTimeStamp(timeInMS) {
    return scaleTo(timeInMS, MIN_FRAMETIME, MAX_FRAMETIME, 0, HEIGHT);
}

function fpsToDecimal(fps = 60) {
    return (1 / fps)
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
