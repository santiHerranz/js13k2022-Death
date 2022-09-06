import V2 from "../core/V2";
import { CollisionRect } from "../core/Collision";
import { Game } from "../main";
import { GameEvent, CharacterType } from "../core/GameEvent";
import { M } from "../core/utils";
import GameObject from "../core/GameObject";
import { time } from "../timer";
import { sounds } from "../sound";
import Human from "./Human";

class Crate extends GameObject {

    public _size: V2 = new V2(16, 16);
    public _icon: string = "";
    public _used: boolean = false;
    public _owner: Human

    constructor(icon: string, p = new V2()) {
        super(p);

        this._icon = icon
        this._calcSlide = true;



    }

    _update(dt: any): void {

        if (!this._used)
            this._hitBox = new CollisionRect(
                this,
                new V2(- this._size.x / 2, 0 - this._z - this._verticalOffset),
                this._size.x, this._size.y,
                50, true
            );

        super._update(dt)
    }



    _hitBy(from) {
        if (!this._active) return


        // things everyone can pickup
        if (this._icon == "🔑" && !from._hasKey) {
            from._hasKey = true
            this._destroy()
            if (from === Game._scene._player)
                Game._event(GameEvent.key, from, this, .1);

        }

        // things only humans can pickup
        if (from._type == CharacterType.human) {
            if (this._icon == "💎") {
                Game._event(GameEvent.pickupDiamond, from, this, 0, from._id);
            }
        }

        // things only player can pickup
        if (from === Game._scene._player) {

            if (this._icon == "🔒" && from._hasKey && !Game._level._isUnLock) {
                this._used = true
                Game._level._isUnLock = true
                Game._event(GameEvent.unlock, from, this, .1);

            } else if (this._icon == "💗") {
                Game._event(GameEvent.pickupHeart, from, this, .1, this._id);

            } else if (this._icon == "🔓") {

            }

            // do not destroy
            // if (!["🔒", "🔓", "💗"].includes(this._icon))
            //     this._destroy()
        }

    }


    _draw(ctx: CanvasRenderingContext2D, offsets = { _position: new V2(), r: 0 }) {

        ctx.s();
        ctx.tr(0, -10); // tile optic ajustment

        ctx.tr(
            this._position.x + offsets._position.x,
            this._position.y +
            offsets._position.y
        );

        this._renderShadow(ctx);

        ctx.rot(offsets.r + this._rotation);

        // keep distance area
        // ctx.ss("rgba(255,0,0,1");
        // ctx.bp()
        // ctx.ellipse(0, 12 + this._z, 25, 25/2, 0, 0, PI * 2)
        // ctx.stroke()        

        ctx.fs("rgba(0,0,0,1");
        ctx.bp()
        ctx.ta();
        let fontSize: number = this._size.x + (this._used ? 0 : 5 * M.abs(M.cos(time * 2.5)))
        ctx.font = fontSize + "px serif";
        ctx.ft(this._icon, 0, 0 + 4); // 
        ctx.r();
    }
}

export default Crate;
