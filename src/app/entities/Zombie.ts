import Human from "./Human";
import { ZombieColors } from "../configuration";
import Animation from "../core/Animation";
import { CharacterType } from "../core/GameEvent";
import V2 from "../core/V2";
import { zombieidle, zombiewalk } from "./AnimationConfigs";


export default class Zombie extends Human {

  constructor(p = new V2()) {
    super(p)

    this._type = CharacterType.zombie

    this._outfitColor = ZombieColors._outfitColor[Math.random() * ZombieColors._outfitColor.length>>0]
    this._skinColor = ZombieColors._skinColor[Math.random() * ZombieColors._skinColor.length>>0];
    this._bloodColor = this._head._bloodColor = ZombieColors._bloodColor
    this._setParts()

    this._idleAnim = new Animation(20, zombieidle);
    this._walkAnim = new Animation(20, zombiewalk);

    this._maxSpeed = .8;
  }
}

