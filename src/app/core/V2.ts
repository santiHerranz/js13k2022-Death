import { M, rand } from "./utils";


class V2 {
  public x: number;
  public y: number;

  //
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  static _rand() {
    return new V2(rand(-1,1),rand(-1,1)      )
  }

  static _add(a, b) {
    return new V2(a.x + b.x, a.y + b.y);
  }

  static _subtract(a, b) {
    return new V2(a.x - b.x, a.y - b.y);
  }

  static _scale(a, b) {
    return b instanceof V2
      ? new V2(a.x * b.x, a.y * b.y)
      : new V2(a.x * b, a.y * b);
  }

  static _distance(a, b) {
    return M.sqrt(M.pow(b.x - a.x, 2) + M.pow(b.y - a.y, 2));
  }

  static _fromAngle(r, length?) {
    if (typeof length === 'undefined') {
      length = 1;
    }
    return new V2(length * M.cos(r), length * M.sin(r));
  }

  // Rotates a vector around the origin. Shorthand for a rotation matrix
  static _rotateAroundOrigin(v, a) {
    return new V2(
      v.x * M.cos(a) - v.y * M.sin(a),
      v.x * M.sin(a) + v.y * M.cos(a)
    );
  }



  _heading() {
    const h = Math.atan2(this.y, this.x);
    return h;
  };

  _copy() {
    return new V2(this.x, this.y);
  }

  // get magnitude of a vector
  _magnitude() {
    return M.sqrt(this.x * this.x + this.y * this.y);
  }


  _normalize() {
    var m = this._magnitude();

    return m > 0 ? this._scale(1 / m) : this;
  }

  _limit(max) {
    if (this._magnitude() > max) {
      this._normalize();
      return this._scale(max);
    }
    return this;
  }

  _add(v:{x: number,y:number}) {
    this.x += v.x;
    this.y += v.y;

    return this;
  }

  _subtract(v) {
    this.x -= v.x;
    this.y -= v.y;

    return this;
  }


  _scale(sc) {
    this.x *= sc;
    this.y *= sc;

    return this;
  }

  _floor() {
    this.x = M.floor(this.x);
    this.y = M.floor(this.y);

    return this;
  }

  _reset() {
    this.x = 0;
    this.y = 0;
    return this;
  }
}

export default V2;
