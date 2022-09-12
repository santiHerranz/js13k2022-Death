import Human from "./Human";
import { ZombieColors } from "../configuration";
import Animation from "../core/Animation";
import { CharacterType } from "../core/GameEvent";
import V2 from "../core/V2";
import { zombieidle, zombiewalk } from "./AnimationConfigs";
import { M, PI, rand } from "../core/utils";
import { Timer } from "../timer";


export default class Zombie extends Human {



  constructor(p = new V2()) {
    super(p)

    this._strength = 1;

    this._type = CharacterType.zombie

    this._outfitColor = ZombieColors._outfitColor[rand() * ZombieColors._outfitColor.length >> 0]
    this._skinColor = ZombieColors._skinColor[rand() * ZombieColors._skinColor.length >> 0];
    this._bloodColor = this._head._bloodColor = ZombieColors._bloodColor
    this._setParts()

    this._head._mouthType = CharacterType.zombie
    this._head._eyeColor = ZombieColors._eyeColor
    this._head._pupileColor = ZombieColors._pupileColor 

    this._idleAnim = new Animation(20, zombieidle);
    this._walkAnim = new Animation(20, zombiewalk);

    this._maxSpeed = .8;


  }



  

}

