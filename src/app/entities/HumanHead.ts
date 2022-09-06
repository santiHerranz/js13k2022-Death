import BodyPart from "./BodyPart";
import Emitter from "../core/Emitter";
import V2 from "../core/V2";
import { time, Timer } from "../timer";
import { M, PI, rand } from "../core/utils";

class HumanHead extends BodyPart {

  public _skinColor: string;
  public _hairColor: string;
  public _bloodColor: string
  public _blinkTimer: Timer;
  public _breathTimer: Timer;
  public _isDead: boolean = false;

  constructor(p, size, colors?) {
    super(p, size);
    this._size = size

    if (colors != undefined) {
      this._skinColor = colors._skinColor
      this._hairColor = colors._hairColor
      this._bloodColor = colors._bloodColor
    }

    this._blinkTimer = new Timer;
    this._breathTimer = new Timer(1);
  }


  _update(dt: any): void {

    // attenuation of acceleration
    this._a._scale(.9);

    // attenuation of velovity
    this._v._scale(.9);

    // attenuation of rotarion
    this._rv *= .9;


    // randomly blink
    rand() < .005 && this._blinkTimer.set(rand(.2, .1));

    // regular breath
    if (this._breathTimer.elapsed())
      this._breathTimer.set(rand(1.5, 3));

    super._update(dt)
  }


  _bleed() {
    var bleeder = new Emitter();
    Object.assign(bleeder, {
      _position: new V2(0, this._size.y / 2),
      _rotation: -Math.PI / 4,
      _addToScene: true,
      _zgrav: .098,
      _color: this._bloodColor,
      _maxParticles: 400,
      _zv: 0,
      _zvVariance: 2,
      _size: 2,
      _endSize: 4,
      _endSizeVariance: .5,
      _particleLifetime: 1000,
      _particleLifetimeVariance: 100,
      _speed: 0,
      _speedVariance: 5,
      _rVariance: Math.PI * 2,
      _duration: 300,
      _zStart: this._size.y,
    });

    this._addChild(bleeder);
  }


  _draw(ctx: CanvasRenderingContext2D, offsets = { _position: new V2(), r: 0 }) {
    super._draw(ctx);

    ctx.s();
    ctx.globalAlpha = this._opacity;

    ctx.tr(
      this._position.x + offsets._position.x,
      this._position.y + offsets._position.y - this._z // - this._verticalOffset 
    );

    this._shouldRenderShadow && this._renderShadow(ctx);
    ctx.rot(offsets.r + this._rotation);



    ctx.ss("#000");

    // head
    ctx.bp();
    ctx.fs(this._skinColor);
    ctx.fr(
      -this._size.x / 2,
      -this._size.y,
      this._size.x,
      this._size.y
    );


    let blinkScale = .5 + .5 * M.cos(this._blinkTimer.p100() * PI * 2);
    if (this._isDead)
      blinkScale = .2

    let breathScale = .3 + .3 * M.cos(this._breathTimer.p100() * PI * 2);
    if (this._isDead)
      breathScale = -.4

    // mouth
    // let _openMouth = 1.2
    // if (this._isDead) _openMouth = .2

    ctx.fs("#000");
    ctx.bp();
    ctx.lw(.1)
    //ctx.setLineDash([1, 1]);
    //ctx.ellipse(this._size.x * 3 / 9, -this._size.y/8, 1.5, _openMouth, 0, 0, PI * 2);  // option 1
    // ctx.mt(this._size.x * 3 / 9 - 2 * blinkScale, -this._size.y / 8)
    // ctx.lt(this._size.x * 3 / 9 + 2 * blinkScale, -this._size.y / 8)
    ctx.s()
    ctx.tr(this._size.x * 3 / 9 , -this._size.y / 8 -2)
    if (this._isDead) ctx.rot(PI)
    ctx.arc(0,0, 2, .8 +breathScale, PI -breathScale)
    ctx.cp();
    ctx.fill();
    ctx.r()




    // hair

    ctx.fs(this._hairColor);

    ctx.bp();
    ctx.fr(
      -this._size.x / 2,
      -this._size.y,
      this._size.x,
      this._size.y / 4
    );
    ctx.bp();
    ctx.fr(
      -this._size.x / 2,
      -this._size.y,
      this._size.x / 8,
      this._size.y * 18 / 20
    );

    // head pivot point
    // ctx.ss("#fff")
    // ctx.bp()
    // ctx.arc(0,0,1,0,PI*2)
    // ctx.stroke()      



    ctx.ss("#000");
    ctx.fs("#000");
    // ctx.lw(0);
    const eyeSize = this._size.y / 20;
    // right eye
    ctx.bp();
    ctx.ellipse(this._size.x / 2.25, -this._size.y + this._size.y / 2, eyeSize * .8, eyeSize * 2.7 * blinkScale, 0, 0, PI * 2);
    ctx.cp();
    ctx.fill();

    // left eye
    ctx.bp();
    ctx.ellipse(this._size.x / 4, -this._size.y + this._size.y / 2, eyeSize * 1.1, eyeSize * 3 * blinkScale, 0, 0, PI * 2);
    ctx.cp();
    ctx.fill();

    ctx.r();

  }




}

export default HumanHead;
