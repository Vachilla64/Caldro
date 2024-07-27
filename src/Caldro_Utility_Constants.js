// Utility_Constants
import { Point2D } from "./Caldro_Physics.js";

export const CALDGRAY = "rgba(20, 20, 20, 1)"
export const CALDGREY = CALDGRAY;
export const CALDRED = "rgba(80, 10, 20, 1)"
export const CALDBLUE = "rgba(20, 20, 40, 1)"
export const CALDGREEN = "rgba(20, 60, 20, 1)"

export const ORIGIN = new Point2D(0, 0);
export const INFINITY = Infinity;
export const LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split('')
export const NUMBERS = "0123456789".split('')

export const NULLFUNCTION = function(){};

export const ANIMATION = {

    REPEAT_TYPES: {
        PING_PONG_ONCE: 1,
        PING_PONG: 2,
        RESTART: 3,
    },
    INTERPOLATIONS: {
        LINEAR: 1,
        EASE_IN: 2,
        EASE_OUT: 3,
        EASE_IN_AND_OUT: 4,
    }

}


export const CURSOR_TYPES = {
    NONE: "none", /// no pointer will be renderd by the browser
    DEFAULT: "default", /// default cursor, usually an arrow
    POINTER: "pointer", /// A pointing hand
    TEXT: "text", /// A text cursor (I beam)
    MOVE: "move", /// Indicates something can be moved
    WAIT: "wait", /// An loading icon, usually an hourglass or ring
    HELP: "help", /// A help cursor, usually a question mark or balloon
    CROSSHAIR: "crosshair", /// A crosshair (+)
    NOT_ALLOWED: "not-allowed", /// Usually a circle stroked across. Indicateds that the desired action is not allowed
    ZOOM_IN: "zooom-in", /// Indicates zooming in
    ZOOM_OUT: "zooom-out", /// Indicates zooming out
    GRAB: "grab", /// Indicates something can be grabbed (clicked and dragged)
    GRABBING: "grabbing", /// Indicates you are dragging something
    COL_RESIZE: "col-resize", /// Indicates horizontal resizing is possible
    ROW_RESIZE: "row-resize", /// Indicates vertical resizing is possible
    TOP_RESIZE: "n-resize", /// Indicates upward resizing is possible
    BOTTOM_RESIZE: "s-resize", /// Indicates downward resizing is possible
    RIGHT_RESIZE: "e-resize", /// Indicates right-ward resizing is possible
    LEFT_RESIZE: "w-resize", /// Indicates left-ward resizing is possible
    TOP_LEFT_RESIZE: "nw-resize", /// Indicates top-left-ward resizing is possible
    TOP_RIGHT_RESIZE: "ne-resize", /// Indicates top-right-ward resizing is possible
    BOTTOM_LEFT_RESIZE: "sw-resize", /// Indicates bottom-left-ward resizing is possible
    BOTTOM_RIGHT_RESIZE: "se-resize", /// Indicates bottom-right-ward resizing is possible
    ALIAS: "alias", /// Indicates an alias or shortcut is to be created
    COPY: "copy", /// Indicates that something can be copied
    NO_DROP: "no-drop", /// Indicates that the drop action cannot be performed
    CONTEXT_MENU: "context-menu", //// Indicates that a context menu is avalible
}