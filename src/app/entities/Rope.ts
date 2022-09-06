import V2 from "../core/V2";
import GameObject from "../core/GameObject";

class Rope extends GameObject {

    public _size: V2;

    constructor(p = new V2(), size = new V2(10, 40)) {
        super(p);
        this._size = size;
    }

    _draw(ctx: CanvasRenderingContext2D) {

        ctx.s();
        ctx.tr(0,-10); // tile optic ajustment

        ctx.lw(1);
        ctx.globalAlpha = this._opacity;
        ctx.tr(
            this._position.x ,
            this._position.y -
            this._verticalOffset 
        );

        //this._shouldRenderShadow && this._renderShadow(ctx);

        ctx.rot(this._rotation);

        // rope
        ctx.lw(2);
        ctx.fs("#5B3017");
        ctx.fr(0, -this._size.y, this._size.x/2, this._size.y);
        ctx.fs("#875638");
        ctx.fr(this._size.x / 2, -this._size.y, this._size.x/2, this._size.y);

        ctx.r();
    }
}

export default Rope;
