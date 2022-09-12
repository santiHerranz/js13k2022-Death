'use strict';

import { i2c, inRng } from "./utils";
import { Camera } from "./Camera";
import { WIDTH, HEIGHT, mapDim, TILESIZE } from "../configuration";
import V2 from "./V2";
import { SimpleCollision } from "./Collision";
import GameObject from "./GameObject";
import TileMap from "../components/TileMap";
import Human from "../entities/Human";
import Input from "../core/InputKeyboard";
import { sounds } from "../sound";
import { Game } from "../main";

export default class Scene extends GameObject {

  public _player: Human;

  public _collisions: SimpleCollision = new SimpleCollision();
  public _cam: Camera;
  public _tileMap: TileMap;

  public _done: boolean = false;
  public _down: boolean = false;
  public _cheat: boolean = false;

  constructor() {
    super();

    this._cam = new Camera(WIDTH, HEIGHT);
    this._cam._distance = 5000
    this._cam._lookat = i2c(new V2(5, 5));
  }


  _update(dt) {
    this._cam._update(dt);

    let k = 2
    let kz = 10


    // TODO BEFORE RELEASE
    // if (Input._PageUp && !this._cheat) {
    //   setTimeout(() => {
    //     this._done = true
    //     this._cheat = false
    //   }, 100);
    //   this._cheat = true
    // }
    // if (Input._PageDown && !this._cheat) {
    //   setTimeout(() => {
    //     this._down = true
    //     this._cheat = false
    //   }, 100);
    //   this._cheat = true
    // }


    // up/down
    if (Input._KeyUp) {
      this._player._a.y -= 2*k;

    } else if (Input._KeyDown) {
      this._player._a.y += k;
    }

    // left/right
    if (Input._KeyLeft) {
      this._player._a.x -= k;
    } else if (Input._KeyRight) {
      this._player._a.x += k;

    }

    // attack
    if ((Game._Click || Input._Space) && this._player._canAttack()) {
      sounds.ATTACK()
      this._player._attack();
    }

    // Jump
    if (!this._player._hasSword && ((Game._Click || Input._Space) && this._player._canJump() )) {
      sounds.JUMP()
      this._player._zv += kz;
      this._player._a._scale(1.2)
    }

    this._collisions._update(dt);

    super._update(dt);
  }



  _addParticle(p) {
    this._addChild(p);
  }

  _mouseClick() {
  }


  _inViewport(p) {
    return (
      inRng(
        p.x,
        this._cam._vpRect._left - 100 /*- obj.radius*/,
        this._cam._vpRect._right + 100 /*+ obj.radius*/
      ) &&
      inRng(
        p.y,
        this._cam._vpRect._top - 100 /*- obj.radius*/,
        this._cam._vpRect._bottom + 100 /*+ obj.radius*/
      )
    );
  }

}
