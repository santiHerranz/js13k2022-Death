import { debug, getRandomColor, HEIGHT, HumanColors, WIDTH, ZombieColors } from "../configuration";
import V2 from "../core/V2";
import { Game } from "../main";
import GameObject from "../core/GameObject";
import GameScene from "../scenes/GameScene";
import Level from "../Level";
import { c2i, M, PI } from "../core/utils";
import { Timer } from "../timer";
import HumanHead from "../entities/HumanHead";

let _barWidth = WIDTH/4

const dialogBgColor = "rgba(10,10,10,.5)";

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
    this._humanIcon._skinColor = HumanColors._skinColor[Math.random() * HumanColors._skinColor.length >> 0];
    this._humanIcon._hairColor = getRandomColor(); // HumanColors._hairColor[Math.random() * HumanColors._hairColor.length>>0];

    this._zombieIcon = new HumanHead(new V2, new V2(32, 36), ZombieColors)

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
    }

    const level = <Level>(scene)._level;
    ctx.st("LEVEL " + level._number +"/"+ (level._levelState.length-1) , 20, 30, 26);

    ctx.textAlign = "right";
    let x = WIDTH - WIDTH/4, y = 4
    ctx.st("💎 " + (level._currentDiamonds) + "/" + scene._level._maxDiamonds, x + 220, 35, 26);


    if (this._showFinal) {
      ctx.fs(dialogBgColor);
      ctx.rr(WIDTH/2 - WIDTH*3/4/2, 40, WIDTH*3/4, 300, 30);
      ctx.ta();
      ctx.st("YOU ESCAPED!", WIDTH / 2 - 40 / 2, 100, 80 + 3 * M.cos(this._bTimer.p100()));
      // ctx.st("⭐⭐⭐", WIDTH / 2 - 40 / 2, 180, 80 + 3 * M.sin(this._bTimer.p100()));
      let line = 40, ref = 120
      ctx.st("Rescued:" + Game._level._totalHumanRescued , WIDTH / 2 - 40 / 2, ref+line*1, 40);
      ctx.st("Diamonds:" + Game._level._totalDiamonds , WIDTH / 2 - 40 / 2, ref+line*2, 40);
      ctx.st("Zombie killed:" + Game._level._totalZombieKilled , WIDTH / 2 - 40 / 2,  ref+line*3, 40);
      ctx.st("Human killed:" + Game._level._totalHumanKilled , WIDTH / 2 - 40 / 2, ref+line*4, 40);
    }

    if (this._showRetry) {
      ctx.fs(dialogBgColor);
      ctx.rr(40, HEIGHT / 2 - HEIGHT / 12, WIDTH - 80, HEIGHT / 6, 30);
      ctx.ta();
      ctx.st("Press Enter to try again", WIDTH / 2 - 40 / 2, HEIGHT / 2 , HEIGHT / 12 + 3 * M.cos(this._bTimer.p100()));
    }

    if (this._showMessage) {
      ctx.fs(dialogBgColor);
      ctx.rr(WIDTH/2-WIDTH/3, HEIGHT*2 / 12 - 80, 2*WIDTH/3, 100, 30);
      ctx.ta();
      ctx.st(this._messageText, WIDTH / 2, HEIGHT*2 / 12 - 40, 30);
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

      // maxZombies is a wave of zombies is array format
      const sum = scene._level._maxZombies.reduce((sum, a) => sum + a, 0);

      const total = scene._level._maxZombies[scene._zombieWave - 1]
      const current = total - scene._zombies.length

      let waves = ""
      scene._level._maxZombies.forEach((w, index) => {
        if (index > scene._zombieWave)
          waves += ","+ w
      })
      waves = ""

      ctx.textAlign = "left";
      ctx.st(":" + scene._zombies.length +" "+ waves, x + 20, 30, 26);
      // ctx.st(":" + current + "/" + total, x + 20, 30, 26);

    }



    debug && showDebugValues(ctx);
  }


  // _drawHead(ctx: CanvasRenderingContext2D, _position: V2, _size: V2, _sizeHeadHair: V2, colors) {
  //   ctx.s();
  //   ctx.globalAlpha = this._opacity;

  //   ctx.tr(
  //     _position.x,
  //     _position.y
  //   );

  //   ctx.ss("#000");

  //   // head
  //   ctx.bp();
  //   ctx.fs(colors._skinColor);
  //   ctx.fr(
  //     -_size.x / 2,
  //     0,
  //     _size.x,
  //     _size.y
  //   );

  //   // hair
  //   let hairSize = _size.y / 20;

  //   ctx.fs(colors._hairColor);

  //   ctx.bp();
  //   ctx.fr(
  //     -_size.x / 2,
  //     0,
  //     _size.x,
  //     _size.y / 4
  //   );
  //   ctx.bp();
  //   ctx.fr(
  //     -_size.x / 2,
  //     0,
  //     _size.x / 8,
  //     hairSize * _sizeHeadHair.y
  //   );

  //   ctx.ss("#000");
  //   ctx.fs("#000");
  //   // ctx.lengthw(0);
  //   const eyeSize = _size.y / 20;
  //   // right eye
  //   ctx.bp();
  //   ctx.ellipse(_size.x / 2.25, _size.y / 2, eyeSize * .8, eyeSize * 2.7, 0, 0, PI * 2);
  //   ctx.cp();
  //   ctx.fill();

  //   // left eye
  //   ctx.bp();
  //   ctx.ellipse(_size.x / 4, _size.y / 2, eyeSize * 1.1, eyeSize * 3, 0, 0, PI * 2);
  //   ctx.cp();
  //   ctx.fill();

  //   ctx.r();
  // }

  _message(text: string){
    this._messageText = text
    this._showMessage = true
  }
  _hideMessage(){
    this._messageText = ""
    this._showMessage = false
  }

}





function showDebugValues(ctx: CanvasRenderingContext2D) {

  let i = 2;
  let size = HEIGHT / 40

  ctx.fs("#fff");
  ctx.fr(9, 9 + size * 1, WIDTH / 2, size * 4);

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


