import { M, PI, rand } from "./utils";
import V2 from "./V2";

class GameNode {
  public _a_GAMENODE: string;

  public _children: GameNode[] = [];
  public _position: V2 = new V2();
  public _z: number = 0;
  public _rotation: number = 0;
  public _rv: number = 0;
  public _active: boolean = true;
  public _parent: GameNode;
  public _id: string = ""+ M.floor(rand() * 9999);
  public _type: number ;

  _globalPosition() {
    var pos = this._position._copy();
    var parent = this._parent;
    while (parent) {
      pos = V2._rotateAroundOrigin(pos, parent._rotation)
      pos._add(parent._position); // test ._add(new V2(0, 0.0001))
      parent = parent._parent;
    }
    return pos;
  }

  _globalAngle() {
    var value = this._rotation;
    var parent = this._parent;
    while (parent) {
      value += parent._rotation;
      parent = parent._parent;
    }
    return value;
  }

  _globalZ() {
    var value = this._z;
    var parent = this._parent;
    while (parent) {
      value += parent._z;
      parent = parent._parent;
    }

    return value;
  }

  _addChild(child) {
    child._parent = this;
    this._children.push(child);
  }

  _update(dt) {

    this._rotation += this._rv * dt;

    var length = this._children.length;
    while (length--) {
      var child = this._children[length];
      child._update(dt);
      if (!child._active) {
        this._children.splice(length, 1);
        continue;
      }
    }
  }

  _draw(ctx: CanvasRenderingContext2D) {
    var length = this._children.length;

    if (length === 0) {
      return;
    }
    ctx.s();
    ctx.tr(this._position.x, this._position.y - this._z);
    ctx.rot(this._rotation);

    while (length--) {
      this._children[length]._draw(ctx);
    }


    ctx.r();

  }

  _renderShadow(ctx:CanvasRenderingContext2D) {
    ctx.s()
    ctx.fs("rgba(0,0,0,0.5");
    ctx.bp()
    ctx.ellipse(0, 12 + this._z, 10, 5, 0, 0, PI*2)
    ctx.fill()
    ctx.r()
  }

}

export default GameNode;
