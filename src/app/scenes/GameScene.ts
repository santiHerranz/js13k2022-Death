import BaseTile from "../components/BaseTile";
import HUD from "../components/HUD";
import TileMap from "../components/TileMap";
import { debug, HEIGHT, HumanColors, mapDim, TILESIZE, WIDTH, ZombieColors } from "../configuration";
import { Camera } from "../core/Camera";
import GameObject from "../core/GameObject";
import Input from "../core/InputKeyboard";
import Scene from "../core/Scene";
import { c2i, i2c, M, PI, rand, rndPN, rndRng } from "../core/utils";
import V2 from "../core/V2";
import Crate from "../entities/Crate";
import Sword from "../entities/Sword";
import Human from "../entities/Human";
import Rope from "../entities/Rope";
import Zombie from "../entities/Zombie";
import Level from "../Level";
import { Game } from "../main";
import { time, Timer } from "../timer";
import { sounds } from "../sound";
import GameLabel from "../entities/Label";
import { GameEvent, CharacterType } from "../core/GameEvent";
import { TileType } from "../components/createTiles";
import HumanHead from "../entities/HumanHead";


export const _zombieSpawnerSafeDistance = 200
export const _pickupSafeDistance = 50


class GameScene extends Scene {

  public _interactiveLayer: GameObject;
  public _HUD: HUD;
  public _cam: Camera;
  public _humans: Human[] = [];
  public _zombies: Human[] = [];
  public _pickups: Crate[] = [];
  public _diamonds: Crate[] = [];
  public _level: Level

  public _randMoveTimer: Timer = new Timer(1);
  private _ropeTimer: Timer = new Timer;

  private _spriteSheet: HTMLCanvasElement;
  private _theRope: any;
  private _startTile: BaseTile
  private _dummyTile: BaseTile
  private _exitTile: BaseTile
  private _lockTile: BaseTile
  private _keyTile: BaseTile
  private _caveEffect: boolean = true;

  public _died: boolean = false;

  public _zombieWave: number = 0
  public _factor: number = 32;

  private _finalRescued: Human[] = [];
  private _finalHumanHeads: HumanHead[] = [];
  private _finalZombieHeads: HumanHead[] = [];
  private _finalDiamonds: Crate[] = [];
  private _showStatView: boolean = false;

  constructor(spriteSheet: HTMLCanvasElement, level = new Level, player: Human = new Human()) {
    super()

    this._spriteSheet = spriteSheet
    this._level = level
    this._player = player
    this._player._position = new V2

    this._HUD = new HUD();

    this._interactiveLayer = new GameObject();

    this._loadTileMap(this).then(uid => {
      this._init()
    });

  }

  _loadTileMap = (that) => {
    return new Promise((resolve, reject) => {

      this._tileMap = new TileMap(this._spriteSheet, { x: this._level._tiles.x, y: this._level._tiles.y });

      if (this._tileMap != undefined) {
        resolve('OK');
      }
      else {
        reject(Error("It broke"));
      }
    });
  }

  _init() {

    if (debug) { this._cam._targetDistance = 1500  } // 10*M.sqrt(this._level._tiles.x*TILESIZE.x*this._level._tiles.y*TILESIZE.y




    this._addChild(this._interactiveLayer);
    this._addChild(this._tileMap);


    // Mode:  Floor is lava
    if (this._level._index == 6) {
      for (let j = 0; j < mapDim.x; j++) {
        for (let i = 0; i < mapDim.y; i++) {
          if (i == 0 || i == mapDim.y - 1 || j == 0 || j == mapDim.x - 1) {
            let blockTile = this._tileMap._getTile(new V2(j, i)._floor());
            blockTile._tileType = TileType._LAVA
            blockTile._height = 18
            blockTile._fixed = true
          }
        }
      }
    }

    const startTilePosition = new V2(this._level._startTilePos.x, this._level._startTilePos.y);
    let exitPlace, lockPlace, keyPlace

    if (!this._level._isEndGame) {


      // set exit tile
      exitPlace = this._level._exitTilePos
      this._exitTile = this._tileMap._getTile(exitPlace)
      this._exitTile._tileType = TileType._XTILE
      this._exitTile._height = 30
      this._exitTile._fixed = true

      // set lock tile
      lockPlace = this._level._lockTilePos
      this._lockTile = this._tileMap._getTile(lockPlace)
      this._lockTile._height = 30
      this._lockTile._fixed = true

      // lock item
      if (!this._level._isUnLock) {
        let item = new Crate("🔒", this._lockTile._position)
        item._position = this._lockTile._position._copy()._add(new V2(0, -15))
        item._z = 50
        this._interactiveLayer._addChild(item);
      }

      // set key tile
      keyPlace = this._level._keyTilePos
      this._keyTile = this._tileMap._getTile(keyPlace)
      this._keyTile._height = 30
      this._keyTile._fixed = true

      // key item
      if (!this._level._isUnLock) {
        let item = new Crate("🔑", this._keyTile._position)
        item._position = this._keyTile._position._copy()._add(new V2(0, -15))
        item._z = 50
        this._interactiveLayer._addChild(item);
      }
    }


    // Start Tile
    this._startTile = this._tileMap._getTile(startTilePosition)

    if (!this._level._isFirst) {

      if (!this._level._isEndGame) this._startTile._height = -500
      this._startTile._fixed = true
      this._startTile._tileType = TileType._TRANSPARENT

      // opened dummy tile
      if (this._startTile) {
        this._dummyTile = new BaseTile(
          this._startTile._isoPosition.x - 1.4,
          this._startTile._isoPosition.y - 1.3,
          this._startTile._height,
          this._startTile._spriteSheet,
          TileType._BASE
        )
        this._dummyTile._height = 3;
        this._interactiveLayer._addChild(this._dummyTile);
      }
    }



    let startPlace: V2
    // create Player
    // TODO When falling from up level, set
    if (this._level._lastIndex > this._level._index)
      startPlace = i2c(new V2(exitPlace.x + 2.5, exitPlace.y + .5));
    else
      startPlace = i2c(startTilePosition._add(new V2(1.5, - .5)));

    this._player._position = startPlace

    this._player._hasSword = this._level._playerHasSword
    if (this._level._isEndGame) this._player._hasSword = false // avoid change final stats ;-)

    this._player._canClimb = false // reset previus status

    if (this._level._index < this._level._lastIndex || this._level._isFirst)
      this._player._z = 1500 // falling from above

    this._interactiveLayer._addChild(this._player);




    // a bunch of swords by level
    let swordCount = 0
    let wd = 0 // watchdog
    while (swordCount++ < this._level._maxSwords) {
      let big = rand() > .8
      let item = big ? new Sword(new V2, new V2(12, 50)) : new Sword()
      item._position = i2c(this._level._swordSpawner)._add(new V2(big ? 4 : 0, 0))
      item._z = 30
      item._a._add(V2._rand()._scale(10))
      item._rotation = rand(-1, 1) * PI / 4
      this._pickups.push(item);
      this._interactiveLayer._addChild(item);
      if (++wd > 1e3) break;
    }


    // hearts and diamonds
    this._createItem(this._pickups, "💗", this._level._maxHearts);
    this._createItem(this._diamonds, "💎", this._level._maxDiamonds - this._level._currentDiamonds);


    // humans spawner
    while (this._humans.length < this._level._maxHumans) {
      let wd = 0 // watchdog
      var humanPlace = randPlace();
      if (V2._distance(humanPlace, this._player._position) > this._level._tiles.x * TILESIZE.x / 4) {
        let h = new Human(humanPlace)
        h._z = 20
        h._v._add(new V2(rand(-1, 1), rand(-1, 1))._scale(rand(.1, .5)))
        this._humans.push(h);
        this._interactiveLayer._addChild(h);
      }
      if (++wd > 1e3) break;
    }

    // No rope to exit at init
    this._theRope = null


    this._level._isEndGame && sounds.GAMEWIN()

  }


  private _createItem(list: Crate[], icon: string = "", amt: number = 0) {
    let wd = 0 // watchdog
    let i = 0
    let safeDistance = _pickupSafeDistance
    if (this._player)
      while (i < amt) {
        let place: V2 = randPlace()
        let occupy = list.filter(p => { return V2._distance(place, p._position) < safeDistance }).length > 0
        let nopickup = this._pickups.filter(p => { return V2._distance(place, p._position) < safeDistance }).length == 0
        let nostart = !this._startTile || V2._distance(place, this._startTile._position) > safeDistance
        let nokey = !this._keyTile || V2._distance(place, this._keyTile._position) > safeDistance
        let noexit = !this._exitTile || V2._distance(place, this._exitTile._position) > safeDistance
        if (!occupy && nopickup && nostart && noexit && nokey) {
          let p = new Crate(icon, place);
          list.push(p);
          this._interactiveLayer._addChild(p);
          i++
        }
        if (++wd > 1e3) break;
      }
  }

  _addParticle(p) {
    this._interactiveLayer._addChild(p);
  }

  _addLabel(p: V2, t: string) {
    this._interactiveLayer._addChild(new GameLabel(p._copy(), new V2(4, 4), t));
  }

  _update(dt) {

    if (!this._level._isEndGame && this._died && Input._Enter)
      this._done = true

    this._HUD._update(dt);

    if (this._player == null) return;


    // Death status
    if (this._player._hp == 0) {

      if (!this._died) {
        // Human transform Zombie
        let z = new Zombie(this._player._position._copy())
        z._hairColor = this._player._hairColor
        z._setParts()
        z._z = 20
        z._v._add(V2._rand()._scale(rand(.1, .5)))
        this._zombies.push(z)
        this._interactiveLayer._addChild(z);

        // Now you are a zombie
        this._player = z
        this._died = true;
      }
      this._HUD._showRetry = true
    }

    // health management
    if (this._player._hp < 40 && !this._died)
      Game._event(GameEvent.playerLowHealth, this._player, null)

    // Level down
    if (!this._level._isFirst && this._player._currentTile == this._startTile && this._isHuman(this._player) && !this._down) {
      this._saveLevelState()
      this._down = true
    }

    // zombies spawner
    if (this._player._z == 0 && this._level._maxZombies.length >= 1 && this._level._maxZombies[this._zombieWave] > 0 && this._zombies.length == 0) {

      let wd = 0 // watchdog
      while (this._zombies.length < this._level._maxZombies[this._zombieWave]) {

        var zombiePlace = randPlace();
        if (V2._distance(zombiePlace, this._player._position) > _zombieSpawnerSafeDistance) {

          let z = new Zombie(zombiePlace);
          z._z = 20
          this._zombies.push(z)
          this._interactiveLayer._addChild(z);
        }
        if (++wd > 1e3) break;
      }

      if (this._zombieWave > 0 && this._level._maxZombies.length > 1) {
        this._HUD._message("Wave " + (this._zombieWave + 1) + " of " + this._level._maxZombies.length)
        setTimeout(() => {
          this._HUD._hideMessage()
          this._zombieWave += 1
        }, 3000);
      } else
        this._zombieWave += 1


    }


    // Final
    if (this._level._isEndGame && this._zombieWave >= this._level._maxZombies.length - 1 && this._zombies.length == 0) {
      this._HUD._showFinal = true

      if (this._startTile) {
        if (this._dummyTile._position.x < this._startTile._position.x - 15) this._dummyTile._position.x += .1
        if (this._dummyTile._position.y < this._startTile._position.y - 20) this._dummyTile._position.y += .1
      }

      setTimeout(() => {
        this._showStatView = true
      }, 2000);

      if (this._showStatView)
        this._showStats()


    }


    // tile way out
    if (this._level._isUnLock) {

      // TODO Use the key and the lock ADD ANIMATION
      this._player._hasKey = false

      // TODO Show the rope
      if (!this._theRope && this._exitTile) {

        // Dummy tile
        let dummyTile = new BaseTile(
          this._exitTile._isoPosition.x - .65,
          this._exitTile._isoPosition.y - .65,
          this._exitTile._height - 20,
          this._exitTile._spriteSheet,
          TileType._XTILE
        )
        this._interactiveLayer._addChild(dummyTile);


        this._exitTile._tileType = TileType._TRANSPARENT
        //this._exitTile._height -= 10


        this._theRope = new Rope(this._exitTile._position._copy(), new V2(3, 200))
        // TODO falling rope 
        this._theRope._z = 200;
        Game._scene._addParticle(this._theRope);

        this._ropeTimer.set(.5)
      }


      // need player to be at exit tile
      if (this._player._currentTile && this._exitTile && V2._distance(this._player._currentTile._position, this._exitTile._position) < 30) {
        this._player._position = this._exitTile._position._copy()._add(new V2(-3, TILESIZE.y / 2 - 10)) // -TILESIZE.x/4, /4
        this._player._v._reset()
      }

      // Climb the rope 
      if (this._isHuman(this._player) && this._player._currentTile && (this._player._currentTile === this._exitTile && this._ropeTimer.elapsed() && !this._player._canClimb) || this._player._canClimb) {
        this._player._canClimb = true
        sounds.ROPEUP()
        this._exitTile._height += 1.5
      }

      // Climb the rope to the next level
      if (this._player._currentTile && this._player._currentTile._height > 120) {
        Game._scoreRescue(this._humans.length)
        this._saveLevelState();
        this._done = true
      }

    }




    // PowerUp :: Grow Up
    // if (this._player._sizeBody.y < 30) {
    //   this._player._sizeBody = this._player._sizeBody._scale(1.01)
    //   this._player._sizeHead = this._player._sizeHead._scale(1.01)
    //   this._player._setParts()
    // }
    // PowerUp :: Grow Down
    // if (this._player._sizeBody.y > 5) {
    //   this._player._sizeBody = this._player._sizeBody._scale(0.99)
    //   this._player._sizeHead = this._player._sizeHead._scale(0.99)
    //   this._player._setParts()
    // }





    this._zombies = this._zombies.filter(z => { return z._active })
    this._humans = this._humans.filter(h => { return h._active })
    this._pickups = this._pickups.filter(p => { return p._active })
    this._diamonds = this._diamonds.filter(p => { return p._active })


    // human target acquisition
    this._humans.forEach(h => {
      if ((<Human>h)._target == null) {
        let p = randPlace();
        if (V2._distance(p, h._position) > 20)
          (<Human>h)._target = p
      }
    })

    // zombie target acquisition
    this._zombies
      .sort(() => rand() - .5)
      .some((z: Zombie, i) => {
        z._target = null
        let nearBy = this._humans
          .filter(h => { return V2._distance(z._position, h._position) < 100 })
          .sort((a, b) => { return V2._distance(a._position, z._position) })
        if (nearBy.length > 0)
          z._target = nearBy[0]._position._copy()
        else if (this._player._active && this._isHuman(this._player))
          z._target = this._player._position._copy()
        if (i > 10) return
      })


    this._pickups.forEach(p => {
      if (p._owner != null)
        p._position == p._owner._position
    })



    this._interactiveLayer._children = this._interactiveLayer._children.sort(
      (a, b) => b._position.y - a._position.y
    );

    super._update(dt);
  }


  private _isZombie(who: Human) {
    return who._type == CharacterType.zombie;
  }

  private _isHuman(who: Human) {
    return who._type == CharacterType.human;
  }
  private _isPlayer(who: Human) {
    return who == Game._scene._player
  }

  private _saveLevelState() {

    // TODO get the zombie wave state
    this._level._maxZombies = [this._zombies.length]
    this._level._maxHumans = this._humans.length
    this._level._maxDiamonds = this._pickups.filter(p => { return p instanceof Crate && (<Crate>p)._icon == "💎"; }).length;

    // TODO save key state ?

  }

  _collisionEvent(from: Human, to: Human, collisionType?: number) {

    if (from == this._player && collisionType == 2 && this._isZombie(to)) {
      Game._event(GameEvent.playerHitZombie, from, to, .3, to._id) // almost no event block time to allow slash multiple zombies at once
    } else if (collisionType == 2 && from == this._player && this._isHuman(to)) {
      Game._event(GameEvent.playerHitHuman, from, to)
    } else if (this._isZombie(from) && this._isHuman(to) && to != this._player) {
      Game._event(GameEvent.zombieHitHuman, from, to)
    } else if (this._isZombie(from) && to === this._player) {
      if (!this._player._inSafe)
        Game._event(GameEvent.zombieHitPlayer, from, to, .4) // larger event block time
    }
  }





  public _gameEventManager(code: number, from: any, obj: any) {

    let player = <Human>Game._scene._player

    switch (code) {

      case GameEvent.pickupHeart:
        if (player._hp < player._maxHp) {
          sounds.HEART()
          player._hp = player._maxHp
          this._addLabel(player._position, obj._icon);
          obj._destroy()
        }
        break;

      case GameEvent.playerLowHealth:
        sounds.DAMAGE()
        break;

      case GameEvent.zombieHitPlayer:
        Game._scene._cam._shake(20)
        sounds.DAMAGE()
        obj._hp = M.max(0, obj._hp - 10);
        if (obj._hp <= 0)
          Game._scene._cam._shake(100)
        this._gameEventManager(GameEvent.playerDie, from, obj)
        break;

      case GameEvent.playerDie:
        sounds.DIE()
        break;

      case GameEvent.zombieHitHuman:
        if (obj._active) {
          obj._hp = M.max(0, obj._hp - 25);

          if (obj._hp == 0) {
            // Human transform Zombie
            let z = new Zombie(obj._position._copy())
            z._hairColor = obj._hairColor
            z._z = 20
            z._v._add(V2._rand()._scale(rand(.1, .5)))
            z._hasSword = false
            this._zombies.push(z)
            this._interactiveLayer._addChild(z);
            obj._hp = 0
          }

        }
        break;

      case GameEvent.attack:
        player._sword._used(player)
        break;

      case GameEvent.playerHitHuman:
      case GameEvent.playerHitZombie:
        obj._hp = M.max(0, obj._hp - player._sword._damage/obj._strength);
        if (obj._active && obj._hp <= 0) {
          sounds.HEADOFF()
          obj._diedBySword = true
          if (obj._type == CharacterType.zombie)
            Game._scoreZombie(1)
          if (obj._type == CharacterType.human)
            Game._scoreHuman(1)

        } else {
          sounds.HIT()
        }
        break;


      case GameEvent.pickupDiamond:

        if (obj._active) {
          if (from == Game._player) {
            Game._scoreDiamond(1)
          } else {
            from._countDiamond++;
          }

          sounds.DIAMOMD()
          obj._destroy()
        }
        break;

      case GameEvent.sword:
        sounds.SWORD()
        break;

      case GameEvent.key:
        sounds.KEY()
        this._addLabel(obj._position, obj._icon);
        break;

      case GameEvent.unlock:
        sounds.UNLOCK()
        obj._icon = "🔓"
        this._addLabel(obj._position, obj._icon);
        break;

      case GameEvent.attack:
        sounds.ATTACK()
        break;

      case GameEvent.hitHuman:
        sounds.HIT()
        obj._hp = M.max(0, obj._hp - 25);
        break;

      case GameEvent.hitZombie:
        sounds.HIT()
        break;

      default:
        break;
    }




  }



  _draw(_ctx: CanvasRenderingContext2D) {

    if (this._caveEffect) {
      _ctx.globalCompositeOperation = 'source-over';
    }

    this._player && this._cam._moveTo(
      this._player._position.x,
      this._player._position.y + this._player._z - this._player._verticalOffset
    );


    this._cam._begin(_ctx);


    super._draw(_ctx);


    // buy new zombie radar
    if (this._player) {


      let playerPosition = this._player._position._copy()._add(new V2(0, -this._player._verticalOffset + this._player._z))
      _ctx.lw(4)
      this._zombies.forEach(z => {
        let zombiePosition = new V2(z._position.x, z._position.y - z._verticalOffset)
        let arrow = V2._subtract(zombiePosition, playerPosition)
        _ctx.bp();
        _ctx.ss("rgba(10,255,10,.2)")
        _ctx.ellipse(playerPosition.x, playerPosition.y, 30, 15, 0, arrow._heading() - .2, arrow._heading() + .2);
        _ctx.stroke()
      });

      if (this._exitTile && this._lockTile && !this._player._canClimb)
        if ((this._lockTile && this._player._hasKey) || this._level._isUnLock) {

          let nextPosition = this._level._isUnLock ? this._exitTile._globalPosition() : this._lockTile._globalPosition()
          let arrow = V2._subtract(nextPosition, playerPosition)
          _ctx.bp();
          _ctx.lw(2)
          _ctx.ss("rgba(255,255,255,.2)")
          //_ctx.ellipse(playerPosition.x, playerPosition.y, 35, 20, 0, arrow._heading() - .2, arrow._heading() + .2);
          _ctx.s()
          _ctx.tr(playerPosition.x, playerPosition.y)
          _ctx.rot(arrow._heading())
          _ctx.setLineDash([10, 20]);
          _ctx.mt(30, 0);
          _ctx.lt(0, 0);
          _ctx.mt(30, 0);
          _ctx.lt(25, 3);
          _ctx.mt(30, 0);
          _ctx.lt(25, -3);
          _ctx.stroke()
          _ctx.r()
        }


    }








    debug && this._collisions._draw(_ctx)

    this._cam._end(_ctx);


    if (this._caveEffect && !this._level._isEndGame) {
      // https://stackoverflow.com/questions/43422184/efficient-html5-canvas-glow-effect-without-shape

      let k = M.abs(M.cos(time / 10 + rand() * 10))
      if (this._factor > 3)
        this._factor *= 0.98
      else
        k = 1


      //https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient
      var w = WIDTH, h = HEIGHT;
      var gradCtx = Game._canvas.cloneNode().getContext('2d');
      //      var grad = gradCtx.createRadialGradient(w / 2, h / 2, w / 2, w / 2, h / 2, 0);
      var grad = gradCtx.createRadialGradient(w / 2, h / 2, (w / this._factor + w / this._factor * k), w / 2, h / 2, 0);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, 'white');
      gradCtx.fillStyle = grad;
      gradCtx.filter = "blur(5px)";
      gradCtx.fr(0, 0, w, h);

      var x = WIDTH / 2, y = HEIGHT / 2
      _ctx.globalCompositeOperation = 'destination-in';
      _ctx.drawImage(gradCtx.canvas, x - w / 2, y - h / 2);
      _ctx.globalCompositeOperation = 'lighten';
      _ctx.fr(0, 0, w, h);

      _ctx.globalCompositeOperation = 'source-over';
    }

    this._HUD._draw(_ctx);
  }





  _showStats() {

    this._level._saveState()
    this._level._calculateStats()

    if (this._finalRescued.length < this._level._totalHumanRescued) {
      this._showRescued(this._finalRescued, new V2(0, -50), HumanColors)
    } else if (this._finalDiamonds.length < this._level._totalDiamonds) {
      this._showDiamonds(new V2(0, +120))
    } else if (this._finalZombieHeads.length < this._level._totalZombieKilled) {
      this._showHeads(this._finalZombieHeads, new V2(-150, +120), ZombieColors)
    } else if (this._finalHumanHeads.length < this._level._totalHumanKilled) {
      this._showHeads(this._finalHumanHeads, new V2(+150, +120), HumanColors)
    }
  }


  private _showRescued(list: Human[], delta: V2, colors?) {

    var rescued = new Human(this._player._position._copy()._add(delta));
    rescued._lifeSpan = -1;
    rescued._setYOff();
    rescued._v._add(V2._fromAngle(rand() * PI * 2)._scale(40 * rand()));
    rescued._z = 20;
    rescued._zv += 3;
    rescued._rv = rndPN() / 2;

    let scene = (<GameScene>Game._scene);
    scene._addParticle(rescued);

    this._finalRescued.push(rescued);

  }
  private _showDiamonds(delta: V2, colors?) {


    var diamond = new Crate("💎", this._player._position._copy()._add(delta));
    diamond._used = true
    diamond._lifeSpan = -1;
    diamond._setYOff();
    diamond._v._add(V2._fromAngle(rand() * PI * 2)._scale(40 * rand()));
    diamond._z = 20;
    diamond._zv += 3;
    diamond._rv = rndPN() / 2;

    let scene = (<GameScene>Game._scene);
    scene._addParticle(diamond);

    this._finalDiamonds.push(diamond);

  }

  private _showHeads(list: HumanHead[], delta: V2, colors?) {


    var newHead = new HumanHead(
      this._player._position._copy()._add(delta),
      new V2(16, 18),
      this
    );
    newHead._isDead = true;
    newHead._skinColor = colors._skinColor[Math.random() * colors._skinColor.length >> 0];
    newHead._bloodColor = colors._bloodColor;
    newHead._bleed();
    newHead._lifeSpan = -1;

    newHead._boostTime = time + .03
    newHead._setYOff();
    // newHead._maxForce *= 10
    // newHead._maxSpeed *= 10
    newHead._v._add(V2._fromAngle(rand() * PI * 2)._scale(40 * rand()));
    newHead._z = 20;
    newHead._zv += 3;
    newHead._rv = rndPN() / 2;
    newHead._shouldRenderShadow = true;

    let scene = (<GameScene>Game._scene);
    scene._addParticle(newHead);

    list.push(newHead);
  }



}
export default GameScene;


function randPlace() {
  return i2c(randTile());
}
function randTile(): any {
  return new V2(rndRng(0, mapDim.x - 1), rndRng(0, mapDim.y - 1));
}





