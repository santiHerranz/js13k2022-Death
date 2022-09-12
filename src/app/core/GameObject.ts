import V2 from "./V2";
import GameNode from "./GameNode";
import { Game } from "../main";
// import SteeringManager from "./ai/SteeringManager";
import { c2i, walkTile, i2c, M } from "./utils";
import { CollisionRect } from "./Collision";
import BaseTile from "../components/BaseTile";
import { debug, mapDim, TILESIZE } from "../configuration";
import Human from "../entities/Human";
import { CharacterType } from "./GameEvent";
import { time } from "../timer";

class GameObject extends GameNode {

  public _v: V2 = new V2() // velocity
  public _a: V2 = new V2() // acceleration

  public _zv: number = 0;   // z velocity
  public _zgrav: number = .98; // gravity
  public _speed: number = 10;
  public _maxSpeed: number = 100;
  public _maxSpeedCopy: number = -1;
  public _maxForce: number = 1;
  public _maxZSpeed: number = 0;
  public _boostTime: number = 0;



  /*** Health Points */
  public _maxHp: number = Infinity;
  public _hp: number;

  public _lifeSpan: number = -1;
  public _age: number = 0;

  public _hitBox: CollisionRect;

  public _tileYOffset: number = 0;

  public _currentTile: BaseTile;

  public _calcSlide: boolean = true;
  public _opacity: number = 1;

  get _verticalOffset() {
    return this._tileYOffset + this._z;
  }

  constructor(p = new V2()) {
    super();
    this._position = p;
  }

  _addChild(child) {
    child._parent = this;
    this._children.push(child);
  }

  _destroy() {
    this._active = false;

    if (this._hitBox) {
      this._hitBox._destroy();
    }

    this._parent = undefined;
  }

  _update(dt) {
    if (!this._active) return;

    this._age += dt;

    if (
      this._hp <= 0 ||
      (this._lifeSpan && this._lifeSpan !== -1 && this._age >= this._lifeSpan)
    ) {
      this._destroy();
      return;
    }

    // var tt = dt / 1000;

    var previousPosition = this._position._copy();

    // limit acceleration
    this._a._limit(this._maxForce);

    // but it's boost time
    if (time < this._boostTime) 
      this._a._scale(100)

    // // calculate speed based on acceleration
    this._v._add(this._a)._limit(this._maxSpeed);

    // // calculate position based on velocity and delta time
    this._position._add(this._v);
    
    // ended boost time
    if (time > this._boostTime) {
      this._v._scale(.5);
      this._a._reset();
    }

    // // gravity
    this._zv -= this._zgrav;
    this._z = M.max(0, this._z + this._zv); // * dt

    if (this._z < 1) {
      // TODO should probably have an acc value so this hack isn't necessary
      this._zv = 0;
      this._rv = 0;
    }

    this._calcSlide && this._slide(previousPosition);

    this._setYOff();

    super._update(dt);
  }

  _draw(ctx: CanvasRenderingContext2D) {
    super._draw(ctx)

    debug && debugLines(ctx, this);
  }



  _getTile(isoP): BaseTile {
    if (
      !Game._scene._tileMap ||
      Game._scene._tileMap._map.length === 0 ||
      isoP.x >= mapDim.x ||
      isoP.x < 0 ||
      isoP.y >= mapDim.y ||
      isoP.y < 0
    ) {
      return null;
    }
    return Game._scene._tileMap._map[isoP.y][isoP.x];
  }

  // _distanceToPlayer(): number {
  //   return V2._distance(this._position, Game._scene._player._position);
  // }

  _slide(curr) {
    var currC = c2i(curr);
    var nextC = c2i(this._position);

    // TODO performance measure
    var nTile = this._getTile(nextC._copy()._floor());
    if (nTile && walkTile(this, nTile._tileType)) {
      return;
    }

    var newP = currC._copy();

    // get the vector that represents the change in pos
    var diffVec = V2._subtract(nextC, currC);

    // check x
    var xVec = diffVec._copy();
    xVec.y = 0;
    var tile = this._getTile(V2._add(currC, xVec)._floor());
    if (tile && walkTile(this, tile._tileType)) {
      newP._add(xVec);
    }

    // check y
    var yVec = diffVec._copy();
    yVec.x = 0;
    tile = this._getTile(V2._add(currC, yVec)._floor());
    if (tile && walkTile(this, tile._tileType)) {
      newP._add(yVec);
    }

    // keep inside interactive
    this._position = i2c(newP);

    // turn opposite direction
    this._v._add(diffVec._scale(-1))

  }

  _setYOff() {
    var currentTilePos = c2i(this._globalPosition())._floor();
    var tile = this._getTile(currentTilePos);

    if (tile) {
      var diff = tile._height - this._tileYOffset;
      if (diff < 0 && walkTile(this, tile._tileType)) {
        // dropping down
        this._z += this._tileYOffset - tile._height;
      }
      this._tileYOffset = tile._height;
      this._currentTile = tile;

      if (diff > 0) this._z = M.max(0, this._z - diff);
    }
  }
}

export default GameObject;


function debugLines(ctx: CanvasRenderingContext2D, obj: GameObject) {

  if (obj._type == CharacterType.human || obj._type == CharacterType.zombie) {
    ctx.s();

    ctx.ss("#fff");
    ctx.bp();
    ctx.mt(obj._position.x, obj._position.y - obj._tileYOffset);
    ctx.lt(obj._position.x + obj._v.x * 40, obj._position.y - obj._tileYOffset + obj._v.y * 40);
    ctx.stroke();

    ctx.ss("#f0f");
    ctx.bp();
    ctx.mt(obj._position.x, obj._position.y - obj._tileYOffset);
    ctx.lt(obj._position.x, obj._position.y - obj._tileYOffset - obj._z * 2);
    ctx.stroke();

    ctx.ss("#f00");
    ctx.bp();
    ctx.mt(obj._position.x, obj._position.y - obj._tileYOffset);
    ctx.lt(obj._position.x + obj._a.x , obj._position.y - obj._tileYOffset + obj._a.y );
    ctx.stroke();


    ctx.r();

  }
}
