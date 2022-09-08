import HUD from "../components/HUD";
import { debug, HEIGHT, WIDTH } from "../configuration";
import Input from "../core/InputKeyboard";
import Scene from "../core/Scene";
import { M } from "../core/utils";
import V2 from "../core/V2";
import Crate from "../entities/Crate";
import Human from "../entities/Human";
import Sword from "../entities/Sword";
import Zombie from "../entities/Zombie";
import { Game } from "../main";
import { sounds } from "../sound";
import { deltaTime, time, Timer } from "../timer";

class IntroScene extends Scene {

  public _HUD: HUD;

  private _started: boolean = false;
  private _gravity: number = -0.098;

  sword: Sword;

  constructor(player) {
    super();

    this._player = player

    this._HUD = new HUD();

    this._HUD._draw = (ctx: CanvasRenderingContext2D) => {

      ctx.fs("#111");
      ctx.rr(9, 9, WIDTH - 18, HEIGHT / 3, 20);


      ctx.ta();
      ctx.st("Escape from", WIDTH / 2 - 9, HEIGHT / 8 - HEIGHT / 18, WIDTH / 20, "Helvetica", "#ED1B23", "#fff");
      ctx.st("DEATH HOLE", WIDTH / 2 - 9, HEIGHT / 8 + HEIGHT / 10, WIDTH / 8, "Helvetica", "#ED1B23", "#fff");

      // left ground
      ctx.fs("#896A44");
      ctx.fr(0, HEIGHT - HEIGHT / 4, WIDTH / 2 - 100, HEIGHT / 3);
      ctx.fr(WIDTH / 2 + 100, HEIGHT - HEIGHT / 4, WIDTH / 2 - 100, HEIGHT / 3);

      // right ground
      ctx.fs("#438742");
      ctx.fr(0, HEIGHT - HEIGHT / 4, WIDTH / 2 - 100, 50);
      ctx.fr(WIDTH / 2 + 100, HEIGHT - HEIGHT / 4, WIDTH / 2 - 100, 50);

      // manhole
      if (!this._started) {
        ctx.fs("#444");
        ctx.fr(WIDTH / 2 - 100, HEIGHT - HEIGHT / 4, 200, 25);
      }

      let h = HEIGHT * 1 / 30
      let s = 20
      ctx.st("Use arrow keys or WASD to move", WIDTH / 2, HEIGHT / 2 - 4 * h, s);
      ctx.st("Click or Space to action", WIDTH / 2, HEIGHT / 2 - 3 * h, s);
      if (Game._monetization) {
        ctx.st("Hello Coil member!", WIDTH / 2, HEIGHT / 2 - 1 * h, s);
        ctx.st("Click on player to change color", WIDTH / 2, HEIGHT / 2 + 1 * h, s);
      } else {
        ctx.st("Coil members can change player colors", WIDTH / 2, HEIGHT / 2 - 1 * h, s);
      }

      ctx.st("Press Enter to start", WIDTH / 2, HEIGHT / 2 + HEIGHT / 2.5, 40 + 3 * M.cos(this._HUD._bTimer.p100()));

    }


    this._cam._lookat = new V2(24, -22);
    this._cam._targetDistance = this._cam._distance = 400;

    // this._player = new Human(new V2(-100, 30));
    // this._player._outfitColor = "#f00"
    // this._player._setParts()
    this._player._position = new V2(-100, 30)
    this._addChild(this._player);


    // this._addChild(new Zombie(new V2(50, 30)))

  }


  _update(dt: any): void {
    super._update(dt)

    this._HUD._update(dt)

    this._player._a = new V2(30, 0)
    if (this._cam._vpRect.mid.x > this._player._position.x ){
      this._cam._lookat = new V2(24 -time*100, -22);
    } else 
    this._player._a._reset()

    if (Input._Space && this._player._canJump()) {
      this._changeColor();
    }

    if (Input._Enter && !this._started) {
      this._started = true
      setTimeout(() => {
        this._done = true
      }, 2500);
    }
    if (this._started) {
      this._gravity *= 1.1
      this._player._position.y -= this._gravity
    }


    

  }

  _draw(ctx: CanvasRenderingContext2D) {
    this._cam._begin(ctx);

    super._draw(ctx);

    if (debug)
      this._collisions._draw(ctx)

    this._cam._end(ctx);

    this._HUD._draw(ctx);

  }



  _mouseClick() {
    super._mouseClick()
    if (Game._monetization)    
      this._changeColor();
  }


  private _changeColor() {
    sounds.DIAMOMD();
    this._player._setColors();
    Game._playerRef._hairColor = this._player._hairColor;
    Game._playerRef._skinColor = this._player._skinColor;
  }
}

export default IntroScene;

