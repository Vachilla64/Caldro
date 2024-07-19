// Utility_Constants
import { Point2D } from "./Caldro_Physics";

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