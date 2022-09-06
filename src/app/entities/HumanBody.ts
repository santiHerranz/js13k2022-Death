import BodyPart from "./BodyPart";
import V2 from "../core/V2";
import Human from "./Human";
import { PI } from "../core/utils";
import { CharacterType } from "../core/GameEvent";

class HumanBody extends BodyPart {

  public _human: Human;

  public _sizeBody: V2 = new V2(12, 18);
  public _sizeArm: V2 = new V2(4, 12);
  public _sizeLeg: V2 = new V2(5, 4);
  public _sizeSword: V2 = new V2(10, 40);

  public _color: string;

  constructor(p, size, human) {
    super(p, size);
    this._human = human
    this._sizeBody = size
  }

  _update(dt: any): void {

    super._update(dt)
  }

  _draw(ctx: CanvasRenderingContext2D, offsets = { _position: new V2(), r: 0 }) {
    super._draw(ctx);

    var anim = this._human._currentAnim._current;

    ctx.s(); // humanbody save
    ctx.lw(1);
    ctx.globalAlpha = this._opacity;

    ctx.tr(
      this._position.x,
      this._position.y - this._z
    );

    this._shouldRenderShadow && this._renderShadow(ctx);
    ctx.rot(offsets.r + this._rotation);

    // feet color
    ctx.fs(this._human._skinColor);

    if (anim.lL && anim.lR) {

      // left leg
      ctx.s();
      ctx.tr(-this._sizeLeg.x / 2 - this._sizeBody.x / 3, -2);
      ctx.rot(anim.lL.r);
      ctx.fr(0, this._sizeLeg.y, this._sizeLeg.x, this._sizeLeg.y / 3);
      ctx.r();

      // right leg
      ctx.s();
      ctx.tr(-this._sizeLeg.x / 2 + this._sizeBody.x / 3, -2);
      ctx.rot(anim.lR.r);
      ctx.fr(0, this._sizeLeg.y, this._sizeLeg.x, this._sizeLeg.y / 3);
      ctx.r();
    }

    // body
    ctx.s(); // body save
    ctx.rot(anim.b.r);

    ctx.fs(this._human._outfitColor);
    ctx.fr(
      -this._sizeBody.x / 2 + anim.b._position.x,
      -this._sizeBody.y + anim.b._position.y,
      this._sizeBody.x,
      this._sizeBody.y 
    );

    // body pivot point
    // ctx.ss("#fff")
    // ctx.bp()
    // ctx.arc(0,0,1,0,PI*2)
    // ctx.stroke()    

    // arms color
    ctx.fs(this._human._skinColor);
    // arm
    if (this._human._type == CharacterType.zombie) { // 
      ctx.s();
      ctx.tr(0, -this._sizeBody.y + this._sizeBody.y/4 );

      ctx.rot(-PI/2);

      ctx.fr(-this._sizeArm.x/2, 0, this._sizeArm.x, this._sizeArm.y*1.2);
      ctx.r();
    } else 
    if (!this._human._hasSword) {
      ctx.s();
      ctx.tr(0, -this._sizeBody.y + this._sizeBody.y/4 );

      // arm pivot point
      // ctx.ss("#fff")
      // ctx.bp()
      // ctx.arc(0,0,1,0,PI*2)
      // ctx.stroke()    

      ctx.rot(anim.b.r*-20);

      ctx.fr(-this._sizeArm.x/2, 0, this._sizeArm.x, this._sizeArm.y);
      ctx.r();
    }

    ctx.r(); // body restore


    ctx.r(); // humanbody restore


  }



}

export default HumanBody;
