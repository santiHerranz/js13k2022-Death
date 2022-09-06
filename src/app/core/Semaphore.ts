import { time } from "../timer";

class Semaphore {

    public _timers = []

    _ready(index: string) {
        return this._timers.filter(t => { return t.n == index }).length == 0
    }
    _lock(index: string, t: number = .3) {
        this._timers.push({ n: index, t: time + t })
    }
    _update(dt) {
        this._timers = this._timers.filter(t => { return time < t.t })
    }


}
export default Semaphore