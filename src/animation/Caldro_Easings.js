
// Cite: https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
// currentTime: elapsed time inside duration (currentTime-startTime),
// start: beginning value,
// totalChange: total change from beginning value (endingValue-startingValue),
// duration: total duration
const Easings = {
    easeInQuad: function (currentTime, start, end, duration) {
        let totalChange = end - start
        return totalChange * (currentTime /= duration) * currentTime + start;
    },
    easeOutQuad: function (currentTime, start, end, duration) {
        let totalChange = end - start
        return -totalChange * (currentTime /= duration) * (currentTime - 2) + start;
    },
    easeInOutQuad: function (currentTime, start, end, duration) {
        let totalChange = end - start
        if ((currentTime /= duration / 2) < 1) return totalChange / 2 * currentTime * currentTime + start;
        return -totalChange / 2 * ((--currentTime) * (currentTime - 2) - 1) + start;
    },
    easeInCubic: function (currentTime, start, end, duration) {
        let totalChange = end - start
        return totalChange * (currentTime /= duration) * currentTime * currentTime + start;
    },
    easeOutCubic: function (currentTime, start, end, duration) {
        let totalChange = end - start
        return totalChange * ((currentTime = currentTime / duration - 1) * currentTime * currentTime + 1) + start;
    },
    easeInOutCubic: function (currentTime, start, end, duration) {
        let totalChange = end - start
        if ((currentTime /= duration / 2) < 1) return totalChange / 2 * currentTime * currentTime * currentTime + start;
        return totalChange / 2 * ((currentTime -= 2) * currentTime * currentTime + 2) + start;
    },
    easeInQuart: function (currentTime, start, end, duration) {
        let totalChange = end - start
        return totalChange * (currentTime /= duration) * currentTime * currentTime * currentTime + start;
    },
    easeOutQuart: function (currentTime, start, end, duration) {
        let totalChange = end - start
        return -totalChange * ((currentTime = currentTime / duration - 1) * currentTime * currentTime * currentTime - 1) + start;
    },
    easeInOutQuart: function (currentTime, start, end, duration) {
        let totalChange = end - start
        if ((currentTime /= duration / 2) < 1) return totalChange / 2 * currentTime * currentTime * currentTime * currentTime + start;
        return -totalChange / 2 * ((currentTime -= 2) * currentTime * currentTime * currentTime - 2) + start;
    },
    easeInQuint: function (currentTime, start, end, duration) {
        let totalChange = end - start
        return totalChange * (currentTime /= duration) * currentTime * currentTime * currentTime * currentTime + start;
    },
    easeOutQuint: function (currentTime, start, end, duration) {
        let totalChange = end - start
        return totalChange * ((currentTime = currentTime / duration - 1) * currentTime * currentTime * currentTime * currentTime + 1) + start;
    },
    easeInOutQuint: function (currentTime, start, end, duration) {
        let totalChange = end - start
        if ((currentTime /= duration / 2) < 1) return totalChange / 2 * currentTime * currentTime * currentTime * currentTime * currentTime + start;
        return totalChange / 2 * ((currentTime -= 2) * currentTime * currentTime * currentTime * currentTime + 2) + start;
    },
    easeInSine: function (currentTime, start, end, duration) {
        let totalChange = end - start
        return -totalChange * Math.cos(currentTime / duration * (Math.PI / 2)) + totalChange + start;
    },
    easeOutSine: function (currentTime, start, end, duration) {
        let totalChange = end - start
        return totalChange * Math.sin(currentTime / duration * (Math.PI / 2)) + start;
    },
    easeInOutSine: function (currentTime, start, end, duration) {
        let totalChange = end - start
        return -totalChange / 2 * (Math.cos(Math.PI * currentTime / duration) - 1) + start;
    },
    easeInExpo: function (currentTime, start, end, duration) {
        let totalChange = end - start
        return (currentTime == 0) ? start : totalChange * Math.pow(2, 10 * (currentTime / duration - 1)) + start;
    },
    easeOutExpo: function (currentTime, start, end, duration) {
        let totalChange = end - start
        return (currentTime == duration) ? start + totalChange : totalChange * (-Math.pow(2, -10 * currentTime / duration) + 1) + start;
    },
    easeInOutExpo: function (currentTime, start, end, duration) {
        let totalChange = end - start
        if (currentTime == 0) return start;
        if (currentTime == duration) return start + totalChange;
        if ((currentTime /= duration / 2) < 1) return totalChange / 2 * Math.pow(2, 10 * (currentTime - 1)) + start;
        return totalChange / 2 * (-Math.pow(2, -10 * --currentTime) + 2) + start;
    },
    easeInCirc: function (currentTime, start, end, duration) {
        let totalChange = end - start
        return -totalChange * (Math.sqrt(1 - (currentTime /= duration) * currentTime) - 1) + start;
    },
    easeOutCirc: function (currentTime, start, end, duration) {
        let totalChange = end - start
        return totalChange * Math.sqrt(1 - (currentTime = currentTime / duration - 1) * currentTime) + start;
    },
    easeInOutCirc: function (currentTime, start, end, duration) {
        let totalChange = end - start
        if ((currentTime /= duration / 2) < 1) return -totalChange / 2 * (Math.sqrt(1 - currentTime * currentTime) - 1) + start;
        return totalChange / 2 * (Math.sqrt(1 - (currentTime -= 2) * currentTime) + 1) + start;
    },
    easeInElastic: function (currentTime, start, end, duration) {
        let totalChange = end - start
        var s = 1.70158; var p = 0; var a = totalChange;
        if (currentTime == 0) return start; if ((currentTime /= duration) == 1) return start + totalChange; if (!p) p = duration * .3;
        if (a < Math.abs(totalChange)) { a = totalChange; var s = p / 4; }
        else var s = p / (2 * Math.PI) * Math.asin(totalChange / a);
        return -(a * Math.pow(2, 10 * (currentTime -= 1)) * Math.sin((currentTime * duration - s) * (2 * Math.PI) / p)) + start;
    },
    easeOutElastic: function (currentTime, start, end, duration) {
        let totalChange = end - start
        var s = 1.70158; var p = 0; var a = totalChange;
        if (currentTime == 0) return start; if ((currentTime /= duration) == 1) return start + totalChange; if (!p) p = duration * .3;
        if (a < Math.abs(totalChange)) { a = totalChange; var s = p / 4; }
        else var s = p / (2 * Math.PI) * Math.asin(totalChange / a);
        return a * Math.pow(2, -10 * currentTime) * Math.sin((currentTime * duration - s) * (2 * Math.PI) / p) + totalChange + start;
    },
    easeInOutElastic: function (currentTime, start, end, duration) {
        let totalChange = end - start
        var s = 1.70158; var p = 0; var a = totalChange;
        if (currentTime == 0) return start; if ((currentTime /= duration / 2) == 2) return start + totalChange; if (!p) p = duration * (.3 * 1.5);
        if (a < Math.abs(totalChange)) { a = totalChange; var s = p / 4; }
        else var s = p / (2 * Math.PI) * Math.asin(totalChange / a);
        if (currentTime < 1) return -.5 * (a * Math.pow(2, 10 * (currentTime -= 1)) * Math.sin((currentTime * duration - s) * (2 * Math.PI) / p)) + start;
        return a * Math.pow(2, -10 * (currentTime -= 1)) * Math.sin((currentTime * duration - s) * (2 * Math.PI) / p) * .5 + totalChange + start;
    },
    easeInBack: function (currentTime, start, end, duration, s) {
        let totalChange = end - start
        if (s == undefined) s = 1.70158;
        return totalChange * (currentTime /= duration) * currentTime * ((s + 1) * currentTime - s) + start;
    },
    easeOutBack: function (currentTime, start, end, duration, s) {
        let totalChange = end - start
        if (s == undefined) s = 1.70158;
        return totalChange * ((currentTime = currentTime / duration - 1) * currentTime * ((s + 1) * currentTime + s) + 1) + start;
    },
    easeInOutBack: function (currentTime, start, end, duration, s) {
        let totalChange = end - start
        if (s == undefined) s = 1.70158;
        if ((currentTime /= duration / 2) < 1) return totalChange / 2 * (currentTime * currentTime * (((s *= (1.525)) + 1) * currentTime - s)) + start;
        return totalChange / 2 * ((currentTime -= 2) * currentTime * (((s *= (1.525)) + 1) * currentTime + s) + 2) + start;
    },
    easeInBounce: function (currentTime, start, end, duration) {
        let totalChange = end - start
        return totalChange - Easings.easeOutBounce(duration - currentTime, 0, totalChange, duration) + start;
    },
    easeOutBounce: function (currentTime, start, end, duration) {
        let totalChange = end - start
        if ((currentTime /= duration) < (1 / 2.75)) {
            return totalChange * (7.5625 * currentTime * currentTime) + start;
        } else if (currentTime < (2 / 2.75)) {
            return totalChange * (7.5625 * (currentTime -= (1.5 / 2.75)) * currentTime + .75) + start;
        } else if (currentTime < (2.5 / 2.75)) {
            return totalChange * (7.5625 * (currentTime -= (2.25 / 2.75)) * currentTime + .9375) + start;
        } else {
            return totalChange * (7.5625 * (currentTime -= (2.625 / 2.75)) * currentTime + .984375) + start;
        }
    },
    easeInOutBounce: function (currentTime, start, end, duration) {
        let totalChange = end - start
        if (currentTime < duration / 2) return Easings.easeInBounce(currentTime * 2, 0, totalChange, duration) * .5 + start;
        return Easings.easeOutBounce(currentTime * 2 - duration, 0, totalChange, duration) * .5 + totalChange * .5 + start;
    },
};

export default Easings


