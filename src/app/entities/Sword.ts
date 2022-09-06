import V2 from "../core/V2";
import { CollisionRect } from "../core/Collision";
import { Game } from "../main";
import { GameEvent, CharacterType } from "../core/GameEvent";
import Crate from "./Crate";
import Human from "./Human";

class Sword extends Crate {

    public _length: number;
    public _damage: number = 100

    constructor(p = new V2(), size = new V2(10, 40)) {
        super("", p);

        this._size = size;
        this._length = size.y

    }

    _hitBy(from: Human) {

        if (!from._hasSword && this._active && from._type == CharacterType.human) {
            from._hasSword = true;

            // transfer sword properties
            from._sizeSword = from._sword._size = this._size
            from._sword._length = this._length
            from._sword._damage = this._damage

            if (from === Game._scene._player)
                Game._event(GameEvent.sword, from, this, .1);


            this._destroy()
        }
    }

    _draw(ctx: CanvasRenderingContext2D, offsets = { _position: new V2(), r: 0 }) {

        ctx.s();
        ctx.tr(0, -10); // tile optic ajustment

        ctx.lw(1);
        ctx.globalAlpha = this._opacity;
        ctx.tr(
            this._position.x + offsets._position.x,
            this._position.y +
            offsets._position.y // - this._verticalOffset
        );

        this._renderShadow(ctx);

        ctx.rot(offsets.r + this._rotation);

        // blade
        ctx.lw(2);
        ctx.fs("#d8d8d8");
        ctx.fr(0, -(this._size.y - 18) / 2 - 8, this._size.x / 2, this._length);
        ctx.fs("#cccccc");
        ctx.fr(this._size.x / 2, -(this._size.y - 18) / 2 - 8, this._size.x / 2, this._length);
        // hilt
        ctx.fs("#963");
        ctx.fr(0, -(this._size.y - 6) / 2 - 5, this._size.x, 5);
        // handle
        ctx.fs("#333");
        ctx.fr(this._size.x / 4, -(this._size.y - 6) / 2 - 10, this._size.x / 2, 5);

        ctx.r();
    }

}

export default Sword;
