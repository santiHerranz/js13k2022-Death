import GameObject from "../core/GameObject";
import V2 from "../core/V2";
import { Game } from "../main";
import Animation from "../core/Animation";
import { idle, walk, attack } from "./AnimationConfigs";
import HumanHead from "./HumanHead";
import { CollisionRect } from "../core/Collision";
import { time, Timer } from "../timer";
import { M, PI, rand, rndPN, rndRng } from "../core/utils";
import BodyPart from "./BodyPart";
import HumanSword from "./HumanSword";
import HumanBody from "./HumanBody";
import Crate from "./Crate";
import Sword from "./Sword";
import { GameEvent, CharacterType as CharacterType } from "../core/GameEvent";
import GameScene, { _zombieSpawnerSafeDistance } from "../scenes/GameScene";
import { Control } from "./Control";
import { BigZombieMaxHp, debug, getRandomColor, HumanColors, ZombieColors } from "../configuration";
import { TileType } from "../components/createTiles";


export default class Human extends GameObject {

  public _outfitColor: string = HumanColors._outfitColor[rand() * HumanColors._outfitColor.length>>0];
  public _skinColor: string
  public _hairColor: string
  public _bloodColor: string = HumanColors._bloodColor;
  public _eyeColor: string = HumanColors._eyeColor
  public _pupileColor: string = HumanColors._pupileColor

  public _sizeHead: V2 = new V2(16, 18);
  public _sizeHeadHair: V2 = new V2(1, rand(15, 20));
  public _sizeBody: V2 = new V2(12, 18);
  public _sizeLeg: V2 = new V2(4, 4);
  public _sizeArm: V2 = new V2(4, 12);
  public _sizeSword: V2 = new V2(10, 40);

  public _diedBySword: boolean = false

  public _head: HumanHead;
  public _body: HumanBody;
  public _sword: HumanSword;


  public _inAttack: boolean = false;
  public _inSafe: boolean = false;

  // public _ATTACK_DELAY: number = 15;

  // public _attackDelayCounter: number = 0;

  public _idleAnim: Animation;
  public _walkAnim: Animation;
  public _attackAnim: Animation;
  public _currentAnim: Animation;

  public _facingRight: boolean;

  public _tileYOffset: number = 0;

  public _strength: number = 4; // sword damage divisor


  public _hasKey: boolean = false
  public _countDiamond: number = 0
  public _hasSword: boolean = false
  public _hasGlasses: boolean = false;
  public _hasZombieRadar: boolean = false;

  public _canClimb: boolean;

  public _target: V2
  public _controlFunc: any;
  public _motionHeading: number;

  public _stunTimer: Timer = new Timer;
  public _growEffectTimer: Timer = new Timer;
  public _glassesTimer: Timer = new Timer;

  public _hpIndicatorColor = "#00ff00";
  public _Grow: number = 0;
  


  get _verticalOffset() {
    return this._tileYOffset + this._z;
  }

  constructor(p = new V2()) {
    super(p);

    this._motionHeading = PI;
    this._controlFunc = Control.goToPosition;

    this._type = CharacterType.human

    this._hp = this._maxHp = 100;

    // max speed
    this._maxSpeed = 10
    this._maxForce = 1
    this._maxZSpeed = 2

    this._idleAnim = new Animation(20, idle);
    this._walkAnim = new Animation(20, walk);
    this._attackAnim = new Animation(16, attack, false);

    // current animation
    this._currentAnim = this._idleAnim;

    this._setColors();
    
  }

  _setColors() {
    this._skinColor = HumanColors._skinColor[rand() * HumanColors._skinColor.length >> 0];
    this._hairColor = getRandomColor(); 
    this._setParts();
  }

  _control(dt) {

    // decision maker
    let decision = this._controlFunc(this, this._target);

    // apply decision 
    this._rotate(decision.r);
    this._move(decision.m * dt);

    // target reached
    if (decision.d < 2)
      this._target = null
  }
  _rotate(angle) {
    this._motionHeading += angle;
  }
  _move(value) {
    this._a._add(V2._fromAngle(this._motionHeading, value));
  }


  _canJump() { return this._z === 0 }

  _canAttack() {
    return this._z === 0 &&
      this._hasSword;
  }



  _update(dt) {

    // this._attackDelayCounter = M.max(this._attackDelayCounter - dt, 0);

    // if (this._currentTile && this._currentTile._tileType == TileType._HOLE) {
    //   this._bump(this, 5, true)
    // }


    // Facing move direction
    if (this._v.x > .2 && !this._facingRight ) {
      this._facingRight = true
    } else if (this._v.x < -.2 && this._facingRight) {
      this._facingRight = false
    }

    // navigation control
    if (this._target != null && !this._stunTimer.active()) {
      this._control(dt);
    }

    // collisions
    this._checkCollision();


    // update for blink eyes
    this._head._update(dt)
    this._body._update(dt)
    this._sword._update(dt)

    this._setAnimation();
    this._currentAnim._update(dt);
    this._inAttack = this._currentAnim == this._attackAnim

    // keep safe after attack 
    if (this._inAttack && !this._inSafe) {
      this._inSafe = true
      setTimeout(() => {
        this._inSafe = false
      }, 400);
    }



    // slow walk when carry sword
    if (this._hasSword)
      this._v._scale(.5);


    // // PowerUp :: Grow Up
    if (this._Grow == 1) {
      if (this._sizeBody.y < 30) {
        this._growChange(1.01);
      }
    }
    // PowerUp :: Grow Down
    if (this._Grow == 2) {
      if (this._sizeBody.y > 10) {
        this._growChange(0.99);
      }
    }

    if (this._Grow == 0) {
      if (this._sizeBody.y - Game._playerRef._sizeBody.y > 1) {
        this._growChange(0.99);
      } else if (Game._playerRef._sizeBody.y - this._sizeBody.y > 1) {
        this._growChange(1.01);
      }
    }



    if (this._growEffectTimer.elapsed()) {
      this._Grow = 0
      this._growEffectTimer.unset()
    }

    // glasses
    this._head._hasGlasses = (this == Game._player && this._hasGlasses)

    if (this._glassesTimer.elapsed()) {
      this._hasGlasses = false
      this._glassesTimer.unset()
    }
    super._update(dt);
  }


  private _growChange(value: number = 1.0) {
    this._sizeBody._scale(value);
    this._sizeHead._scale(value);
    this._setParts();
    this._body._sizeArm._scale(value);
    this._body._sizeLeg._scale(value);
  }

  _destroy() {
    if (!this._active) return

    if (this._hitBox)
      this._hitBox._active = false;

    if (this._diedBySword) {
      this._headoff();
    }

    if (this._hasSword) {
      this._throwAway(new Sword(this._position._copy(), this._sizeSword))
    }

    if (this._hasKey) {
      this._throwAway(new Crate("🔑", this._position._copy()))
    }

    while (this._countDiamond > 0) {
      let diamond = new Crate("💎", this._position._copy())
      this._countDiamond--
      Game._scene._diamonds.push(diamond)
      this._throwAway(diamond, 2, 20)
    }

    super._destroy();
  }



  private _throwAway(item: Crate, zv: number = rndRng(0.5, 1), speed: number = 4) {
    this._gibPart(item as any, 40, zv, speed);
    Game._scene._addParticle(item);
  }

  private _headoff() {

    var newHead = new HumanHead(
      this._position._copy(),
      this._sizeHead,
      this
    );
    newHead._isDead = true
    newHead._bleed();
    newHead._skinColor = this._head._skinColor;
    newHead._bloodColor = this._head._bloodColor;
    newHead._lifeSpan = 3000;
    newHead._mouthType = this._type

    var newBody = new HumanBody(
      this._position._copy(),
      this._sizeBody,
      this
    );
    newBody._sizeArm = this._sizeArm;
    newBody._sizeLeg = this._sizeLeg;
    newBody._lifeSpan = 3000;

    newBody._boostTime = time + .03
    this._gibPart(newBody, this._z + 1, 12, 20, -.25);
    newHead._boostTime = time + .03
    this._gibPart(newHead, this._z + 1, 12, 20, .25);

    let scene = (<GameScene>Game._scene);
    scene._addParticle(newHead);
    scene._addParticle(newBody);

  }
  

  _setParts() {


    // Important! first body then head
    if (this._body == null)
    this._body = new HumanBody(
      new V2(0, 9), // V2(0, 9) correct!
      this._sizeBody,
      this
    );

    if (this._head == null)
    this._head = new HumanHead(
      new V2(0, this._body._position.y - this._sizeBody.y), // +this._sizeBody.y - this._sizeHead.y
      this._sizeHead,
      this
    );

    this._head._skinColor = this._skinColor
    this._head._hairColor = this._hairColor
    this._body._skinColor = this._skinColor


    this._head._position.y = this._body._position.y - this._sizeBody.y

    this._head._mouthType = this._type
    
    if (this._type == CharacterType.zombie) {
      this._head._skinColor = this._skinColor
      this._head._eyeColor = ZombieColors._eyeColor
      this._head._pupileColor = ZombieColors._pupileColor
    }

    this._sword = new HumanSword(
      new V2(1, this._body._position.y), // this._sizeBody.y/2
      this._sizeSword
    );

    this._head._parent = this._body._parent = this._sword._parent = this;
  }

  _gibPart(part: BodyPart, z, zv, rvDivisor, speed = 10) {
    part._setYOff();
    part._a._add(V2._fromAngle(rand() * PI * 2)._scale(speed));
    part._z = z;
    part._zv += zv;
    part._rv = rndPN() / rvDivisor;
    part._shouldRenderShadow = true;
  }


  _setAnimation() {
    if (
      !([
        this._attackAnim,
      ].includes(this._currentAnim) && !this._currentAnim._finished
      )
    ) {
      if (this._v._magnitude() > 0.1) {
        this._currentAnim = this._walkAnim;
      } else {
        this._currentAnim = this._idleAnim;
      }
    }
  }

  _bump(from: Human, factor: number = 1, jump: boolean = false) {

    // turn opposite direction
    const v = V2._subtract(from._position, this._position)._normalize()._scale(-100);
    this._a._add(v)
    //this._boostTime = time + .01

    // little jump out
    if (from._v._magnitude() > 5 || jump) {
      if (this._zv == 0)
        this._zv += 5;
    }

  }

  _hitBy(from) {

    // bump everyone, except player attacking
    if (this._active && !this._inSafe) { //&& !this._stunTimer.isSet()

      this._bump(from, 1, false)

      if (from == Game._scene._player && from._Grow == 1) {
          this._boostTime = time + .1
          this._bump(from, 2, true)
          
        }

      // get a push from a human
      if (from == Game._scene._player
        && this._hasSword
        && from._v._copy()._magnitude() > .5) {

        // Human drop the sword
        var newSword = new Sword(from._position._copy(), this._sizeSword);
        newSword._length = from._sword._length
        this._throwAway(newSword)
        this._hasSword = false
        this._stunTimer.set(3)
      }

    }
  }

  _checkCollision() {

    if (!this._active) return;

    let collisionAreaList = []

    collisionAreaList.push({
      t: 1, c: new CollisionRect(
        this,
        new V2(-10, - 12 - this._verticalOffset + this._z),
        20, 15,
        50, true
      )
    })

    if (this._hasSword && this._inAttack) {
      collisionAreaList.push({
        t: 2, c: new CollisionRect(
          this,
          new V2(
            0 + (this._facingRight ? 0 : -1) * (this._sword._length + 20),
            -20 - 15 - this._verticalOffset + this._z
          ),
          this._sword._length + 20, 45,
          50, true
        )
      })

    }


    collisionAreaList.forEach(collisionEvent => {

      var enemiesNearby = Game._scene._collisions._overlapRect(
        collisionEvent.c
      );

      enemiesNearby.forEach((enemy) => {

        enemy._object._hitBy(this);

        if (enemy._object instanceof Human) {
          Game._collisionEvent(this, enemy._object, collisionEvent.t)
        }

      });
    });
  }


  _attack() {

    Game._event(GameEvent.attack, this, null)

    this._currentAnim = this._attackAnim;
    this._attackAnim._currentFrame = 0;

    var dir = this._facingRight ? 1 : -1;


    var enemiesToDamage = Game._scene._collisions._overlapRect(
      new CollisionRect(
        this,
        new V2(
          dir * (this._sizeBody.x / 2 + 10 + (this._facingRight ? 0 : 36)),
          -30
        ),
        36,
        20
      )
    );

    if (enemiesToDamage.length > 0) {

      enemiesToDamage.forEach((enemy) => {

        if (enemy._z === 0) {
          enemy._object._hitBy(this, false);
        }
      });
    }

    // this._attackDelayCounter = this._ATTACK_DELAY;

  }

  _draw(ctx: CanvasRenderingContext2D) {
    if (
      Game._scene._inViewport(
        V2._add(this._position, new V2(0, -this._verticalOffset))
      )
    ) {
      super._draw(ctx);

      var anim = this._currentAnim._current;

      ctx.s();
      ctx.tr(0, -10); // tile optic ajustment

      ctx.lw(1);


      // if (debug) {
      //   if (this._target) {
      //     let t = this._target
      //     ctx.ss("rgb(255,255,255,0.3)")
      //     ctx.setLineDash([20, 20]);
      //     ctx.lw(2)
      //     ctx.bp();
      //     ctx.mt(this._position.x,this._position.y - this._verticalOffset);
      //     ctx.lt(t.x, t.y - this._verticalOffset);
      //     ctx.stroke();
      //   }
      // }





      ctx.tr(
        this._position.x,
        this._position.y - this._verticalOffset
      );

      // safe area
      // if (debug) {
      //   ctx.ss("rgba(255,0,0,1");
      //   ctx.bp()
      //   ctx.ellipse(0, 12 + this._z, _zombieSpawnerSafeDistance, _zombieSpawnerSafeDistance/4, 0, 0, PI * 2)
      //   ctx.stroke()
      // }

      // shadow
      if (this._currentTile) {
        ctx.fs("rgba(0,0,0,0.5");
        ctx.bp()
        ctx.ellipse(0, 12 + this._z, 10, 5, 0, 0, PI * 2)
        ctx.fill()
      }

      if (!this._facingRight) {
        ctx.scale(-1, 1);
      }


      // head pivot point
      // ctx.ss("yellow")
      // ctx.bp()
      // ctx.arc(0,0,1,0,PI*2)
      // ctx.stroke()          

      // body
      this._body._draw(ctx, anim.b);

      // head
      this._head._draw(ctx, anim.h);


      // sword
      if (this._hasSword)
        this._sword._draw(ctx, anim.s);

      ctx.ta();
      ctx.font = "bold 15px serif";

      if (this._hasKey) {
        ctx.bp()
        ctx.ft("🔑", 0, 0 + 4); // 
      }


      if (this != Game._scene._player && this._countDiamond > 0) {
        ctx.bp()
        ctx.ft("💎", 0, 0 + 4); // 

        if (debug) {
          if (!this._facingRight) ctx.scale(-1, 1);
          ctx.st(this._countDiamond, 0, 0, 20)
        }
      }




      if (Game._scene instanceof GameScene && ( this._maxHp == 100 && this._hp < 90) || (this._maxHp == BigZombieMaxHp && this._hp < 250)) {

        if (!this._facingRight) {
          ctx.scale(-1, 1);
        }

        ctx.lineWidth = 20 * 0.1;
        let width = 20;
        let offsetY = this._sizeBody.y + this._sizeHead.y;

        ctx.bp();
        ctx.ss("#fff");
        ctx.mt(0 - width / 2, 0 - offsetY);
        ctx.lt(0 + width / 2, 0 - offsetY);
        ctx.stroke();

        ctx.bp();
        ctx.strokeStyle = this._bloodColor;
        ctx.mt(0 - width / 2, 0 - offsetY);
        ctx.lt(0 - width / 2 + width * (this._hp / this._maxHp), 0 - offsetY); // M.abs(M.cos(time/1))*100 
        ctx.stroke();
       }


      ctx.r();

    }


  }




}



