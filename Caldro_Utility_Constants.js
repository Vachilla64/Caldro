"use strict"; // Utility_Constants

const CALDGRAY = "rgba(20, 20, 20, 1)"
const CALDGREY = CALDGRAY;
const CALDRED = "rgba(80, 10, 20, 1)"
const CALDBLUE = "rgba(20, 20, 40, 1)"
const CALDGREEN = "rgba(20, 60, 20, 1)"

const ORIGIN = new Point2D(0, 0);
const INFINITY = Infinity;
const LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split('')
const NUMBERS = "0123456789".split('')

const NULLFUNCTION = function(){};

const ANIMATION = {

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