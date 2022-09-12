import GameObject from "../core/GameObject"
import V2 from "../core/V2";
import { i2c, M } from "../core/utils";
import { Game } from "../main";
import { debug, TILESIZE} from "../configuration";
import Level from "../Level";

// Colour adjustment function
// Nicked from http://stackoverflow.com/questions/5560248
export var shadeColor = (color, percent) => {

  if (color == Level._transparent)
    return color

  color = color.substr(1);
  var num = parseInt(color, 16),
    amt = M.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = ((num >> 8) & 0x00ff) + amt,
    B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
};

class BaseTile extends GameObject {
  public _spriteSheet: any;
  public _fixed: boolean = false;
  public _tileType: number;
  public _baseHeight: number;
  public _height: number;
  public _walkable: boolean = true;
  public _isoPosition: V2;

  constructor(isox, isoy, height = 0, spriteSheet, tileType: number) {
    super();

    height = M.min(200, M.max(height, 0)) // 0-200

    this._spriteSheet = spriteSheet;
    this._tileType = tileType;

    this._isoPosition = new V2(isox, isoy);
    this._position = i2c(this._isoPosition);
    this._height = this._baseHeight = height;
  }


  _draw(ctx: CanvasRenderingContext2D) {
    if (Game._scene._inViewport(this._position)) {
      var h = ~~this._height; //M.floor(this._height); //
      ctx.drawImage(
        this._spriteSheet,
        M.floor(this._tileType * (TILESIZE.x + 1)),
        M.floor(TILESIZE.y * h + (h * (h + 1)) / 2 - h),
        M.floor(TILESIZE.x),
        M.floor(TILESIZE.y + h),
        M.floor(this._position.x - TILESIZE.x / 2),
        M.floor(this._position.y - h),
        M.floor(TILESIZE.x),
        M.floor(TILESIZE.y + h)
      );

      // if (debug) {
      //   ctx.fs("#000")
      //   ctx.bp();
      //   ctx.ta()
      //   ctx.ft((this._isoPosition.x-1) + ":" + (this._isoPosition.y), this._position.x - TILESIZE.x / 2, this._position.y - TILESIZE.y*2/3 ) // TILE index : Health
      //   ctx.cp();
      //   ctx.fill()
      // }
    
    }



    super._draw(ctx);
  }
}

export default BaseTile;
