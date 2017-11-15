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
    var entityFrames = [];
    for (var i = 0; i < 4; ++i) {
        entity = new Image();
        entity.src = "img/Revised_PixVoxel_Wargame/standing_frames/color"+colourName+"_"+buildNames[t-1]+"_Large_face0_"+i+".png";
        entity.ppx = ss.x + 0.5 * (TILE_WIDTH - entity.width);
        entity.ppy = ss.y - entity.height + TILE_DEPTH;
        entityFrames.push(entity);
    }
    entityBatch.push(entityFrames);
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
