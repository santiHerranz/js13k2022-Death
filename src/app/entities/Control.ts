import V2 from "../core/V2";
import Zombie from "./Zombie";

class Control {

    static goToPosition(unit: Zombie, position = new V2) {
        let rotate = 0;
        let move = 0;
        let distanceToPoint = V2._subtract(position, unit._position);
        const dist = distanceToPoint._magnitude();
        if (dist > 1) {
            rotate = distanceToPoint._heading() - unit._motionHeading;
            move = 1
        }
        return {
            m: move,
            r: rotate,
            d: dist
        };
    }
}

export { Control }