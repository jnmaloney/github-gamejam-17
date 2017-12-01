// ---------------------------------------------------------------------------
// -        Setup
// ---------------------------------------------------------------------------
var map = [];
// var tile1 = new Image();
// var tile2 = new Image();
// var tile3 = new Image();
// var tiles = [tile1, tile2, tile3, new Image(),
// new Image(), new Image(), new Image(), new Image()];
tiles = [];

function setup() {
    //tile1.src = "maps/snowplains_tileset.png";
    // tile1.src = "img/terrain/Tundra_ta.png";
    // tile2.src = "img/terrain/Tundra_tb.png";
    // tile3.src = "img/terrain/Tundra_ta0.png";
    // tiles[3].src = "img/terrain/Tundra_tb0.png";

    // tiles[4].src = "img/terrain/Tundra_ta (copy).png";
    // tiles[5].src = "img/terrain/Tundra_tb (copy).png";
    // tiles[6].src = "img/terrain/Tundra_ta0 (copy).png";
    // tiles[7].src = "img/terrain/Tundra_tb0 (copy).png";

    canvas.width = window.innerWidth;//document.body.clientWidth; //document.width is obsolete
    canvas.height = window.innerHeight; //document.body.clientHeight; //document.height is obsolete

    //loop();

    get('maps/snowplains_other.json', function(req) {
        loadTileset(JSON.parse(req.responseText), 513);
    });
    get('maps/SnowTile.json', function(req) {
        loadTileset(JSON.parse(req.responseText), 1);
    });
    get('maps/Border Tiles.json', function(req) {
        loadTileset(JSON.parse(req.responseText), 1409);
    });


    var src = 'maps/new_map.json';
    get(src, function(req) {
            loadMap(JSON.parse(req.responseText));
        });

    // Create base
    TILE_WIDTH = 64;
    TILE_DEPTH = 32;
    var ss = TileToScreen(185, 74, stage_x, stage_y);
    createEntity(1, ss.x, ss.y);
    ss = TileToScreen(185, 78, stage_x, stage_y);
    createHarvester(ss.x, ss.y);
    ss = TileToScreen(187, 78, stage_x, stage_y);
    createHarvester(ss.x, ss.y);

    ss = TileToScreen(185, 76, stage_x, stage_y);
    createEntity(6, ss.x, ss.y);
    stage_x = -ss.x + 0.5 * canvas.width;
    stage_y = -ss.y + 0.5 * canvas.height;


}


// ---------------------------------------------------------------------------
// -        Map Loading
// ---------------------------------------------------------------------------
var cells = [];
var MAP = {};
var tileList = [];
function loadMap(mapJson) {

    map = mapJson;

    var data    = map.layers[0].data,
        objects = map.layers[1].objects,
        n, obj, entity;

    MAP.th = map.height;
    MAP.tw = map.width;
}


function loadTileset(response, offset) {
    console.log(response);

    var standing_prefix = 'maps/';

    if (response.tiles) {
        var tileSrc = response.tiles;

        for (var key in tileSrc) {
            var img = new Image();
            var src = response.tiles[key].image;
            console.log(src);
            img.src = src;
            tiles[Math.floor(key)+offset] = img;
            console.log(Math.floor(key)+offset);
        }
    } 

    if (response.image) {
        var imgTile = {};
        imgTile.img = new Image();
        imgTile.img.src = standing_prefix + response.image;
        
        console.log( imgTile.img.src);
        
        imgTile.begin = offset;
        imgTile.end = offset + response.tilecount;
        imgTile.tilewidth = response.tilewidth;
        imgTile.tileheight = response.tileheight;
        imgTile.imagewidth = response.imagewidth;
        imgTile.imageheight = response.imageheight;

        tileList.push(imgTile);
    }
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
control = {};
gbutton.press = function() {
    //place = 7;
	control.move = true;
}

var flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    clickX = 0, clickY = 0,
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
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;
    gameEngineState.mouse(res, e);
}

function mouseGame(res, e) {
    if (res == 'down') {
        prevX = clickX;
        prevY = clickY;
        clickX = currX;
        clickY = currY;

        if (control.move) {
            moveCommand(currX, currY);
        } else if (place) {
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
        prevX = clickX;
        prevY = clickY;
        clickX = currX;
        clickY = currY;
        if (flag) {
            stage_x += (clickX - prevX);
            stage_y += (clickY - prevY);
        }
    }
}


// ---------------------------------------------------------------------------
// -        MOVE COMMAND
// ---------------------------------------------------------------------------
var selected = [];
var dir_i = 100, dir_j = 100;
function moveCommand(sx, sy) {
    control.move = false;
    
    var tt = ScreenToTile(sx, sy);

    var dx = 0;
    var dy = 0;

    for (var k = 0; k < selected.length; ++k) {
    
        var z = Math.floor(Math.sqrt(selected.length) + 1);
        var o_x = k % z;
        var o_y = Math.floor(k / z);
    
        for (var i = 0; i < dir_i; ++i) {
            for (var j = 0; j < dir_j; ++j) {
                dx = 0; dy = 0;
                if (i+o_x > tt.x) { dx += -1; dy += -1; }
                else if (i+o_x < tt.x) { dx += 1; dy += 1; }
                if (j+o_y > tt.y) { dx += 1; dy += -1; }
                else if (j+o_y < tt.y) { dx += -1; dy += 1; }
                selected[k].dir_space[i][j].x = dx;
                selected[k].dir_space[i][j].y = dy;
            }
        }
    }
}

function updateMovePath()    
{
    //var ss = TileToScreen(tt.x, tt.y, 0, 0);
    
    for (var i = 0; i < selected.length; ++i) {
        var x = selected[i].ppx;
        var y = selected[i].ppy;
        
        var width = 100;
        var height = 100;
        var tt = ScreenToTile(x + stage_x + 0.5 * (TILE_WIDTH + width) - 3 - 0.5*width, 
                              y + stage_y - height + TILE_DEPTH - 7 + height - 20);
                 
        //ctx.beginPath();                      
        //ctx.moveTo(x + stage_x + 0.5 * (TILE_WIDTH + entity.img.width) - 3 - 0.5*entity.img.width, 
        //                      y + stage_y - entity.img.height + TILE_DEPTH - 7 + entity.img.height - 20);
        //                      ctx.lineTo(0, 0);
        //ctx.stroke();
        //console.log(x);
        //console.log(y);
        //console.log(tt);

        //if (!selected[i].dir_space) continue;
        //if (!selected[i].dir_space[tt.x]) continue;
        continue;
        
        var ds = selected[i].dir_space[tt.x][tt.y];
        //console.log(ds);
        
        // cursor?
        {
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
        
        var newx = x + 2 * ds.x;
        var newy = y + ds.y;
        
        //for (var j = 0; j < selected[i].length; ++j) { // dumb
            selected[i].ppx = newx;
            selected[i].ppy = newy;
        //}
        
        // dir
        
        if (ds.y > 0) {
            if (ds.x > 0) selected[i].dir = 0;
            if (ds.x < 0) selected[i].dir = 1;
        } else {
            if (ds.x > 0) selected[i].dir = 3;
            if (ds.x < 0) selected[i].dir = 2;
        }
        //if (ds.y > 0) selected[i].dir = 0;
        //if (ds.y < 0) selected[i].dir = 3;
        
        // hack
        if (ds.x == 0 && ds.y == 0) {
            var ss = TileToScreen(tt.x, tt.y, stage_x, stage_y);
            //for (var j = 0; j < selected[i].length; ++j) { // dumb
                selected[i].ppx = ss.x - stage_x;
                selected[i].ppy = ss.y - stage_y;
            //}
        }
    }
}

// ---------------------------------------------------------------------------
// -        BUILD
// ---------------------------------------------------------------------------
var buildNames = ['City', 'Factory', 'Airport', 'Supply_S', 'Laboratory', 'Castle', 'Estate'];
var colourName = '1';
var entityBatch = [];
var standing_prefix = "img/";//Revised_PixVoxel_Wargame/standing_frames";

function createHarvester(x, y) {
    var tt = ScreenToTile(x, y);
    var ss = TileToScreen(tt.x, tt.y, 0, 0);

    entity = {};
    entity.ppx = ss.x;// + 0.5 * (TILE_WIDTH - entity.img.width);
    entity.ppy = ss.y;// - entity.img.height + TILE_DEPTH;
    entity.dir = 0;
            
    var entityFacing = [];    
    for (var dir = 0; dir < 4; ++ dir) {
        var entityFrames = [];

        standing_prefix = "_img/";

        for (var i = 0; i < 4; ++i) {

            var img = new Image();
            colourName = select.faction;
            img.src = standing_prefix + "color"+colourName+"/"+"Supply_S"+"_Large_face"+dir+"_"+i+".png";

            entityFrames.push(img);
        }
        entityFacing.push(entityFrames);
    }
    entity.frames = entityFacing;

    entityBatch.push(entity);

    entity.dir = Math.floor(Math.random() * 4);
    
    selected.push(entity);
    
    // The map
    entity.dir_space = [];
    for (var i = 0; i < dir_i; ++i) {
        entity.dir_space.push([]);
        for (var j = 0; j < dir_j; ++j) {
            entity.dir_space[i].push( {
                x: 0,
                y: 0,
            });
        }
    }
}


function createEntity(t, x, y) {
    var tt = ScreenToTile(x, y);
    var ss = TileToScreen(tt.x, tt.y, 0, 0);

    entity = {};
    entity.ppx = ss.x;// + 0.5 * (TILE_WIDTH - entity.img.width);
    entity.ppy = ss.y;// - entity.img.height + TILE_DEPTH;
    entity.dir = 0;
            
    var entityFacing = [];    
    for (var dir = 0; dir < 4; ++ dir) {
        var entityFrames = [];

        standing_prefix = "_img/";

        for (var i = 0; i < 4; ++i) {

            var img = new Image();
            colourName = select.faction;
            img.src = standing_prefix + "color"+colourName+"/"+buildNames[t-1]+"_Large_face"+dir+"_"+i+".png";

            entityFrames.push(img);
        }
        entityFacing.push(entityFrames);
    }
    entity.frames = entityFacing;

    entityBatch.push(entity);
    
    // if (t-1 == 3) { //buildNames[t-1] == 'Supply_S') {
    //     selected.push(entity);
    // }
    
    // The map
    entity.dir_space = [];
    for (var i = 0; i < dir_i; ++i) {
        entity.dir_space.push([]);
        for (var j = 0; j < dir_j; ++j) {
            entity.dir_space[i].push( {
                x: 0,
                y: 0,
            });
        }
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
function xx_setupEntity(obj) {
    var entity = {};
    entity.x        = obj.x;
    entity.y        = obj.y;
    return entity;
}
