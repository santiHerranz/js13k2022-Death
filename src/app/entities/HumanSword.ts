import BodyPart from "./BodyPart";
import V2 from "../core/V2";
import Human from "./Human";

class HumanSword extends BodyPart {

  public _length: number = 0
  public _usedTimes: number = 0
  public _maxUseTimes: number = 20

  public _damage: number = 100

  constructor(p, size) {
    super(p, size)
    this._length = size.y

  }

  _used(human: Human) {
    this._usedTimes += 1
    this._length = this._size.y - this._size.y / 2 * (this._usedTimes / this._maxUseTimes)
    if (this._usedTimes >= this._maxUseTimes) {
      setTimeout(() => {
        human._hasSword = false
        this._length = this._size.y // restore original size
        this._usedTimes = 0
        }, 200);
    }
  }

  _update(dt: any): void {
    // Block super call
    // super._update(dt) 
  }

  _draw(ctx, offsets = { _position: new V2(), r: 0 }) {
    super._draw(ctx);

    ctx.s();
    ctx.lw(1);
    ctx.globalAlpha = this._opacity;
    ctx.tr(
      this._position.x + offsets._position.x,
      this._position.y +
      offsets._position.y -
      this._verticalOffset
    );
    this._shouldRenderShadow && this._renderShadow(ctx);
    ctx.rot(offsets.r + this._rotation);
    // blade blue
    ctx.lw(2);
    ctx.fs("#ccf");
    ctx.fr(0, 5, this._size.x / 2, this._length);
    ctx.fs("#ddf");
    ctx.fr(this._size.x / 2, 5, this._size.x / 2, this._length);
    // hilt
    ctx.fs("#963");
    ctx.fr(0, 5, this._size.x, 5);
    // handle
    ctx.fs("#333");
    ctx.fr(this._size.x / 4, 0, this._size.x / 2, 5);
    
    ctx.r();

  }
}

export default HumanSword;
