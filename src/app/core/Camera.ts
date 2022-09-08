import V2 from "./V2"
import { M, PI, rect, rndPN } from "./utils";

export class Camera {
  public _distance: number = 80;
  public _targetDistance: number = 576;
  public _lookat: V2 = new V2();
  public _fov: number = PI / 4.0;
  public _vpRect = new rect(0, 0, 0, 0);
  public _vpScale = new V2(.5, .5);

  public _lerp = true;
  public _lerpD = 0.15;
  public _viewportWidth: number;
  public _viewportHeight: number;
  public _aspectRatio: number;

  public _renderMoveBounds: boolean;
  public _moveBoundsLen: number;

  public _shakeValue: number;

  constructor(viewportWidth, viewportHeight) {
    this._shakeValue = 0;
    this._updateViewPort();

    // viewport dimentions
    this._viewportWidth = viewportWidth;
    this._viewportHeight = viewportHeight;
    // aspect ratio
    this._aspectRatio = viewportWidth / viewportHeight;

    this._renderMoveBounds = false;
    this._moveBoundsLen = 100
  }

  _shake(time: number) {
    this._shakeValue = time
  }

  _begin(ctx: CanvasRenderingContext2D) {
    ctx.s();
    this._scale(ctx);
    this._translate(ctx);
  }

  _end(ctx: CanvasRenderingContext2D) {


    ctx.r();
  }

  _scale(ctx: CanvasRenderingContext2D) {
    ctx.scale(this._vpScale.x, this._vpScale.y);
  }

  _translate(ctx: CanvasRenderingContext2D) {
    ctx.tr(-this._vpRect._left, -this._vpRect._top);
  }

  _update(dt) {
    this._shakeValue = M.max(this._shakeValue - dt, 0);


    this._zoomTo(this._distance + (this._targetDistance - this._distance) * 0.05);
  }

  // _update viewport
  _updateViewPort() {
    this._vpRect.set(
      this._lookat.x - this._vpRect._width / 2.0 + (this._shakeValue ? rndPN() * 6 : 0),
      this._lookat.y - this._vpRect._height / 2.0 + (this._shakeValue ? rndPN() * 6 : 0),
      this._distance * M.tan(this._fov),
      this._vpRect._width / this._aspectRatio
    );

    this._vpScale.x = this._viewportWidth / this._vpRect._width;
    this._vpScale.y = this._viewportHeight / this._vpRect._height;
  }

  // boundsFollow(pos) {
  //   var bMid = this._vpRect._mid;
  //   var diff = V2._subtract(pos, bMid);
  //   var d = diff.len() - this.moveBoundsLen;

  //   if (d > 0) {
  //     this._lookat._add(diff._normalize().scale(d));
  //   }

  //   this._updateViewPort();
  // }

  // _zoom(factor) {
  //   this._distance /= factor;
  //   this._targetDistance = this._distance
  //   this._updateViewPort();
  // }
  _zoomTo(z) {
    this._distance = z;
    this._updateViewPort();
  }

// BEGIN DELETE
  // _move(x, y) {

  //   let current = this._lookat._copy()

  //   var bMid = this._vpRect.mid;
  //   var diff = V2._subtract(new V2(x, y), bMid);

  //   diff._add(current)
  //   var d = diff._magnitude();
  //   if (d > 0) {
  //     this._lookat._add(diff); 
  //   }
  //   this._updateViewPort();
  // }
// END DELETE

  _moveTo(x, y) {

    var vec = new V2(x, y);
    if (this._lerp) {
      this._lookat._subtract(V2._subtract(this._lookat, vec)._scale(this._lerpD));
    } else {
      this._lookat = vec._copy();
    }

    this._updateViewPort();
  }


  // lockBounds() {
  //   this._vpRect._left = App.clamp(
  //     this._vpRect._left,
  //     this.boundsRect.left,
  //     this.boundsRect.right - this._vpRect._width
  //   );
  //   this._vpRect._top = App.clamp(
  //     this._vpRect._top,
  //     this.boundsRect.top,
  //     this.boundsRect.bottom - this._vpRect._height
  //   );
  // }

  // screenToWorld(x, y, obj) {
  //   obj = obj || new V2();
  //   obj.x = x / this._vpScale.x + this._vpRect._left;
  //   obj.y = y / this._vpScale.y + this._vpRect._top;
  //   return obj;
  // }

  // worldToScreen(x, y, obj) {
  //   obj = obj || new V2();
  //   obj.x = (x - this._vpRect._left) * this._vpScale.x;
  //   obj.y = (y - this._vpRect._top) * this._vpScale.y;
  //   return obj;
  // }
}
