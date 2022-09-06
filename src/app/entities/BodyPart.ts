import GameObject from "../core/GameObject";
import { PI } from "../core/utils";
import V2 from "../core/V2";

class BodyPart extends GameObject {
  public _size: V2;
  public _shouldRenderShadow: boolean = false;

  constructor(p, size) {
    super(p);
    this._size = size;
    this._calcSlide = true;
  }

  _update(dt) {
    // if (this._z === 0) {
    //   this._v._reset();
    //   // this._shouldRenderShadow = false;
    // }

    var timeLeft = this._lifeSpan - this._age;
    if (this._lifeSpan !== -1 && timeLeft < this._lifeSpan * 0.1) {
      this._opacity = timeLeft / (this._lifeSpan * 0.1);
    }

    super._update(dt);
  }

}

export default BodyPart;
