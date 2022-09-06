import GameObject from "../core/GameObject";
import V2 from "../core/V2";
import { Game } from "../main";
import Animation from "../core/Animation";
import { idle, walk, attack } from "./AnimationConfigs";
import HumanHead from "./HumanHead";
import { CollisionRect } from "../core/Collision";
import { time, Timer } from "../timer";
import { c2i, i2c, M, PI, rand, rndPN, rndRng } from "../core/utils";
import BodyPart from "./BodyPart";
import HumanSword from "./HumanSword";
import HumanBody from "./HumanBody";
import Crate from "./Crate";
import Sword from "./Sword";
import { GameEvent, CharacterType as CharacterType } from "../core/GameEvent";
import GameScene, { _zombieSpawnerSafeDistance } from "../scenes/GameScene";
import { Control } from "./Control";
import { debug, getRandomColor, HumanColors } from "../configuration";
import { TileType } from "../components/createTiles";


export default class Human extends GameObject {

  public _outfitColor: string = HumanColors._outfitColor[Math.random() * HumanColors._outfitColor.length>>0];
  public _skinColor: string
  public _hairColor: string
  public _bloodColor: string = HumanColors._bloodColor;

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

  public _ATTACK_DELAY: number = 15;

  public _attackDelayCounter: number = 0;

  public _idleAnim: Animation;
  public _walkAnim: Animation;
  public _attackAnim: Animation;
  public _currentAnim: Animation;

  public _facingRight: boolean;

  public _tileYOffset: number = 0;



  public _hasKey: boolean = false
  public _countDiamond: number = 0
  public _hasSword: boolean = false

  public _canClimb: boolean;

  public _target: V2
  public _controlFunc: any;
  public _motionHeading: number;

  public _stunTimer: Timer = new Timer;

  

  get _verticalOffset() {
    return this._tileYOffset + this._z;
  }

  constructor(p = new V2()) {
    super(p);

    this._motionHeading = Math.PI;
    this._controlFunc = Control.goToPosition;

    this._type = CharacterType.human

    this._hp = this._maxHp = 100;

    // max speed
    this._maxSpeed = 10
    this._maxZSpeed = 2

    this._idleAnim = new Animation(20, idle);
    this._walkAnim = new Animation(20, walk);
    this._attackAnim = new Animation(16, attack, false);

    // current animation
    this._currentAnim = this._idleAnim;

    this._setColors();

  }

  _setColors() {
    this._skinColor = HumanColors._skinColor[Math.random() * HumanColors._skinColor.length >> 0];
    this._hairColor = getRandomColor(); // HumanColors._hairColor[Math.random() * HumanColors._hairColor.length>>0];
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

    this._attackDelayCounter = M.max(this._attackDelayCounter - dt, 0);

    if (this._currentTile && this._currentTile._tileType == TileType._LAVA) {
      this._bump(this, 5, true)
    }


    // Facing move direction
    if (this._v.x > 0 && !this._facingRight) // this._v._magnitude() > 0.1 
      this._facingRight = true
    if (this._v.x < 0 && this._facingRight)
      this._facingRight = false

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


    super._update(dt);
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



  private _throwAway(item: Crate, zv: number = rndRng(0.5, 1.5), speed: number = 4) {
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
    this._body = new HumanBody(
      new V2(0, 9), // V2(0, 9) correct!
      this._sizeBody,
      this
    );

    this._head = new HumanHead(
      new V2(0, this._body._position.y - this._sizeBody.y), // +this._sizeBody.y - this._sizeHead.y
      this._sizeHead,
      this
    );


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

    // must be at the floor level
    //if (M.floor(this._z) != 0) return;

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
          this._sword._length + 20, 40,
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

          if (enemy._object instanceof Human)
            Game._event(GameEvent.hitHuman, this, enemy._object)
          else
            Game._event(GameEvent.hitZombie, this, enemy._object)


        }

      });


    }

    this._attackDelayCounter = this._ATTACK_DELAY;

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

      ctx.r();

    }


  }
}



