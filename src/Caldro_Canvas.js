import { createMainCanvas } from "./Caldro_DOM_manipulation.js";

let canvas = initCanvas()
function initCanvas() {
    return createMainCanvas(true, "Caldro_Canvas");
}

export const c = canvas

export function getCanvas() {
    return canvas;
}