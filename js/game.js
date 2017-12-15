// ---------------------------------------------------------------------------
// -        Setup
// ---------------------------------------------------------------------------
var map = [];
tiles = [];
var smokes = [];
var economies = {};


function setup() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight; 

    // Faction Build-Upgrade Templates
    setupTemplates();

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
    
    // Set up player economy
    economies[select.faction] = playerEconomy;


    // Load data
    loadFramesBank(select.faction, 'bldg', false, false);

    loadFramesBank(select.faction, 'Supply_S', false, false);
    loadFramesBank(select.faction, 'Infantry_S', true, false);
    loadFramesBank(select.faction, 'Tank_S', true, false);
    loadFramesBank(select.faction, 'Copter_S', true, false);


    var src = 'maps/' + map_src;
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
            ss = TileToScreen(
                player_spawn.x / 32 + 2, 
                player_spawn.y / 32 - 0, 
                stage_x, stage_y);
            economies[select.faction].palace = 
                createEntity(1, ss.x, ss.y, select.faction);
            

            stage_x = -ss.x + 0.5 * canvas.width;
            stage_y = -ss.y + 0.5 * canvas.height;

            // ss = TileToScreen(79, 82, stage_x, stage_y);
            // entityBatch.push(
            //     createAttackUnit(ss.x, ss.y, 'Infantry_S', select.faction) );
            // ss = TileToScreen(89, 82, stage_x, stage_y);
            // entityBatch.push(
            //     createAttackUnit(ss.x, ss.y, 'Tank_S', select.faction) );


            // Create Enemy Bases
            for (var i in aiList) {

                ss = TileToScreen(
                    aiList[i].info.spawn.x / 32 + 2, 
                    aiList[i].info.spawn.y / 32 - 0, 
                    stage_x, stage_y);

                aiList[i].economy.palace = 
                    createEntity(1, 
                        ss.x, 
                        ss.y, 
                        aiList[i].faction);

                // Set up enemy economy
                economies[aiList[i].faction] = aiList[i].economy;
                                
                // Load Sprites
                loadFramesBank(aiList[i].faction, 'bldg', false, false);
                
                loadFramesBank(aiList[i].faction, 'Supply_S', false, false);
                loadFramesBank(aiList[i].faction, 'Infantry', true, false);
                loadFramesBank(aiList[i].faction, 'Infantry_S', true, false);
                loadFramesBank(aiList[i].faction, 'Tank_S', true, false);      
                loadFramesBank(aiList[i].faction, 'Copter', true, false);  
                loadFramesBank(aiList[i].faction, 'Copter_S', true, false);  
            }
        });

}


// ---------------------------------------------------------------------------
// -        Map Loading
// ---------------------------------------------------------------------------
var cells = [];
var MAP = {};
var tileList = [];
var player_spawn = undefined;
function loadMap(mapJson) {

    map = mapJson;

    MAP.th = map.height;
    MAP.tw = map.width;

    // Parse map objects
    var objects = map.layers[3].objects;

    // AI Zone types
    var harvests = [],
        rallies = [],
        spawns = [],
        attacks = [];

    for (var i in objects) {
        var object = objects[i];
        if (object.type == "spawn") {
            spawns.push(object);
        } else if (object.type == "harvest") {
            harvests.push(object);
        } else if (object.type == "rally") {
            rallies.push(object);
        } else if (object.type == "attack") {
            attacks.push(object);
        } else if (object.type == "player_spawn") {
            // This is where the player starts
            player_spawn = object;
        }
    }

    // Create AI player for each spawn
    for (var i in spawns) {
        ai = {};
        ai.index = i;
        ai.spawn = spawns[i];
        ai.harvests = harvests;
        ai.rallies = rallies;
        ai.attacks = attacks;
        //
        setupAI(ai);
    }
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
var place = undefined;
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
var spaceKey = keyboard(32);    
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
    doSelectionCommand('a');
}
abutton.release = function() {
}
bbutton.press = function() {
    doSelectionCommand('b');
}
cbutton.press = function() {
    doSelectionCommand('c');
}
dbutton.press = function() {
    doSelectionCommand('d');
}
ebutton.press = function() {
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


spaceKey.press = function() {

    if (selected.length == 1 && selected[0] == economies[select.faction].palace) {
        stage_x = -economies[select.faction].palace.ppx + 0.5 * canvas.width;
        stage_y = -economies[select.faction].palace.ppy + 0.5 * canvas.height;
    } else {
        selected = [economies[select.faction].palace];
    }
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

        if (res == 'down') {
            if (control.move) {
                moveCommand(currX, currY);
            } else if (place) {
                tryPlace(place.id);
            } else {
                selectionBox = { x0: x, y0: y, x1: x, y1: y };
            }
        }
        if (res == 'move' && selectionBox) {
            selectionBox.x1 = x;
            selectionBox.y1 = y;
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


// ---------------------------------------------------------------------------
// -        BUILD COMMAND
// --------------------------------------------------------------------------
function tryBuild(t) {
    // Check resources
    var ice = build_costs[t][0];
    var power = build_costs[t][1];
    var availablePower = playerEconomy.power - playerEconomy.powerUsed;
    var availableIce = playerEconomy.ice;
    if (availablePower < power) return;
    if (availableIce < ice) return;
    
    // Go into building place mode
    place = { id: t };
}


function tryPlace(t) {

    // Cancel
    place = undefined;

    // Check resources
    var ice = build_costs[t][0];
    var power = build_costs[t][1];
    var availablePower = playerEconomy.power - playerEconomy.powerUsed;
    var availableIce = playerEconomy.ice;
    if (availablePower < power) return;
    if (availableIce < ice) return;

    // Place a new building
    var entity = createEntity(t, currX, currY, select.faction);
    if (entity) {
            
        // Cost
        playerEconomy.powerUsed += power;
        playerEconomy.ice -= ice;
    }
    
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
        if (entity.hp <= 0) continue;
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

            // if (entity.ppx == entity.target.x && entity.ppy == entity.target.y) { 
            //     entity.target = undefined; continue;
            // }

            entity.dxss = 2 * entity.speed * entity.dx;
            entity.dyss = entity.speed * entity.dy;

            // Check for other entity collisions
            var brake = false;
            for (var j = 0; j < entityBatch.length; ++j) {
                if (i == j) continue;
                if (!collidesWith(entity, entityBatch[j])) continue; // Check flags
                if (entity.load && !entityBatch[j].canMove) continue; // Loading hack
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


// Check flags
function collidesWith(a, b) {

    // Harvester
    if (a.harvester) return b.canMove;

    // Air
    if (a.air) return b.air;

    // Ground
    return !(b.air);
}

// ---------------------------------------------------------------------------
// -        PLAYER ECONOMY
// ---------------------------------------------------------------------------
var playerEconomy = {};
playerEconomy.ice = 2200;
playerEconomy.power = 0;
playerEconomy.powerUsed = 0;


// ---------------------------------------------------------------------------
// -        SMOKE
// ---------------------------------------------------------------------------
function createSmoke(entity) {
    var smoke = {};
    smoke.ppx = entity.ppx + 64 - 32 * Math.random() - 32;
    smoke.ppy = entity.ppy + 32 - 48 * Math.random() - 32;
    smoke.frame = 7;
    smokes.push(smoke);
}

function updateSmoke() {
    for (var i in smokes) {
        if (frameTick % 2 == 0) --smokes[i].frame;
        --smokes[i].ppy;
        if (smokes[i].frame < 0) {
            smokes.splice(i, 1);
        }
    }
}

function drawSmoke() {

    var tile = {
        sheet: framesBank['smoke'],
        x: 0,
        y: 0,
        w: 16,
        h: 16,
    }
    var width = tile.w,
        height = tile.h;

    for (var i in smokes) {
        var x = smokes[i].ppx + stage_x,
            y = smokes[i].ppy + stage_y;

        tile.x = 16 * (smokes[i].frame % 4);
        tile.y = 16 * Math.floor(smokes[i].frame / 4);

        ctx.drawImage(
            tile.sheet, 
            tile.x, tile.y,
            tile.w, tile.h,
            x, y,
            width, height);
    }
}


// ---------------------------------------------------------------------------
// -        BANK OF ANIMATION FRAMES
// ---------------------------------------------------------------------------
var framesBank = [];
framesBank['smoke'] = new Image();
framesBank['smoke'].src = 'img/Smoke.png';

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


// ---------------------------------------------------------------------------
// -        BUILDINGS
// ---------------------------------------------------------------------------
function commandBuildAirport() {
    tryBuild(0);
}


function commandBuildBarracks() {
    tryBuild(3);
}


function commandBuildFactory() {
    tryBuild(4);
}


function commandBuildCity() {
    tryBuild(2);
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


// ---------------------------------------------------------------------------
// -        PLACEMENT HACK
// ---------------------------------------------------------------------------
function setPlacementMap(i, j, v) {
    if (placementMap[i] == undefined) placementMap[i] = [];
    placementMap[i][j] = v;
}



// ---------------------------------------------------------------------------
// -        PALACE WAS DESTROYED
// ---------------------------------------------------------------------------
function endGame(entity) {

}
