import { debug, getRandomColor, glassesColor, HEIGHT, HumanColors, WIDTH, ZombieColors } from "../configuration";
import V2 from "../core/V2";
import { Game } from "../main";
import GameObject from "../core/GameObject";
import GameScene from "../scenes/GameScene";
import Level from "../Level";
import { M, PI, rand } from "../core/utils";
import { time, Timer } from "../timer";
import HumanHead from "../entities/HumanHead";
import { CharacterType } from "../core/GameEvent";

let _barWidth = WIDTH / 4

const dialogBgColor = "rgba(10,10,10,.6)";

class HUD extends GameObject {

  public _game: any;
  public _showRetry: boolean = false;
  public _showFinal: boolean = false;
  public _showMessage: boolean = false;
  public _messageText: string

  public _bTimer: Timer = new Timer(.5);

  public _humanIcon: HumanHead
  public _zombieIcon: HumanHead

  constructor() {
    super();

    this._humanIcon = new HumanHead(new V2, new V2(32, 36), HumanColors)
    this._humanIcon._skinColor = HumanColors._skinColor[rand() * HumanColors._skinColor.length >> 0];
    this._humanIcon._hairColor = getRandomColor(); 

    this._zombieIcon = new HumanHead(new V2, new V2(32, 36), ZombieColors)
    this._zombieIcon._mouthType = CharacterType.zombie

  }

  _update(dt) {
    super._update(dt)

    if (this._bTimer.elapsed()) {
      this._bTimer.set(.5)
    }

    this._humanIcon._update(dt)
    this._zombieIcon._update(dt)

  }

  _draw(ctx: CanvasRenderingContext2D) {
    // bar backgrounds
    ctx.fs("rgba(100,100,100,.2)");
    ctx.fr(0, 0, WIDTH, 25 * 2);

    const scene = <GameScene>Game._scene;

    if (scene._player) {

      // health bar
      ctx.fs("#fff");
      ctx.fr(WIDTH / 2 - _barWidth / 2, 10, _barWidth, 20);
      ctx.fs("#d11141");
      ctx.fr(WIDTH / 2 - _barWidth / 2, 10, (scene._player._hp / scene._player._maxHp) * _barWidth, 20);

      // growup bar
      if (Game._player._growEffectTimer.isSet()) {
        ctx.fs("#00aedb");
        ctx.fr(WIDTH / 2 - _barWidth / 2, 35, (1 - Game._player._growEffectTimer.p100()) * _barWidth, 10);
      }

    }

    const level = <Level>(scene)._level;
    ctx.st("LEVEL " + level._number + "/" + (level._levelState.length - 1), 20, 30, 26);

    ctx.textAlign = "right";
    let x = WIDTH - WIDTH / 4, y = 4
    ctx.st("💎 " + (level._currentDiamonds) + "/" + scene._level._maxDiamonds, x + 180, 30, 26);

    ctx.st(this.getCrono(), WIDTH - 30, 30, 26);


    // zombie radar
    if (Game._player._hasZombieRadar) {
      let x = WIDTH / 6, y = 30
      ctx.st("🧭", x + 30, y, 26);
    }

    // glasses
    if (Game._player._hasGlasses) {
      let x = WIDTH / 6 + 70, y = 24
      ctx.s()
      ctx.bp()
      ctx.fs(glassesColor)
      ctx.mt(x, y)
      ctx.arc(x, y, 20, 0, PI * 2 - PI * 2 * Game._player._glassesTimer.p100())
      ctx.lt(x, y)
      ctx.cp()
      ctx.fill()
      ctx.r()

      ctx.st("🥽", x + 18, y + 6, 26);
    }


    // key
    if (Game._player._hasKey) {
      let x = WIDTH / 6, y = 30
      ctx.st("🔑", x + 180, y, 26);
    }

    // human head
    if (scene._humans.length > 0) {
      let x = WIDTH / 2 - _barWidth / 2 - 80, y = 36

      this._humanIcon._draw(ctx, { _position: new V2(x, y), r: 0 })

      ctx.textAlign = "left";
      ctx.st(":" + scene._humans.length, x + 20, 30, 26);
    }

    // zombi head
    if (scene._zombies.length > 0) {
      let x = WIDTH / 2 + _barWidth / 2 + 30, y = 36

      this._zombieIcon._draw(ctx, { _position: new V2(x, y), r: 0 })

      ctx.textAlign = "left";
      ctx.st(":" + scene._zombies.length, x + 20, 30, 26);

    }

    if (this._showMessage) {
      ctx.fs(dialogBgColor);
      ctx.rr(WIDTH / 2 - WIDTH / 3, HEIGHT * 2 / 12 - 80, 2 * WIDTH / 3, 100, 30);
      ctx.ta();
      ctx.st(this._messageText, WIDTH / 2, HEIGHT * 2 / 12 - 40, 30);
    }


    if (this._showRetry) {
      ctx.fs(dialogBgColor);
      ctx.rr(40, HEIGHT / 2 - HEIGHT / 12, WIDTH - 80, HEIGHT / 6, 30);
      ctx.ta();
      ctx.st("Press Enter to try again", WIDTH / 2 - 40 / 2, HEIGHT / 2, HEIGHT / 12 + 3 * M.cos(this._bTimer.p100()));
    }

    if (this._showFinal) {


      ctx.fs(dialogBgColor);
      ctx.rr(WIDTH / 2 - WIDTH * 3 / 4 / 2, 40, WIDTH * 3 / 4, 400, 30);
      ctx.ta();
      ctx.st("⭐ YOU ESCAPED! 🎉", WIDTH / 2 - 40 / 2, 100, 80 + 3 * M.cos(this._bTimer.p100()));
      ctx.st("⏱ " + this.getCrono() + " ⏱", WIDTH / 2 - 40 / 2, 180, 60 + 3 * M.cos(this._bTimer.p100()));
      let line = 40, ref = 200

      ctx.ta("center")
      if (level._totalHumans > 0)
        ctx.st("Rescued: " + (level._playerHumanRescued + " of " + level._totalHumans).padStart(12, ' ') + ((100 * level._playerHumanRescued / level._totalHumans).toFixed(1) + " %").padStart(12, ' '), WIDTH / 2 - 40 / 2, ref + line * 1, 30);

      if (level._totalDiamonds > 0)
        ctx.st("Diamonds: " + (level._playerDiamonds + " of " + level._totalDiamonds).padStart(12, ' ') + ((100 * level._playerDiamonds / level._totalDiamonds).toFixed(1) + " %").padStart(12, ' '), WIDTH / 2 - 40 / 2, ref + line * 2, 30); // 

      if (level._totalZombies > 0)
        ctx.st("kills: " + level._playerZombieKills + " zombies and " + level._playerHumanKills + " humans", WIDTH / 2 - 40 / 2, ref + line * 4, 30); // 
    }




    //debug && showDebugValues(ctx);
  }

  private msToTime(s) {

    var ms = (s % 1000);
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;

    let result = ""
    if (mins > 0)
      result += mins.toString().padStart(2, '0') + ':'

    result += secs.toString().padStart(2, '0') + '.' + M.floor(ms / 100).toString().substring(0, 1);

    return result
  }

  private getCrono() {

    return this.msToTime(Game._cronoAcc);
  }

  _message(text: string) {
    this._messageText = text
    this._showMessage = true
  }
  _hideMessage() {
    this._messageText = ""
    this._showMessage = false
  }

}





function showDebugValues(ctx: CanvasRenderingContext2D) {

  let i = 2;
  let size = HEIGHT / 40

  ctx.ta("left");
  ctx.fs("#fff");
  ctx.fr(9, 9 + size * 1, WIDTH / 4, size * 4);

  if (Game._scene instanceof GameScene) {
    let scene = <GameScene>Game._scene;
    if (scene._player) {

      // let vpRect = "vpRect: " + JSON.stringify(Game._scene._cam._vpRect);
      // let vpRectMid = "vpRect Mid: " + JSON.stringify(Game._scene._cam._vpRect.mid);
      // let vpScale = "vpScale: " + JSON.stringify(Game._scene._cam._vpScale);
      // let distance = "distance: " + Game._scene._cam._distance.toFixed(1);
      // let lookat = "lookat: " + JSON.stringify(Game._scene._cam._lookat);
      // let canvasSize = "canvasSize: " + JSON.stringify({ x: Game._canvas.width, y: Game._canvas.height });
      // let playerPosition = "playerPosition: " + JSON.stringify(scene._player._position);
      // var playerTilePos = "playerTilePos: " + JSON.stringify(c2i(scene._player._globalPosition())._floor());
      // let playerZ = "playerZ: " + JSON.stringify(scene._player._z.toFixed(2));
      // let playerZV = "playerZV: " + JSON.stringify(scene._player._zv.toFixed(2));
      // let playerSword = "playerSword: " + JSON.stringify(scene._player._sword._damage.toFixed(2));
      let diamonds = "diamonds: " + JSON.stringify(Game._level._currentDiamonds);
      let maxZombies = "maxZombies: " + JSON.stringify(Game._level._maxZombies);
      let zombieWave = "zombieWave: " + JSON.stringify(scene._zombieWave);
      //var tile = scene._player._getTile(currentTilePos);   

      ctx.st(WIDTH + " " + HEIGHT, 10, i++ * size, size);
      ctx.st(diamonds, 10, i++ * size, size);
      ctx.st(maxZombies, 10, i++ * size, size);
      ctx.st(zombieWave, 10, i++ * size, size);
      ctx.st(Game._level._currentHumanRescued, 10, i++ * size, size);

      // ctx.st(vpRect, 10, i++ * size, size);
      // ctx.st(vpRectMid, 10, i++ * size, size);
      // ctx.st(vpScale, 10, i++ * size, size);
      // ctx.st(distance, 10, i++ * size, size);
      // ctx.st(lookat, 10, i++ * size, size);
      // ctx.st(canvasSize, 10, i++ * size, size);
      // ctx.st(playerPosition, 10, i++ * size, size);
      // ctx.st(playerTilePos, 10, i++ * size, size);
      // ctx.st(playerZ, 10, i++ * size, size);
      // ctx.st(playerZV, 10, i++ * size, size);
      // ctx.st(playerSword, 10, i++ * size, size);

      // let player_v = "player v: " + JSON.stringify(scene._player._a);
      // let player_a = "player a: " + JSON.stringify(scene._player._v);
      // ctx.st(player_v, 20, i++ * size, size);
      // ctx.st(player_a, 20, i++ * size, size);


    }
  }
}

export default HUD;


