import GameObject from "../core/GameObject";
import V2 from "../core/V2";

class GameLabel extends GameObject {

    public _size: V2;
    public _text: string;

  constructor(p: V2, size: V2, text: string) {
    super(p);
    this._size = size;
    this._text = text;
    this._lifeSpan = 250
    }

    _update(dt: any): void {
        super._update(dt)
        this._zv += 2
    }

    _draw(ctx:CanvasRenderingContext2D) {
        ctx.s();
        ctx.tr(this._position.x, this._position.y);
        ctx.bp();
        ctx.st( this._text, 0-this._size.x / 2, 0+this._size.y / 2 - this._z, 12 ,"Helvetica");
        ctx.r();
    }
}

export default GameLabel
