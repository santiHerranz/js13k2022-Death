import { TILESIZE } from "../configuration";
import { PI } from "../core/utils";
import { shadeColor } from "./BaseTile";


export const TileType = {
  _TRANSPARENT: 0,
  _BASE: 1,
  _XTILE: 2,
  _HOLE: 3,
}

export var createTiles = (colors: string[]) => {

  var c = document.createElement("canvas");
  var ctx = c.getContext("2d");

  ctx.imageSmoothingEnabled = true;

  var total = 60; // limited tile height, small image

  c.width = (TILESIZE.x + 1) * colors.length;
  c.height = TILESIZE.y * total + (total * (total + 1)) / 2;

  for (var j = 0; j < colors.length; j++) {
    var color = colors[j];
    var x = j * (TILESIZE.x + 1) + (TILESIZE.x + 1) / 2;
    for (var i = 0; i < total; i++) {
      var h = i;
      var y = TILESIZE.y * i + (i * (i + 1)) / 2;

      drawTile(ctx, x, y, h, color, j == TileType._XTILE); // , (j == 1 || j == 4)

    }
  }
  return c;
};




// draw tile
var drawTile = (ctx: CanvasRenderingContext2D, x, y, h, color, ropeShadow = false) => { //, decoration = false
  var wx = TILESIZE.x / 2;
  var wy = TILESIZE.x / 2;

  // diag distance
  var dDist = wx * 0.5 + wy * 0.5;

  ctx.s();

  // left side / x axis
  ctx.bp();
  ctx.mt(x, y + dDist); // tr
  ctx.lt(x - wx, y + dDist - wx * 0.5); // tl
  ctx.lt(x - wx, y + dDist - h - wx * 0.5); // bl
  ctx.lt(x, y + dDist - h * 1); // br
  ctx.cp();
  ctx.fs(shadeColor(color, -2))
  ctx.ss(shadeColor(color, -50)) //darker
  ctx.stroke();
  ctx.fill();

  // right side / y axis
  ctx.bp();
  ctx.mt(x, y + dDist); // tl
  ctx.lt(x + wy, y + dDist - wy * 0.5); // tr
  ctx.lt(x + wy, y + dDist - h - wy * 0.5); // br
  ctx.lt(x, y + dDist - h * 1); // bl
  ctx.cp();
  ctx.fs(shadeColor(color, 5))
  ctx.ss(shadeColor(color, 50)) //lighter
  ctx.stroke();
  ctx.fill();

  // top
  ctx.bp();
  ctx.mt(x, y - h); // top
  ctx.lt(x - wx, y - h + wx * 0.5); // left
  ctx.lt(x - wx + wy, y - h + dDist); // bottom
  ctx.lt(x + wy, y - h + wy * 0.5); // right
  ctx.cp();
  ctx.fs(shadeColor(color, -2))
  ctx.ss(shadeColor(color, -50)) //darker

  ctx.stroke();
  ctx.fill();

  // rope shadow
  if (ropeShadow) {
    ctx.fs("#000")
    ctx.bp();
    ctx.ellipse(x, y - h + wy * 0.5, 4, 2, 0, 0, PI * 2)
    ctx.cp();
    ctx.fill()
  }  

  // add some decorations
  // if (decoration) {
    // ctx.bp();
    // ctx.mt(x, y - h +5); // top
    // ctx.lt(x+10 - wx, y - h + wx * 0.5); // left
    // ctx.lt(x - wx + wy, y - h + dDist-5); // bottom
    // ctx.lt(x-10 + wy, y - h + wy * 0.5); // right
    // ctx.cp();
    // ctx.fs(shadeColor(color, -2))
    // ctx.ss(shadeColor(color, -50)) //darker

    // ctx.stroke();
    // ctx.fill();
  // }



  ctx.r();
};
