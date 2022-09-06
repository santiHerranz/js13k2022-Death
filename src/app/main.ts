'use strict';

import 'types-wm'
import "./interface-canvas";
import { WIDTH, HEIGHT, debug } from "./configuration";
import GameScene from "./scenes/GameScene";
import { createTiles } from "./components/createTiles";
import { timeStep } from "./timer";
import Level from "./Level";
import IntroScene from "./scenes/IntroScene";
import { sounds, UpdateAudio } from "./sound";
import Human from "./entities/Human";
import Semaphore from "./core/Semaphore";
import { M } from "./core/utils";
import V2 from "./core/V2";


class _Game {

  public _currentTime: number;
  public _canvas: any;
  public _ctx: CanvasRenderingContext2D;
  public _scene: any;
  public _level: Level = new Level
  public _paused: boolean = false;
  public _animationFrame: any;

  public _spritesheets: any[] = [];

  public _sem = new Semaphore()

  public _eventTimers = []
  public _music: any;
  public _playerRef: Human;
  public _player: Human;


  constructor() {

    this._currentTime = performance.now();

    this._canvas = document.getElementById("game");
    this._ctx = this._canvas.getContext("2d");

    this._canvas.width = WIDTH;
    this._canvas.height = HEIGHT;

    oncontextmenu = () => false;
    onscroll = e => e.preventDefault();

    this._loadSpritesheets(this).then(uid => {
      this._intro();
    });

    sounds.BACKGROUND()


    this._playerRef = new Human(new V2(0,0))
    this._playerRef._outfitColor = "#f00"
    this._playerRef._setParts()

    this._player = new Human(new V2(0,0))
    this._player._outfitColor = "#f00"
    this._player._setParts()


    onmouseup = e => {
      this._scene._mouseClick();
    };


    if (document.monetization) {
      document.monetization.addEventListener('monetizationstart', () => {
        document.getElementById('exclusive').classList.remove('hidden')
      })
    }
  }

  _loadSpritesheets = (that) => {
    return new Promise((resolve, reject) => {
      (<_Game>that)._level._levelState.forEach((l, index) => {

        const canvas = createTiles(l.c);
        that._spritesheets.push(canvas);

        // if (index == 0) {
        //   let downloadLink;
        //   document.body.appendChild(downloadLink = document.createElement('a'));
        //   downloadLink.download = 'screenshot-'+ rand().toString(36).substr(2, 5) +'.png';
        //   downloadLink.href = canvas.toDataURL('image/png').replace('image/png','image/octet-stream');
        //   downloadLink.click();
        // }
      })

      if (that._spritesheets.length > 0) {
        resolve('OK');
      }
      else {
        reject(Error("It broke"));
      }
    });
  };



  _scoreRescue(value: number) {
    this._level._currentHumanRescued += value
  }

  _scoreDiamond(value: number) {
    this._level._currentDiamonds += value
  }
  _scoreZombie(value: number) {
    this._level._currentZombiesKilled += value
  }
  _scoreHuman(value: number) {
    this._level._currentHumansKilled += value
  }

  _event(code: number, from: any, obj: any, t: number = .3, name: string = "") {
    if (t == 0 || this._sem._ready(code + name)) {
      if (this._scene instanceof GameScene)
        (<GameScene>this._scene)._gameEventManager(code, from, obj)
      t != 0 && this._sem._lock(code + name, t)
    }

  }

  _collisionEvent(from: Human, to: Human, type?: number) {
    if (!from._active || !to._active) return

    if (this._scene instanceof GameScene)
      (<GameScene>this._scene)._collisionEvent(from, to, type)
  }

  _intro() {
    this._disable();
    this._scene = new IntroScene(this._player);
    this._enable()
  }

  _enable() {
    this._animationFrame = requestAnimationFrame(this._animate.bind(this));
  }

  _disable() {
    cancelAnimationFrame(this._animationFrame);
  }

  _animate(time) {
    this._animationFrame = requestAnimationFrame(this._animate.bind(this));

    var dt = M.max(0, time - this._currentTime);

    //dt = dt / 300;
    //dt = dt / 60;
    //dt = dt / 30;
    //dt = dt / 15;

    this._update(dt);
    this._currentTime = time;

    timeStep(dt)
  }

  _end() {
    this._disable();
    this._levelUp();
    this._enable()
  }

  _levelUp() {
    this._disable();
    this._level._playerHasSword = this._scene._player._hasSword
    this._level._levelIncrement()
    this._restart()
    this._enable()
  }

  _levelDown() {
    this._disable();
    this._level._playerHasSword = this._scene._player._hasSword
    this._level._levelDecrement()
    this._restart()
    this._enable()
  }

  _restart() {
    this._level._init()
    this._scene = new GameScene(this._spritesheets[this._level._index], this._level, this._player);
    this._scene._down = false
    this._scene._died = false
  }

  _update(dt) {

    this._scene._update(dt);

    UpdateAudio(dt)

    this._sem._update(dt)

    if (this._scene._done) {
      this._scene._done = false

      if (this._scene instanceof IntroScene)
        this._restart()
      else if (this._scene instanceof GameScene) {
        if ((<GameScene>this._scene)._died) {
          this._disable();

          this._player = new Human()
          this._player._outfitColor = "#f00"
          this._player._hairColor = this._playerRef._hairColor
          this._player._skinColor = this._playerRef._skinColor
          this._player._setParts()

          this._restart()
          this._enable()
        }
        else
          this._levelUp();
      }
    }


    if (this._scene._down) {
      this._levelDown();
      this._scene._down = false
    }

    this._draw();
  }

  _draw() {
    var { _ctx, _scene } = this;

    _ctx.clearRect(0, 0, WIDTH, HEIGHT);
    _ctx.fs("rgba(0,0,0,1)");
    _ctx.fr(0, 0, WIDTH, HEIGHT);

    _ctx.s();
    _scene._draw(_ctx);

    _ctx.r();

  }

}


export var Game = new _Game();

