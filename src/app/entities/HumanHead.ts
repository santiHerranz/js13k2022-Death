import BodyPart from "./BodyPart";
import Emitter from "../core/Emitter";
import V2 from "../core/V2";
import {  Timer } from "../timer";
import { M, PI, rand } from "../core/utils";
import { glassesColor, HumanColors } from "../configuration";
import { CharacterType } from "../core/GameEvent";


class HumanHead extends BodyPart {

  public _skinColor: string;
  public _hairColor: string;
  public _bloodColor: string
  public _blinkTimer: Timer;
  public _breathTimer: Timer;
  public _isDead: boolean = false;
  public _eyeColor: string = HumanColors._eyeColor
  public _pupileColor: string = HumanColors._pupileColor

  public _mouthType: number = CharacterType.human

  public _mouthTimer: Timer = new Timer(.1);
  public _breathScale: number = 1;
  public _hasGlasses: boolean = false;


  constructor(p, size, colors?) {
    super(p, size);
    this._size = size

    if (colors != undefined) {
      this._skinColor = colors._skinColor
      this._hairColor = colors._hairColor
      this._bloodColor = colors._bloodColor
      this._eyeColor = colors._eyeColor
      this._pupileColor = colors._pupileColor
    }

    this._blinkTimer = new Timer;
    this._breathTimer = new Timer(1);
  }

  _update(dt: any): void {

    // // attenuation of acceleration
    // this._a._scale(.9);

    // // attenuation of velovity
    // this._v._scale(.9);

    // // attenuation of rotarion
    // this._rv *= .9;


    // randomly blink
    rand() < .005 && this._blinkTimer.set(rand(.2, .1));

    // regular breath
    if (this._breathTimer.elapsed())
      this._breathTimer.set(rand(1.5, 3));

    if (this._mouthTimer.elapsed())
      this._mouthTimer.set(rand(.2, .8));

    super._update(dt)
  }


  _bleed() {
    var bleeder = new Emitter();
    Object.assign(bleeder, {
      _position: new V2(0, this._size.y / 2),
      _rotation: -PI / 4,
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
      _rVariance: PI * 2,
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

    this._breathScale = .3 + .3 * M.cos(this._breathTimer.p100() * PI * 2);
    if (this._isDead)
      this._breathScale = -.4

    // mouth
    // let _openMouth = 1.2
    // if (this._isDead) _openMouth = .2

    if (this._mouthType == CharacterType.zombie)
      this._drawMouthZombie(ctx);
    else
      this._drawMouthHuman(ctx);




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



    this._drawEyes(ctx, blinkScale);


    if (this._hasGlasses)
      this._drawGlasses(ctx)

    ctx.r();

  }

  public _drawGlasses(ctx: CanvasRenderingContext2D) {
    
    ctx.s();
    ctx.tr(this._size.x * 3 / 9, -this._size.y)

    ctx.fs(glassesColor);
    ctx.bp();
    ctx.rect(-this._size.x/3, +this._size.y/3, this._size.x/2, this._size.y/3)
    ctx.fill();    

    ctx.bp();
    ctx.ss("#000");
    ctx.lw(1);
    ctx.rect(-this._size.x/3, +this._size.y/3, this._size.x/2, this._size.y/3)
    ctx.stroke();    

    ctx.r();

  }


  public _drawMouthHuman(ctx: CanvasRenderingContext2D) {
    ctx.fs("#000");
    ctx.bp();
    ctx.lw(.1);
    //ctx.setLineDash([1, 1]);
    //ctx.ellipse(this._size.x * 3 / 9, -this._size.y/8, 1.5, _openMouth, 0, 0, PI * 2);  // option 1
    // ctx.mt(this._size.x * 3 / 9 - 2 * blinkScale, -this._size.y / 8)
    // ctx.lt(this._size.x * 3 / 9 + 2 * blinkScale, -this._size.y / 8)
    ctx.s();
    ctx.tr(this._size.x * 3 / 9, -this._size.y / 8 - 2);
    if (this._isDead)
      ctx.rot(PI);
    ctx.arc(0, 0, 2, .8 + this._breathScale, PI - this._breathScale);
    ctx.cp();
    ctx.fill();
    ctx.r();
  }


  public _drawMouthZombie(ctx: CanvasRenderingContext2D) {

    let mouthScale = .3 + .3 * M.cos(this._mouthTimer.p100() * PI * 2);
    let xx2 = this._size.x /6
    let yy2 = this._size.y /8

    ctx.s();
    ctx.tr(this._size.x * 3 / 9, -this._size.y / 8)

    ctx.fs("#624");
    ctx.bp();
    ctx.rect(-xx2, -yy2/2, xx2*2, yy2/2 + yy2 * mouthScale)
    ctx.fill();


    ctx.ss("#ff7");
    ctx.lw(1.5);
    ctx.setLineDash([3, .5]);
    ctx.bp();
    ctx.mt(-yy2, -1)
    ctx.lt(yy2, -1)
    ctx.stroke()
    ctx.bp();
    ctx.lw(1);
    ctx.setLineDash([2, .5]);
    ctx.mt(-yy2, 2 * mouthScale)
    ctx.lt(yy2, 2 * mouthScale)
    ctx.stroke()


    
    ctx.r();
  }




  private _drawEyes(ctx: CanvasRenderingContext2D, blinkScale: number) {

    ctx.ss("#000");
    // ctx.lw(0);
    const eyeSize = this._size.y / 20;
    // right eye
    ctx.bp();
    ctx.fs(this._eyeColor);
    ctx.ellipse(this._size.x / 2.25, -this._size.y + this._size.y / 2, eyeSize * .8, eyeSize * 2.7 * blinkScale, 0, 0, PI * 2);
    ctx.cp();
    ctx.fill();

    ctx.bp();
    ctx.fs(this._pupileColor);
    ctx.ellipse(.5 + this._size.x / 2.25, -this._size.y + this._size.y / 2, eyeSize / 2 * .8, eyeSize / 2 * 2.7 * blinkScale, 0, 0, PI * 2);
    ctx.cp();
    ctx.fill();

    // left eye
    ctx.bp();
    ctx.fs(this._eyeColor);
    ctx.ellipse(this._size.x / 4, -this._size.y + this._size.y / 2, eyeSize * 1.1, eyeSize * 3 * blinkScale, 0, 0, PI * 2);
    ctx.cp();
    ctx.fill();

    ctx.bp();
    ctx.fs(this._pupileColor);
    ctx.ellipse(.5 + this._size.x / 4, -this._size.y + this._size.y / 2, eyeSize / 2 * 1.1, eyeSize / 2 * 3 * blinkScale, 0, 0, PI * 2);
    ctx.cp();
    ctx.fill();

  }

}

export default HumanHead;
