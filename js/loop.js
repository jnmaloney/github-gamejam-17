// ---------------------------------------------------------------------------
// -        LOOP
// ---------------------------------------------------------------------------
var now,
    delta = 0.0,
    then = timestamp();
var frame = 0;
var frameTick = 0;
var interval = 1000.0 / 30.0;

var gameEngineState_intro = {
    enter: beginAppIntro,
    update: playAppIntro,
    draw: drawAppIntro,
    mouse: introMouse
};

var gameEngineState_select = {
    enter: beginSelect,
    update: playSelect,
    draw: drawSelect,
    mouse: mouseSelect
};

var gameEngineState_game = {
    enter: setup,
    update: gameState,
    draw: gameDraw,
    mouse: mouseGame
}

var gameEngineState = {};
function setState(state) {
    gameEngineState = state;
    gameEngineState.enter();       
}
setState(gameEngineState_intro);


function loop() {
    now = timestamp();
    delta += Math.min(1000, (now - then));
    while(delta > interval) {
        delta -= interval;
        gameEngineState.update(interval / 1000);
        if ((++frameTick)%4 == 0) ++frame;
    }

    //draw
    gameEngineState.draw();
    then = now;
    requestAnimationFrame(loop);
}
loop();


function gameState(dt) {
}


function gameDraw() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = "#bec6d5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    entityBatch.sort(function(a, b) {return a.ppy - b.ppy});

    drawLayer2(0, 0);
    drawLayer2(0, 1);
    drawLayer1(1);
    drawShade();
    cursorOverlay();
}

function drawShade() {
    drawShadeQtr(0, 0, 200, -100);
    drawShadeQtr(100, 0, 200, 200);
    drawShadeQtr(100, 100, -100, 200);
    drawShadeQtr(0, 100, -100, -100);
}

function drawShadeQtr(a, b, c, d) {
    var p0, p1, p2, p3;
    p0 = TileToScreen(a, b, stage_x, stage_y);
    p1 = TileToScreen(c, b, stage_x, stage_y);
    p2 = TileToScreen(c, d, stage_x, stage_y);   
    p3 = TileToScreen(a, d, stage_x, stage_y);
var x = 32;
    ctx.beginPath();
    ctx.moveTo(p0.x+x, p0.y);
    ctx.lineTo(p1.x+x, p1.y);
    ctx.lineTo(p2.x+x, p2.y);
    ctx.lineTo(p3.x+x, p3.y);
    ctx.closePath();
    ctx.fillStyle = 'black';
    ctx.fill();
}

function notUsed() {
     // Draw
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var srcX = 0, srcY = 0;
    var width = 64, height = 32;
    var x = 0, y = 0;
    var tx = canvas.width / width + 2;
    var ty = canvas.height / height + 2;
    var off_x = stage_x % width;// - width/2;
    var off_y = stage_y % height;
    var i_off = stage_x == 0 ? 0 : -Math.floor(Math.abs(stage_x / width)) * Math.abs(stage_x) / stage_x;
    var j_off = stage_y == 0 ? 0 : -Math.floor(Math.abs(stage_y / height)) * Math.abs(stage_y) / stage_y;
    off_x -= width;
    off_y -= height;
    for (var i = 0+i_off; i < tx+i_off; ++i) {
        for (var j = 0+j_off; j < ty+j_off; ++j) {
            x = off_x + (i-i_off) * width;
            y = off_y + (j-j_off) * height;
            //var t = (i ==1 && j == 2) ? 2 :
            //        ((j%2 == 0) && ((i+j)%3 == 0)) ? 0 :
            //        1;

            var rx = 1 + 2*4;
            var ry = 2 + 2*10;


            
            if (i + j == 1 && i-j < 0 && i > j - rx) {
		ctx.drawImage(tiles[5], srcX, srcY, width, height, x, y, width, height);
                ctx.drawImage(tiles[3], srcX, srcY, width, height, x, y, width, height);
                continue;
            }

            if (i - j == 0 && i+j > 0 && i+j < ry) {
		ctx.drawImage(tiles[4], srcX, srcY, width, height, x, y, width, height);
                ctx.drawImage(tiles[2], srcX, srcY, width, height, x, y, width, height);
                continue;
            }



            if (i + j - ry == -1 && i-j < 0 && i > j - rx) {
		ctx.drawImage(tiles[1], srcX, srcY, width, height, x, y, width, height);
                ctx.drawImage(tiles[7], srcX, srcY, width, height, x, y, width, height);
                continue;
            }

            if (i - j + rx == 1 && i+j > 0 && i+j < ry) {
		ctx.drawImage(tiles[0], srcX, srcY, width, height, x, y, width, height);
                ctx.drawImage(tiles[6], srcX, srcY, width, height, x, y, width, height);
                continue;
            }


            var t = Math.abs(i + j) % 2;
            if (i < j && i+j > 0 && i > j - rx && i+j < ry) t += 4;
	    var tile = tiles[t];
            ctx.drawImage(tile, srcX, srcY, width, height, x, y, width, height);
        }
    }
}


var placementMap = [];
function canPlace(i, j) {
    if (placementMap[i-1] == undefined) return 1;
    return placementMap[i-1][j+2];
}


function cursorOverlay1(i, j) {
    var p = canPlace(i, j);
    var ss = TileToScreen(i, j, stage_x, stage_y);
    var x0 = ss.x;
    var x1 = x0 + 32;
    var x2 = x1 + 32;
    var y0 = ss.y;
    var y1 = y0 + 16;
    var y2 = y1 + 16;

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#f0f";
    if (p == 0) ctx.fillStyle = "#0f0";
    if (p == 1) ctx.fillStyle = "#ff0";
    if (p == 2) ctx.fillStyle = "#f00";

    ctx.beginPath();
    ctx.moveTo(x0, y1);
    ctx.lineTo(x1, y0);
    ctx.lineTo(x2, y1);
    ctx.lineTo(x1, y2);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
}

var quickKeyMap  = {
    'a': 'Z',
    'b': 'X',
    'c': 'C',
    'd': 'V',
    'e': 'B',
} 

function cursorOverlay() {

    // building placement blocks
    if (place) {
        var tt = ScreenToTile(currX, currY);
        cursorOverlay1(tt.x, tt.y);
        cursorOverlay1(tt.x+1, tt.y);
        cursorOverlay1(tt.x, tt.y+1);
        cursorOverlay1(tt.x+1, tt.y+1);
    }

    // Cursor - building placement
    if (place) {
        var tt = ScreenToTile(currX, currY);
        var ss = TileToScreen(tt.x, tt.y, stage_x, stage_y);
        var x0 = ss.x;
        var x1 = x0 + 64;
        var x2 = x1 + 64;
        var y0 = ss.y;
        var y1 = y0 + 32;
        var y2 = y1 + 32;
        ctx.beginPath();
        ctx.moveTo(x0, y1);
        ctx.lineTo(x1, y0);
        ctx.lineTo(x2, y1);
        ctx.lineTo(x1, y2);
        ctx.closePath();
        ctx.stroke();
    }


    // Selected unit border highlight
    ctx.beginPath();

    for (var i = 0; i < selected.length; ++i) {
        var entity = selected[i];

        // Draw that box
        var x0 = entity.ppx + stage_x - 32;
        var x1 = x0 + 64;
        var x2 = x1 + 64;
        var y0 = entity.ppy + stage_y - 32;
        var y1 = y0 + 32;
        var y2 = y1 + 32;
        ctx.moveTo(x0, y1);
        ctx.lineTo(x1, y0);
        ctx.lineTo(x2, y1);
        ctx.lineTo(x1, y2);
        ctx.closePath();
    }
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#fffea2";
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#fdce76";
    ctx.stroke();
    
    // Entities
    for (var i = 0; i < entityBatch.length; ++i) {
        var entity = entityBatch[i];
        
        var tile = getEntityTile(entity);
        width = tile.w;
        height = tile.h;
        
        x = entity.ppx + stage_x + 0.5 * (TILE_WIDTH - width) - 3;
        y = entity.ppy + stage_y - height + TILE_DEPTH - 7;

        ctx.drawImage(
            tile.sheet, 
            tile.x, tile.y,
            tile.w, tile.h,
            x, y,
            width, height);
    }
    
    // Pathing
    updateMovePath();
    
    // Console
    var tt = ScreenToTile(currX, currY);
    ctx.fillText(tt.x + ', ' + tt.y, 25, 25);

    // HUD
    ctx.fillText('ice'+playerEconomy.ice + ',    pwr' + playerEconomy.power, canvas.width-125, 25);

    var y0 = 225;
    for (var i = 0; i < selected.length; ++i) {
        var entity = selected[i];
        var str = '';
        if (entity.name) str = entity.name;
        else str = entity;
        ctx.fillText(
            i+1 + '. ' + str, 
            canvas.width-125,
            y0);

        y0 += 25;

        if (entity.control) {
            for (var j in entity.control) {
                if (entity.control[j]) {
                str = entity.control[j][0];
                    ctx.fillText(
                        '[' + quickKeyMap[j] + ']  ' + str, 
                        canvas.width-125,
                        y0);
            
                    y0 += 25;
                }
            }
        }
    }

    // Minimap 

    // Resources

    // UI

    // Selection units
    if (selectionBox != undefined) {
        ctx.beginPath();
        ctx.moveTo(selectionBox.x0, selectionBox.y0);
        ctx.lineTo(selectionBox.x0, selectionBox.y1);
        ctx.lineTo(selectionBox.x1, selectionBox.y1);
        ctx.lineTo(selectionBox.x1, selectionBox.y0);
        ctx.closePath();

        ctx.lineWidth = 5;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        ctx.lineWidth = 3;
        ctx.strokeStyle = 'white';
        ctx.stroke();
    }


}


function getEntityTile(entity) {

    var retVal = {
        sheet: undefined,
        x: 0,
        y: 0,
        w: 0,
        h: 0,
    }

    if (entity.state == firing) {

        var i = frame % 16;
        if (i > 9) i -= 8; // HACK
        else if (i > 1) i += 6;

        retVal.sheet = framesBank[entity.faction][entity.unitName]['atk0'];
        retVal.x = i * 248 + 80;
        retVal.y = 308 * entity.dir + 159;
        retVal.w = 88;
        retVal.h = 108;

    } else {

        var i = frame % 4;

        console.log(entity);
        console.log(framesBank);

        retVal.sheet = framesBank[entity.faction][entity.unitName]['idle'];
        retVal.x = 88 * i;
        retVal.y = 108 * entity.dir;
        retVal.w = 88;
        retVal.h = 108;
    }

    console.log(retVal.sheet);

    return retVal;
}


function drawLayer1(layer) {
    
    if (map.layers) cells = map.layers[layer].data;
    
    // Draw
    var srcX = 0, srcY = 0;
    //var width = 48, height = 12;
    var width = 64, height = 32/2;
    var x = 0, y = 0;
    var tx = canvas.width / width + 4;
    var ty = canvas.height / height + 4;
    var off_x = stage_x % width;// - width/2;
    var off_y = stage_y % height;
    var i_off = stage_x == 0 ? 0 : -Math.floor(Math.abs(stage_x / width)) * Math.abs(stage_x) / stage_x;
    var j_off = stage_y == 0 ? 0 : -Math.floor(Math.abs(stage_y / height)) * Math.abs(stage_y) / stage_y;
    off_x -= width;
    off_y -= height;

    for (var j = 0+j_off-1; j < ty+j_off; ++j) {
        for (var i = 0+i_off-1; i < tx+i_off; ++i) {
            x = off_x + (i-i_off) * width;
            y = off_y + (j-j_off) * height;

            x += 32 * (j%2);

            // ?
            tt = ScreenToTile(x, y);            
                        
            //var tile = getMapTile(layer, tt.x, tt.y); 
            var tile = getMapTile(layer, tt.x, tt.y);      
            
            if (tile) {
                var x0 = x;
                var y0 = y;
                ctx.drawImage(tile.img, 
                    tile.ox, tile.oy, 
                    tile.tilewidth, tile.tileheight, 
                    x0, y0, 
                    tile.tilewidth, tile.tileheight);
            }
        }
    }
}

function drawLayer2(layer , v) {
    
    if (map.layers) cells = map.layers[layer].data;
    
    // Draw
    var srcX = 0, srcY = 0;
    //var width = 48, height = 12;
    var width = 64, height = 32;
    var x = 0, y = 0;
    var tx = canvas.width / width + 4;
    var ty = canvas.height / height + 4;
    var off_x = stage_x % width;// - width/2;
    var off_y = stage_y % height;
    var i_off = stage_x == 0 ? 0 : -Math.floor(Math.abs(stage_x / width)) * Math.abs(stage_x) / stage_x;
    var j_off = stage_y == 0 ? 0 : -Math.floor(Math.abs(stage_y / height)) * Math.abs(stage_y) / stage_y;
    off_x -= width;
    off_y -= height;

    for (var j = 0+j_off-1; j < ty+j_off; ++j) {
        for (var i = 0+i_off-1; i < tx+i_off; ++i) {
            x = off_x + (i-i_off) * width;
            y = off_y + (j-j_off) * height;

            x += 64 * (j%2);
            x += v;

            // ?
            // TILE_WIDTH = 64;
            // TILE_DEPTH = 32;
            tt = ScreenToTile(x, y);            
                        
            //var tile = getMapTile(layer, tt.x, tt.y); 
            var tile = getMapTile(layer, tt.x, tt.y);      
            
            if (tile) {
                var x0 = x + 32 + v  * 32;
                var y0 = y - 37 - v * 16;
                ctx.drawImage(tile.img, 
                    tile.ox, tile.oy, 
                    tile.tilewidth, tile.tileheight, 
                    x0, y0, 
                    tile.tilewidth, tile.tileheight);
            }
        }
    }
}


function getMapTile(layer, x, y) {


    if (map.layers) cells = map.layers[layer].data;

    var t = tcell(tt.x, tt.y);
        
    if (t == undefined) return undefined;
    if (t == 0) return undefined;


    var tile = {};

    // Type A
    for (var i = 0; i < tileList.length; ++i) {
        var ti = tileList[i];
        
        if (t >= ti.begin  && t < ti.end) {
            //console.log(ti);
            var n = t - ti.begin;
            var tilewidth = Math.floor(ti.imagewidth / ti.tilewidth);
            tile.img = ti.img;
            tile.ox = ti.tilewidth * (n % tilewidth);
            tile.oy = ti.tileheight * Math.floor(n / tilewidth);
            tile.tilewidth = ti.tilewidth;
            tile.tileheight = ti.tileheight;
            return tile;
        }
    }

    // Type B
    if (tiles[t]) {
        tile = {};
        tile.img = tiles[t];//tiles[t];
        tile.ox = 0;
        tile.oy = 0;
        tile.tilewidth = tiles[t].width;
        tile.tileheight = tiles[t].height;
        return tile;
    }

    return undefined;

}