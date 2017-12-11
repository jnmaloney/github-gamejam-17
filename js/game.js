// ---------------------------------------------------------------------------
// -        Setup
// ---------------------------------------------------------------------------
var map = [];
tiles = [];

function setup() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight; 

    // Load tilesets
    get('maps/snowplains_other_min.json', function(req) {
        loadTileset(JSON.parse(req.responseText), 817);
    });
    get('maps/SnowTile.json', function(req) {
        loadTileset(JSON.parse(req.responseText), 1);
    });
    get('maps/Border Tiles.json', function(req) {
        loadTileset(JSON.parse(req.responseText), 1409);
    });
    get('maps/Cracks.json', function(req) {
        loadTileset(JSON.parse(req.responseText), 1411);
    });

    var enemy_faction = select.faction ? 0 : 2;
    
    loadFramesBank(select.faction, 'bldg', false, false);
    loadFramesBank(enemy_faction, 'bldg', false, false);

    loadFramesBank(select.faction, 'Supply_S', false, false);
    loadFramesBank(select.faction, 'Infantry_S', true, false);
    loadFramesBank(select.faction, 'Tank_S', true, false);
    
    loadFramesBank(enemy_faction, 'Supply_S', false, false);
    loadFramesBank(enemy_faction, 'Infantry_S', true, false);
    loadFramesBank(enemy_faction, 'Tank_S', true, false);
    
    var factions = [select.faction, enemy_faction];
    for (var i in factions) {
        for (var j in buildNames) {
            loadFramesBank(factions[i], buildNames[j]);
        }
    }
    

    var src = 'maps/new_map.json';
    get(src, function(req) {
            loadMap(JSON.parse(req.responseText));

            //  little load hack
            for (var i = 0; i < MAP.tw; ++i) {
                for (var j = 0; j < MAP.th; ++j) {
                    if (map.layers[0].data[i + (j*MAP.tw)] > 0) { // ?
                        setPlacementMap(i, j, 0);
                        setPlacementMap(i+1, j, 0);
                        setPlacementMap(i, j+1, 0);
                        setPlacementMap(i+1, j+1, 0);
                    }
                }
            }

            // Create base
            TILE_WIDTH = 64;
            TILE_DEPTH = 32;
            var ss = TileToScreen(84, 74, stage_x, stage_y);
            createEntity(1, ss.x, ss.y, select.faction);
            ss = TileToScreen(84, 76, stage_x, stage_y);
            createEntity(6, ss.x, ss.y, select.faction);

            stage_x = -ss.x + 0.5 * canvas.width;
            stage_y = -ss.y + 0.5 * canvas.height;

            ss = TileToScreen(84, 79, stage_x, stage_y);
            createHarvester(ss.x, ss.y, select.faction);
            ss = TileToScreen(87, 79, stage_x, stage_y);
            createHarvester(ss.x, ss.y, select.faction);
            ss = TileToScreen(79, 82, stage_x, stage_y);
            createAttackUnit(ss.x, ss.y, 'Infantry_S', select.faction);
            ss = TileToScreen(89, 82, stage_x, stage_y);
            createAttackUnit(ss.x, ss.y, 'Tank_S', select.faction);

            // TEST
            // Create Enemy Base
            ss = TileToScreen(47, 70, stage_x, stage_y);
            createEntity(1, ss.x, ss.y, enemy_faction);

        });

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
    //console.log(response);

    var standing_prefix = 'maps/';

    if (response.tiles) {
        var tileSrc = response.tiles;

        for (var key in tileSrc) {
            var img = new Image();
            var src = response.tiles[key].image;
            img.src = src;
            tiles[Math.floor(key)+offset] = img;
            //console.log(Math.floor(key)+offset);
        }
    } 

    if (response.image) {
        var imgTile = {};
        imgTile.img = new Image();
        imgTile.img.src = standing_prefix + response.image;
                
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
    //tryBuild(0);
    doSelectionCommand('a');
}
abutton.release = function() {
}
bbutton.press = function() {
    //tryBuild(1);
    doSelectionCommand('b');
}
cbutton.press = function() {
    //tryBuild(2);
    doSelectionCommand('c');
}
dbutton.press = function() {
    //tryBuild(3);
    doSelectionCommand('d');
}
ebutton.press = function() {
    //tryBuild(4);
    doSelectionCommand('e');
}

function doSelectionCommand(key)
{
    for (var i in selected)
        if (selected[i].control && selected[i].control[key])
            selected[i].control[key][1]();
}
fbutton.press = function() {
}
control = {};
gbutton.press = function() {
    tryCommandMove();
}

var cursors = {
    move: 'crosshair'
};
function tryCommandMove() {
    if (canCommandMove()) {
        control.move = true;
        canvas.style.cursor = cursors.move;
    }
}

function canCommandMove() {
    for (var i = 0; i < entityBatch.length; ++i) {
        if (entityBatch[i].update) return true;
    }
    return false;
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
canvas.addEventListener('contextmenu', event => event.preventDefault());
function findxy(res, e) {
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;
    gameEngineState.mouse(res, e);
}

var selectionBox = undefined;
function mouseGame(res, e) {
    // Left Click
    if (e.buttons == 1) {
        var x = currX;
        var y = currY;
        //if (selectionBox == undefined) {
        if (res == 'down') {
            if (control.move) {
                moveCommand(currX, currY);
            } else if (place) {
                createEntity(place, currX, currY, select.faction);
                place = 0;
            } else {
                selectionBox = { x0: x, y0: y, x1: x, y1: y };
            }
        }
        if (res == 'move' && selectionBox) {
            selectionBox.x1 = x;
            selectionBox.y1 = y;
            //doSelection(selectionBox);
        } 
    }

    if (res == 'up' || res == "out") {
        flag = false;
        if (selectionBox) { 
            doSelection(selectionBox);
            selectionBox = undefined;
        }
    }

    // Right Click - Camera Pan
    if (e.buttons == 2) {
        if (res == 'down') {
            prevX = clickX;
            prevY = clickY;
            clickX = currX;
            clickY = currY;

            flag = true;
            dot_flag = true;
            if (dot_flag) {
                dot_flag = false;
            }
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
}

// ---------------------------------------------------------------------------
// -        SELECT CLICK
// --------------------------------------------------------------------------
function doSelection(selectBox) {
    
    var r1 = [
        0.5 * Math.abs(selectBox.x1 - selectBox.x0)+1,
        0.5 * Math.abs(selectBox.y1 - selectBox.y0)+1 ];

    var c1 = [
        0.5 * (selectBox.x1 + selectBox.x0),
        0.5 * (selectBox.y1 + selectBox.y0) 
    ];    

    selected = [];

    for (var i = 0; i < entityBatch.length; ++i) {
        var entity = entityBatch[i];
        if (entity.faction != select.faction) continue;
        var r0 = [32, 16];
        var c0 = [entity.ppx + stage_x + 32, entity.ppy + stage_y];
        if (testAABBAABB({c:c0, r:r0}, {c:c1, r:r1})) {
            selected.push(entity);
            if (selectBox.x0 == selectBox.x1 && selectBox.y0 == selectBox.y1) break; // click to pick
        }
    }

    // Clean up
    for (var i = 0; i < selected.length; ++i) {
        if (selected[i].canMove) {
            // Remove entities without canMove
            for (var j = 0; j < selected.length; ) {
                if (selected[j].canMove) ++j
                else selected.splice(j, 1);
            }
            break;
        }
    }
}

function testAABBAABB(a, b) {
    // SIMD optimized AABB-AABB test
    // Optimized by removing conditional branches
    // c->centre, r->halfwidth
    var x = Math.abs(a.c[0] - b.c[0]) <= (a.r[0] + b.r[0]);
    var y = Math.abs(a.c[1] - b.c[1]) <= (a.r[1] + b.r[1]);
    return x && y;
}

function ccw(A,B,C) {
    return (C.y-A.y)*(B.x-A.x) > (B.y-A.y)*(C.x-A.x);
}

function intersect(A,B,C,D) {
    return ccw(A,C,D) != ccw(B,C,D) && ccw(A,B,C) != ccw(A,B,D);
}

function selectClick_unused(x0, y0, x1, y1) {
    selected = [];

    // rect collide every entity
    for (var i = 0; i < entityBatch.length; ++i) {
        var entity = entityBatch[i];

        if (entity.ppx > x0 - 16 &&
            entity.ppx < x1 + 16 &&
            entity.ppy < y0 - 16 &&
            entity.ppy > y1 + 16 ) {
                selected.push(entity);
                
            }
    }

    // Clean up
    for (var i in selected) {
        if (selected.canMove) {
            // Remove entities without canMove
            for (var j = 0; j < selected.length; ) {
                if (selected[j].canMove) ++j
                else selected.splice(j, 1);
            }
            break;
        }
    }
}

// ---------------------------------------------------------------------------
// -        BUILD COMMAND
// --------------------------------------------------------------------------
var barracks = [200, 200, ""];
var factory = [300, 400, ""];
var airport = [400, 300, ""];
var techlab = [400, 400, ""];
var power = [0, 0, ""];
var build_costs = [barracks, factory, airport, techlab, power];

function tryBuild(t) {
    // Check resources
    var power = build_costs[t][0];
    var ice = build_costs[t][1];
    var availablePower = playerEconomy.power;
    var availableIce = playerEconomy.ice;
    if (availablePower < power) return;
    if (availableIce < ice) return;
    
    // Go into building place mode
    place = t+1;
}

// ---------------------------------------------------------------------------
// -        MOVE COMMAND
// --------------------------------------------------------------------------
var selected = [];
var dir_i = 100, dir_j = 100;
function moveCommand(sx, sy) {
    control.move = false;
    canvas.style.cursor = '';
    
    var tt = ScreenToTile(sx, sy);

    var dx = 0;
    var dy = 0;

    for (var k = 0; k < selected.length; ++k) {
    
        selected[k].target = { x: sx - stage_x, y: sy - stage_y };

    }
}


function updateMovePath() {
    for (var i = 0; i < entityBatch.length; ++i) {
        var entity = entityBatch[i];
        if (entity.update) entity.update(entity);
        
        if (!entity.canMove) continue;
        if (entity.target) {
            entity.dx = 0;
            entity.dy = 0;

            // Hone in on target
            if (entity.ppx <= entity.target.x - 1) entity.dx += 1;
            else if (entity.ppx >= entity.target.x + 1) entity.dx -= 1;
            else { entity.ppx = entity.target.x; entity.dx = 0; }

            if (entity.ppy < entity.target.y - 1) entity.dy += 1;
            else if (entity.ppy > entity.target.y + 1) entity.dy -= 1;
            else { entity.ppy = entity.target.y; entity.dy = 0; }

            entity.dxss = 2 * entity.speed * entity.dx;
            entity.dyss = entity.speed * entity.dy;

            // Check for other entity collisions
            var brake = false;
            for (var j = 0; j < entityBatch.length; ++j) {
                if (i == j) continue;
                var otherEntity = entityBatch[j];
                var a = { 
                    c: [entity.ppx + entity.dxss, entity.ppy + entity.dyss], 
                    r: [20, 10] };
                var b = { 
                    c: [otherEntity.ppx, otherEntity.ppy], 
                    r: [20, 10] };
                var test = testAABBAABB(a, b);
                if (test) {
                    brake = true;
                    break;
                }
            }
            if (brake) {
                // check cancel brake
                for (var j = 0; j < entityBatch.length; ++j) {
                    if (i == j) continue;
                    var otherEntity = entityBatch[j];
                    if (otherEntity.canMove) continue;
                    var a = { 
                        c: [entity.ppx, entity.ppy], 
                        r: [20, 10] };
                    var b = { 
                        c: [otherEntity.ppx, otherEntity.ppy], 
                        r: [20, 10] };
                    var test = testAABBAABB(a, b);
                    if (test) {
                        brake = false;
                        break;
                    }
                }
            }
            if (brake) { // dx
                brake = false;
                for (var j = 0; j < entityBatch.length; ++j) {
                    if (i == j) continue;
                    var otherEntity = entityBatch[j];
                    var a = { 
                        c: [entity.ppx, entity.ppy + entity.dyss], 
                        r: [20, 10] };
                    var b = { 
                        c: [otherEntity.ppx, otherEntity.ppy], 
                        r: [20, 10] };
                    var test = testAABBAABB(a, b);
                    if (test) {
                        brake = true;
                        break;
                    }
                }
                if (!brake) entity.dx = 0;
                else { // dy
                    brake = false;
                    for (var j = 0; j < entityBatch.length; ++j) {
                        if (i == j) continue;
                        var otherEntity = entityBatch[j];
                        var a = { 
                            c: [entity.ppx + entity.dxss, entity.ppy], 
                            r: [20, 10] };
                        var b = { 
                            c: [otherEntity.ppx, otherEntity.ppy], 
                            r: [20, 10] };
                        var test = testAABBAABB(a, b);
                        if (test) {
                            brake = true;
                            break;
                        }
                    }
                    if (!brake) entity.dy = 0;
                    else { entity.dx = 0; entity.dy = 0; } // neither
                }
            }

            entity.dxss = 2 * entity.speed * entity.dx;
            entity.dyss = entity.speed * entity.dy;

            // Adjust facing sprite
            if (entity.dy == 1 && entity.dx == 1) entity.dir = 0;
            if (entity.dy == 1 && entity.dx == 0) entity.dir = 1;
            if (entity.dy == 1 && entity.dx == -1) entity.dir = 1;
            if (entity.dy == -1 && entity.dx == 1) entity.dir = 3;
            if (entity.dy == -1 && entity.dx == 0) entity.dir = 3;
            if (entity.dy == -1 && entity.dx == -1) entity.dir = 2;
            if (entity.dy == 0 && entity.dx == 1) entity.dir = 0;
            if (entity.dy == 0 && entity.dx == -1) entity.dir = 2;

            // Apply map direction
            if (Math.abs(entity.ppx - entity.target.x) < entity.dxss) entity.ppx = entity.target.x;
            else entity.ppx += entity.dxss;
            if (Math.abs(entity.ppy - entity.target.y) < entity.dyss) entity.ppy = entity.target.y;
            else entity.ppy += entity.dyss;
        } 
    }
}

function updateMovePath_og() {

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
// -        PLAYER ECONOMY
// ---------------------------------------------------------------------------
var playerEconomy = {};
playerEconomy.ice = 2000;
playerEconomy.power = 1200;

// ---------------------------------------------------------------------------
// -        OTHER COMMAND
// ---------------------------------------------------------------------------
function harvesterUpdate(entity) {

    if (entity.mining) {
        entity.actionTimer.t++;
        if (entity.actionTimer.t == entity.actionTimer.final) {
            entity.mining = false;
            entity.load = 100;

            var ss = TileToScreen(85, 74, 0, 0); // retarget to fort
            entity.target = { x: ss.x - 96, y: ss.y + 16 };
            entity.harvestPt = undefined;
        }
        return;
    }

    if (entity.load) {
        if (entity.ppx == entity.target.x &&
            entity.ppy == entity.target.y) {
            entity.load = 0;
            // Collect resource
            playerEconomy.ice += 2000;
        }
        return;
    }

    if (entity.harvestPt) {

        // Check and start harvesting
        var tt = entity.harvestPt;
        //var ss = TileToScreen(tt.x, tt.y, stage_x, stage_y);

        if (entity.ppx == entity.target.x &&
            entity.ppy == entity.target.y) {
                // do harvest
                map.layers[1].data[tt.x + (tt.y*MAP.tw)] = 1412; // Mined magic
                map.layers[2].data[tt.x + (tt.y*MAP.tw)] = 0; // Remove resource tag
                entity.mining = true;
                entity.actionTimer = { t:0, final: 60 };
                entity.actionTrigger = undefined;
            }

    } else {
        if (entity.r) {
            ++entity.r;
        } else {
            entity.r = 1;
        }
        var a = Math.random() * 2 * Math.PI;
        var x = Math.floor(1.6 * entity.r * Math.cos(a)) + entity.ppx;
        var y = Math.floor(1.6 * entity.r * Math.sin(a)) + entity.ppy;

        // check if tile is harvestable
        tt = ScreenToTile(x, y);
        if (map.layers) cells = map.layers[2].data;
        var t1 = tcell(tt.x, tt.y);
        if (t1) {
            entity.harvestPt = tt;
            // Move there
            // var x0 = entity.ppx + stage_x - 32;
            // var x1 = x0 + 64;
            // var y0 = entity.ppy + stage_y - 32;
            // var y1 = y0 + 32;
            var ss = TileToScreen(tt.x, tt.y, 0, 0);
            entity.target = { x: ss.x + 64 - 32, y: ss.y + 32 };
            entity.r = 0;
        }
    }
}


function dist2(a, b) {
    return (a.ppx - b.ppx) * (a.ppx - b.ppx) +
           (a.ppy - b.ppy) * (a.ppy - b.ppy); 
}
function attackUnitUpdate(entity) {

    // Find nearby enemy?
    entity.fireUpon = undefined;
    var range = (5*64)*(5*64);
    for (var i in entityBatch) {
        if (entityBatch[i].faction == entity.faction) continue;
        if (dist2(entity, entityBatch[i]) < range) {
            entity.fireUpon = entityBatch[i];
        }
    }


    // Check if idle or shoot
    if (entity.fireUpon) {
        if (!(entity.state == firing)) {
            fire(entity);
        }  
    } else {
        entity.state = undefined;
    }
}
var firing = {
    frames: [],
};
function fire(entity) {
    entity.state = firing;
}


// ---------------------------------------------------------------------------
// -        BUILD
// ---------------------------------------------------------------------------
//var buildNames = ['City', 'Factory', 'Airport', 'Supply_S', 'Laboratory', 'Castle', 'Estate'];
var buildNames = ['Estate', 'Factory', 'Airport', 'Laboratory', 'City', 'Castle'];
var colourName = '1';
var entityBatch = [];
var standing_prefix = "img/";//Revised_PixVoxel_Wargame/standing_frames";


function createUnit(x, y) {
    var tt = ScreenToTile(x, y);
    var ss = TileToScreen(tt.x, tt.y, 0, 0);

    entity = {};
    entity.ppx = ss.x;
    entity.ppy = ss.y;
    entity.dir = 0;

    entity.update = undefined;

    // TODO - render type = unit
}


// ---------------------------------------------------------------------------
// -        BANK OF ANIMATION FRAMES
// ---------------------------------------------------------------------------
var framesBank = [];

function loadFramesBank(colorName, unitName, atk0, atk1) {
    if (framesBank[colorName] == undefined) {
        framesBank[colorName] = {};
    }

    if (framesBank[colorName][unitName] == undefined) {
        framesBank[colorName][unitName] = {};
    }

    framesBank[colorName][unitName].idle = new Image();
    framesBank[colorName][unitName].idle.src = '_img_gen/color'+colorName+'/'+unitName+'.png';

    framesBank[colorName][unitName].expl = new Image();
    framesBank[colorName][unitName].expl.src = '_img_gen/color'+colorName+'/'+unitName+'_expl.png';

    if (atk0) {
        framesBank[colorName][unitName].atk0 = new Image();
        framesBank[colorName][unitName].atk0.src = '_img_gen/color'+colorName+'/'+unitName+'_atk0.png';
    }
    if (atk1) {
        framesBank[colorName][unitName].atk1 = new Image();
        framesBank[colorName][unitName].atk1.src = '_img_gen/color'+colorName+'/'+unitName+'_atk1.png';
    }
}

function createAttackUnit(x, y, name, faction) {
    var tt = ScreenToTile(x, y);
    var ss = TileToScreen(tt.x, tt.y, 0, 0);

    entity = {};
    entity.ppx = ss.x;
    entity.ppy = ss.y;
    entity.dir = 0;
    entity.canMove = true;
    entity.faction = faction;
    entity.name = name;
    entity.unitName = name;
    
    entity.update = attackUnitUpdate;
    
    entity.frames = framesBank[faction][name];

    entityBatch.push(entity);

    entity.dir = Math.floor(Math.random() * 4);

    entity.speed = 1.15;
    if (name == 'Infantry_S') entity.speed = 1.8;

    return entity;
}


function createHarvester(x, y, faction) {
    var tt = ScreenToTile(x, y);
    var ss = TileToScreen(tt.x, tt.y, 0, 0);

    entity = {};
    entity.ppx = ss.x;
    entity.ppy = ss.y;
    entity.dir = 0;
    entity.canMove = true;
    entity.faction = faction;

    entity.update = harvesterUpdate;
    
    entity.unitName = 'Supply_S';

    entityBatch.push(entity);

    entity.dir = Math.floor(Math.random() * 4);
    
    entity.speed = 1;

    return entity;
}

// ---------------------------------------------------------------------------
// -        BUILDINGS
// ---------------------------------------------------------------------------
function commandBuildBarracks() {
    tryBuild(0);
}

function commandBuildFactory() {
    tryBuild(1);
}

function commandBuildCity() {
    tryBuild(4);
}



function collideUnit(entity) {
    var a = { 
        c: [entity.ppx, entity.ppy], 
        r: [64, 32] };
    for (var j = 0; j < entityBatch.length; ++j) {
        var otherEntity = entityBatch[j];
        if (otherEntity == entity) continue;
        if (!otherEntity.canMove) continue;
        var b = { 
            c: [otherEntity.ppx, otherEntity.ppy], 
            r: [20, 10] };
        var test = testAABBAABB(a, b);
        if (test) {
            return true;
        }
    }
    return false;
}

function updateBarracks(entity) {
    for (var i = 0; i < entity.supply.length; ++i) {
        if (entity.supply[i] == undefined) {
            if (collideUnit(entity)) continue;
            entity.supply[i] = createAttackUnit(
                entity.ppx + stage_x, 
                entity.ppy + stage_y, 
                'Infantry_S',
                entity.faction);
            //entity.supply[i].target = { x: entity.ppx, y: entity.ppy - 64 };
            break;
        }
    }
}

function updateFactory(entity)  {
    for (var i = 0; i < entity.supply.length; ++i) {
        if (entity.supply[i] == undefined) {
            entity.supply[i] = createAttackUnit(
                entity.ppx + stage_x, 
                entity.ppy + stage_y - 32*(i+1), 
                'Tank_S',
                entity.faction);
        }
    }
}

// ---------------------------------------------------------------------------
// -        BUILDINGS
// ---------------------------------------------------------------------------
function createEntity(t, x, y, faction) { 
    
    var tt = ScreenToTile(x, y);

    // Check build tiles
    if (canPlace(tt.x, tt.y) != 0) return; 
    if (canPlace(tt.x+1, tt.y) != 0) return;
    if (canPlace(tt.x, tt.y+1) != 0) return;
    if (canPlace(tt.x+1, tt.y+1) != 0) return;
    
    // y hack
    y += 32;
    tt = ScreenToTile(x, y);
    var ss = TileToScreen(tt.x, tt.y, 0, 0);

    entity = {};
    entity.ppx = ss.x;// + 0.5 * (TILE_WIDTH - entity.img.width);
    entity.ppy = ss.y;// - entity.img.height + TILE_DEPTH;
    entity.dir = 0;
    
    entity.faction = faction;

    // TODO B
    var unitName = buildNames[t-1];
    colourName = ''+faction;
    entity.unitName = 'bldg';
    entity.dir = t - 1;
    
    // //entity.frames = framesBank[faction][];
    // var entityFacing = [];    
    // for (var dir = 0; dir < 4; ++ dir) {
    //     var entityFrames = [];

    //     standing_prefix = "_img/";

    //     for (var i = 0; i < 4; ++i) {

    //         var img = new Image();
    //         img.src = standing_prefix + "color"+colourName+"/"+buildNames[t-1]+"_Large_face"+dir+"_"+i+".png";

    //         entityFrames.push(img);
    //     }
    //     entityFacing.push(entityFrames);
    // }
    // entity.frames = entityFacing;

    entityBatch.push(entity);
    
    // Cost
    var power = 0;//build_costs[t][0];
    var ice = 0;//build_costs[t][1];
    playerEconomy.ice -= ice;
    playerEconomy.power -= power;
    
    // Some more builds
    if (t-1 == 0) {
        entity.name = 'Barracks';
        entity.supply = [undefined, undefined, undefined];
        entity.update = updateBarracks;
    }
    if (t-1 == 1) {
        entity.name = 'Factory';
        entity.supply = [undefined, undefined];
        entity.update = updateFactory;
    }

    // Palace Build Machine
    if (t-1 == 5) {
        entity.update = undefined;
        entity.name = 'Palace';
        entity.control = {
            'a': undefined, 
            'b': undefined,
            'c': ['Build Barracks', commandBuildBarracks],
            'd': ['Build Factory', commandBuildFactory],
            'e': ['Build Power', commandBuildCity],
        };
    }

    // Power boost ?
    if (t-1 == 4) {
        entity.name = 'Power';
        playerEconomy.power += 1000;
    }

    // Clear out building space
    var i = tt.x - 2, j = tt.y + 1;
    setPlacementMap(i, j, 2);
    setPlacementMap(i+1, j, 2);
    setPlacementMap(i, j+1, 2);
    setPlacementMap(i+1, j+1, 2);

    // reset
    place = 0;
}

// ---------------------------------------------------------------------------
// -        PLACEMENT HACK
// ---------------------------------------------------------------------------
function setPlacementMap(i, j, v) {
    if (placementMap[i] == undefined) placementMap[i] = [];
    placementMap[i][j] = v;
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
