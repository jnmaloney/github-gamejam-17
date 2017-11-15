// ---------------------------------------------------------------------------
// -        UTILITIES
// ---------------------------------------------------------------------------
var scale = 4;
function keyboard(keyCode) {
    var key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = function(event) {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };
    
    //The `upHandler`
    key.upHandler = function(event) {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };
    
    //Attach event listeners
    window.addEventListener(
                            "keydown", key.downHandler.bind(key), false
                            );
    window.addEventListener(
                            "keyup", key.upHandler.bind(key), false
                            );
    return key;
}

function get(url, onsuccess) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if ((request.readyState == 4) && (request.status == 200))
            onsuccess(request);
    }
    request.open("GET", url, true);
    request.send();
}


function timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}


function bound(x, min, max) {
    return Math.max(min, Math.min(max, x));
}

var t2p      = function(t)     { return t*TILE;                  },
    p2t      = function(p)     { return Math.floor(p/TILE);      },
    cell     = function(x,y)   { return tcell(p2t(x),p2t(y));    },
    tcell    = function(tx,ty) { return cells[tx + (ty*MAP.tw)]; };

var TILE_WIDTH = 128;
var TILE_DEPTH = 64;
function TileToScreen(x, y, offsetX, offsetY)
{
    var screen = {};
    //calculate the screen coordinates
    //note: these will then be modified by the camera
    screen.x = offsetX - (y * TILE_WIDTH/2) + (x * TILE_WIDTH/2) - (TILE_WIDTH/2);
    screen.y = offsetY + (y * TILE_DEPTH/2) + (x * TILE_DEPTH/2);
    return screen;
 }

function ScreenToTile(mX, mY)
{
    var selectedTile = {};
    var x = mX - stage_x;
    var y = mY - stage_y;
    selectedTile.x = Math.floor( (y + x/2)/TILE_DEPTH );
    selectedTile.y = Math.floor( (y - x/2)/TILE_DEPTH );
    return selectedTile;
 }

// ---------------------------------------------------------------------------
// -        Create the renderer
// ---------------------------------------------------------------------------
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

// ---------------------------------------------------------------------------
// -        Setup
// ---------------------------------------------------------------------------
var map = [];
var tile1 = new Image();
var tile2 = new Image();
var tile3 = new Image();
var tiles = [tile1, tile2, tile3];
setup();

function setup() {
    tile1.src = "img/Seaf.png";
    tile2.src = "img/Seag.png";
    tile3.src = "img/Sea.png";

    canvas.width = window.innerWidth;//document.body.clientWidth; //document.width is obsolete
    canvas.height = window.innerHeight; //document.body.clientHeight; //document.height is obsolete

    loop();
}

// ---------------------------------------------------------------------------
// -        Restart
// ---------------------------------------------------------------------------
function restart() {

}

// ---------------------------------------------------------------------------
// -        Char controls
// ---------------------------------------------------------------------------
var place = 0;
var left = keyboard(37),
    up = keyboard(38),
    right = keyboard(39),
    down = keyboard(40),
    abutton = keyboard(0x5A),
    bbutton = keyboard(0x58),
        cbutton = keyboard(0x43),
        dbutton = keyboard(0x56),
        ebutton = keyboard(0x42),
        fbutton = keyboard(0x4E),
    gbutton = keyboard(0x4D);
left.press = function() {
};

left.release = function() {
};

right.press = function() {
}

right.release = function() {
}
up.press = function() {
};
up.release = function() {
}
down.press = function() {
};
down.release = function() {
    player.duck = 0;
}
abutton.press = function() {
    place = 1;
}
abutton.release = function() {
}
bbutton.press = function() {
    place = 2;
}
cbutton.press = function() {
    place = 3;
}
dbutton.press = function() {
    place = 4;
}
ebutton.press = function() {
    place = 5;
}
fbutton.press = function() {
    place = 6;
}
gbutton.press = function() {
    place = 7;
}

var flag = false,
        prevX = 0,
        currX = 0,
        prevY = 0,
        currY = 0,
        dot_flag = false;

var stage_x = 0, stage_y = 0;

canvas.addEventListener("mousemove", function (e) {
            findxy('move', e)
        }, false);
canvas.addEventListener("mousedown", function (e) {
            findxy('down', e)
        }, false);
canvas.addEventListener("mouseup", function (e) {
            findxy('up', e)
        }, false);
canvas.addEventListener("mouseout", function (e) {
            findxy('out', e)
        }, false);
function findxy(res, e) {
        if (res == 'down') {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;

            if (place) {
                createEntity(place, currX, currY);
                place = 0;
            } else {
                flag = true;
                dot_flag = true;
                if (dot_flag) {
                    dot_flag = false;
                }
            }
        }
        if (res == 'up' || res == "out") {
            flag = false;
        }
        if (res == 'move') {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
             if (flag) {
                stage_x += (currX - prevX);
                stage_y += (currY - prevY);
            }
        }
    }


// ---------------------------------------------------------------------------
// -        BUILD
// ---------------------------------------------------------------------------
var buildNames = ['City', 'Factory', 'Airport', 'Dock', 'Laboratory', 'Castle', 'Estate'];
var colourName = '1';
var entityBatch = [];
function createEntity(t, x, y) {
    var tt = ScreenToTile(x, y);
    var ss = TileToScreen(tt.x, tt.y, 0, 0);
    entity = new Image();
    //entity.src = "img/Sea.png";//
    //entity.src = "img/Revised_PixVoxel_Wargame/standing_frames/color7_City_Large_face0_0.png";.
    entity.src = "img/Revised_PixVoxel_Wargame/standing_frames/color"+colourName+"_"+buildNames[t-1]+"_Large_face0_0.png";
    entity.ppx = ss.x + 0.5 * (TILE_WIDTH - entity.width);
    entity.ppy = ss.y - entity.height + TILE_DEPTH;
    entityBatch.push(entity);
}

// ---------------------------------------------------------------------------
// -        LOOP
// ---------------------------------------------------------------------------
var now,
    delta = 0.0,
    then = timestamp();
var interval = 1000.0 / 60.0;
function loop() {
    now = timestamp();
    delta += Math.min(1000, (now - then));
    while(delta > interval) {
        delta -= interval;
        gameState(interval / 1000);
    }
    //draw
    then = now;
    requestAnimationFrame(loop);
}
function gameState(dt) {
    // Draw
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var srcX = 0, srcY = 0;
    var width = 128, height = 64;
    var x = 0, y = 0;
    var tx = canvas.width / width + 2;
    var ty = canvas.height / height + 2;
    var off_x = stage_x % width - 64;
    var off_y = stage_y % height;
    var i_off = stage_x == 0 ? 0 : -Math.floor(Math.abs(stage_x / width)) * Math.abs(stage_x) / stage_x;
    var j_off = stage_y == 0 ? 0 : -Math.floor(Math.abs(stage_y / height)) * Math.abs(stage_y) / stage_y;
    off_x -= width;
    off_y -= height;
    for (var i = 0+i_off; i < tx+i_off; ++i) {
        for (var j = 0+j_off; j < ty+j_off; ++j) {
            x = off_x + (i-i_off) * width;
            y = off_y + (j-j_off) * height;
            var t = (i ==1 && j == 2) ? 2 :
                    ((j%2 == 0) && ((i+j)%3 == 0)) ? 0 :
                    1;
            var tile = tiles[t];
            ctx.drawImage(tile, srcX, srcY, width, height, x, y, width, height);
        }
    }

    // Cursor
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

    // Entities
    for (var i = 0; i < entityBatch.length; ++i) {
        var entity = entityBatch[i];
        x = entity.ppx + stage_x;
        y = entity.ppy + stage_y;
        width = 248;
        height = 308;
        var tile = entity;
        ctx.drawImage(tile, srcX, srcY, width, height, x, y, width, height);
    }
}

// ---------------------------------------------------------------------------
// -        LOAD THE MAP
// ---------------------------------------------------------------------------
function setup2(map) {
    var data    = map.layers[0].data,
        objects = map.layers[1].objects,
        n, obj, entity;

    MAP.th = map.height;
    MAP.tw = map.width;
    
    for(n = 0 ; n < objects.length ; n++) {
        obj = objects[n];   
        switch(obj.type) {
        case "player"   : {entity = setupEntity(obj)}; break;
        }
    }
}

// ---------------------------------------------------------------------------
// -        Game Entity
// ---------------------------------------------------------------------------
function setupEntity(obj) {
    var entity = {};
    entity.x        = obj.x;
    entity.y        = obj.y;
    return entity;
}
