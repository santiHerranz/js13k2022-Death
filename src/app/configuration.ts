import V2 from "./core/V2";

export const debug = false

export var WIDTH = 768;
export var HEIGHT = 432;

if (innerWidth >= 1024) {
    WIDTH = 1024
    HEIGHT = 1024 * 432 / 768
}
if (innerWidth >= 1536) {
    WIDTH = 1536
    HEIGHT = 1536 * 432 / 768
}

export var TILESIZE = new V2(60, 30);
export var mapDim = { x: 5, y: 5 };

export function setMapDim(value = mapDim) {
    mapDim.x = value.x
    mapDim.y = value.y
}


export function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export const HumanColors = {
    _outfitColor: ["#00f"],
    _skinColor: ["#E3C199","#FCDFBE","#C6936E","#9E6A3E","#5A463B"], // "#E0AC69"
    _bloodColor: "#db0000",
    _eyeColor: "#fff",
    _pupileColor: "#000"
}

export const ZombieColors = {
    _outfitColor: ["#545943","#531F7C"],
    _skinColor: ["#308949"],
    _bloodColor: "#262",
    _eyeColor: "#fcc",
    _pupileColor: "#f00"
}



