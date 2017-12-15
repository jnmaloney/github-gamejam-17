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
