import Human from "./Human";
import { ZombieColors } from "../configuration";
import Animation from "../core/Animation";
import { CharacterType } from "../core/GameEvent";
import V2 from "../core/V2";
import { zombieidle, zombiewalk } from "./AnimationConfigs";
import { M, PI, rand } from "../core/utils";
import { Timer } from "../timer";


export default class Zombie extends Human {



  constructor(p = new V2()) {
    super(p)

    this._strength = 1;

    this._type = CharacterType.zombie

    this._outfitColor = ZombieColors._outfitColor[Math.random() * ZombieColors._outfitColor.length >> 0]
    this._skinColor = ZombieColors._skinColor[Math.random() * ZombieColors._skinColor.length >> 0];
    this._bloodColor = this._head._bloodColor = ZombieColors._bloodColor
    this._setParts()

    this._head._drawMouth = (ctx) => {this._drawMouth(ctx)}
    this._head._eyeColor = ZombieColors._eyeColor
    this._head._pupileColor = ZombieColors._pupileColor 

    this._idleAnim = new Animation(20, zombieidle);
    this._walkAnim = new Animation(20, zombiewalk);

    this._maxSpeed = .8;


  }



  _drawMouth(ctx: CanvasRenderingContext2D) {

    let mouthScale = .3 + .3 * M.cos(this._head._mouthTimer.p100() * PI * 2);

    ctx.fs("#000");
    ctx.bp();
    ctx.lw(.1);
    ctx.s();
    ctx.tr(this._head._size.x * 3 / 9, -this._head._size.y / 8)
  
    // ctx.bp();
    // ctx.ellipse(3, 0, 4, 1, PI, 0, PI * 2);  // open mouth
    // ctx.stroke()
    // ctx.fill();
  
    ctx.fs("#624");
    ctx.bp();
    ctx.rect(-4, -2, 7, 2+2*mouthScale )
    ctx.fill();
  
  
    ctx.ss("#ff7");
    ctx.lw(1.5);
    ctx.setLineDash([3, .5]);
    ctx.bp();
    ctx.mt(-3, -1)
    ctx.lt(+3, -1)
    ctx.stroke()
    ctx.bp();
    ctx.lw(1);
    ctx.setLineDash([2, .5]);
    ctx.mt(-2, 2*mouthScale)
    ctx.lt(+2, 2*mouthScale)
    ctx.stroke()
  
  
    // ctx.mt(this._head._size.x * 3 / 9 - 2 * breathScale, -this._head._size.y / 8)
    // ctx.lt(this._head._size.x * 3 / 9 + 2 * breathScale, -this._head._size.y / 8)
  
    // ctx.tr(this._head._size.x * 3 / 9, -this._head._size.y / 8 - 2);
    // if (this._head._isDead)
    //   ctx.rot(PI);
    // ctx.arc(0, 0, 2, .8 + breathScale, PI - breathScale);
    // ctx.cp();
    // ctx.fill();
    ctx.r();
  }
  

}

