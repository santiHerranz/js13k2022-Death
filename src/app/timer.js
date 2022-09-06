export var time = 0;

const FPS = 60;
var frame = 0;
export var deltaTime  = 0

export function timeStep(dt) {
    deltaTime = dt
    frame += 1
    time = frame / FPS;
}

const ASSERT = () => {}

const clamp = (v, max = 1, min = 0) => (ASSERT(max > min), v < min ? min : v > max ? max : v);
const percent = (v, max = 1, min = 0) => max - min ? clamp((v - min) / (max - min)) : 0;


class Timer {
    constructor(timeLeft) {
        this.time = timeLeft == undefined ? undefined : time + timeLeft;
        this.setTime = timeLeft;
    }

    set(timeLeft = 0) {
        this.time = time + timeLeft;
        this.setTime = timeLeft;
    }
    unset() {
        this.time = undefined;
    }
    isSet() {
        return this.time != undefined;
    }
    active() {
        return time <= this.time;
    } // is set and has no time left
    elapsed() {
        return time > this.time;
    } // is set and has time left
    get() {
        return this.isSet() ? time - this.time : 0;
    }
    p100() {
        return this.isSet() ? percent(this.time - time, 0, this.setTime) : 0;
    }
}

export { Timer }
