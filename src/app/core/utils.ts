import V2 from "./V2";
import { TILESIZE } from "../configuration";
import TileMap from "../components/TileMap";
import BaseTile from "../components/BaseTile";
import { TileType } from "../components/createTiles";
import { Game } from "../main";

export const M = Math;
export const PI = M.PI;

/**
 * 
 * @param pt Interactive to canvas
 * @returns 
 */
export var i2c = (pt: V2) => {
  var cartPt = new V2(0, 0);
  cartPt.x = ((pt.x - pt.y) * TILESIZE.x) / 2;
  cartPt.y = ((pt.x + pt.y) * TILESIZE.y) / 2;
  return cartPt;
};

/**
 * Canvas to Interactive
 * @param pt 
 * @returns 
 */
export var c2i = (pt: V2) => {
  var map = new V2();
  map.x = pt.x / TILESIZE.x + pt.y / TILESIZE.y;
  map.y = pt.y / TILESIZE.y - pt.x / TILESIZE.x;
  return map;
};



export  var rand = ( min=1, max=0 ) => {
  return M.random() * ( max - min ) + min;
}

export var rndPN = () => {
  return rand() * 2 - 1;
};

export var rndRng = (from, to) => {
  return ~~(rand() * (to - from + 1) + from);
};

export var inRng = (value, min, max) => {
  return value >= min && value <= max;
};

export var rndInArray = (a) => a[~~(rand() * a.length)];


export var walkTile = (obj:any, t: number) => {
  if (t === undefined || t === null) { 
    return false;
  }
  return obj == Game._scene._player || t != TileType._TRANSPARENT && obj != Game._scene._player;
};


export class rect {
  public _left: number;
  public _top: number;
  public _width: number;
  public _height: number;
  public _right: number;
  public _bottom: number;

  constructor(left, top, width, height) {
    this._left = left || 0;
    this._top = top || 0;
    this._width = width || 0;
    this._height = height || 0;
    this._right = this._left + this._width;
    this._bottom = this._top + this._height;
  }

  set(_left, _top, /*optional*/ _width, /*optional*/ _height) {
    this._left = _left;
    this._top = _top;
    this._width = _width || this._width;
    this._height = _height || this._height;
    this._right = this._left + this._width;
    this._bottom = this._top + this._height;
  }

  public get mid() {
    return new V2(this._left + this._width / 2, this._top + this._height / 2);
  }
}
