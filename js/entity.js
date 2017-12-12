// ---------------------------------------------------------------------------
// -        BUILD COSTS
// ---------------------------------------------------------------------------
//  - ICE - PWR - TIME - ID - NAME
var barracks = [800, 2, 720, 3, ""];
var factory = [1200, 2, 900, 4, ""];
var airport = [2000, 2, 3600, 0, ""];
var techlab = [400, 2, 3600, 5, ""];
var power = [500, 0, 570, 2, ""];
//var build_costs = [barracks, factory, airport, techlab, power];
var build_costs = [airport, undefined, power, barracks, factory, techlab];



// ---------------------------------------------------------------------------
// -        BUILD
// ---------------------------------------------------------------------------
var buildNames = ['Airport', 'Palace', 'Power', 'Barracks', 'Factory', 'Lab'];
var colourName = '1';
var entityBatch = [];
var standing_prefix = "img/";



// ---------------------------------------------------------------------------
// -        UNIT BUILD TABLE
// ---------------------------------------------------------------------------
// name         sprite          cost    time    hp      dmg     rate    range   move
var unit_table = {
  'Supply_S':   ['Harvester',  200,    360,    200,    0,      0,      0,      1],
  'Tank_S':     ['Tank',       200,    920,    200,    2,      4,      7,      1.15],
  'Infantry_S': ['Infantry',    50,    360,    125,    1,      4,      5,      1.80],
  'Infantry':   ['Infantry',    50,    300,    100,    1,      8,      5,      1.25],
  'Copter_S':   ['Copter',     350,   6000,    150,    1,      4,      4,      1.90],
  'Copter':     ['Copter',     350,   4000,    150,    0,      0,      0,      2.00],  
};


// ---------------------------------------------------------------------------
// -        SUPPLY BUILDING UPGRADES
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// -        STATES
// ---------------------------------------------------------------------------
var entityState_idle = {};
var entityState_firing = {};
var entityState_explode = {};
var entityState_harvesting = {};
var entityState_moving = {};
var entityState_movingAttack = {};
var entityState_building = {};
var entityState_produce = {};


// ---------------------------------------------------------------------------
// -        UPDATE FUNCTIONS
// ---------------------------------------------------------------------------
function harvesterUpdate(entity) {

    if (entity.mining) {
        entity.actionTimer.t++;
        if (entity.actionTimer.t == entity.actionTimer.final) {
            entity.mining = false;
            entity.load = 2000;

            // retarget to fort
            entity.target = { 
                x: entity.parent.ppx - 96, 
                y: entity.parent.ppy + 16 
            };
            entity.harvestPt = undefined;
        }
        return;
    }

    if (entity.load && entity.target) {
        if (entity.ppx == entity.target.x &&
            entity.ppy == entity.target.y) {
            // Collect resource
            // Unload
            economies[entity.faction].ice += entity.load;
            entity.load = 0;
        }
        return;
    }

    if (entity.harvestPt && entity.target) {

        // Check and start harvesting
        var tt = entity.harvestPt;
        //var ss = TileToScreen(tt.x, tt.y, stage_x, stage_y);

        if (entity.ppx == entity.target.x &&
            entity.ppy == entity.target.y) {
                // do harvest
                map.layers[1].data[tt.x + (tt.y*MAP.tw)] = 1412; // Mined magic
                map.layers[2].data[tt.x + (tt.y*MAP.tw)] = 0; // Remove resource tag
                entity.mining = true;
                entity.actionTimer = { t:0, final: 6000 };
                entity.actionTrigger = undefined;
            }

    } else {
        if (entity.r && entity.r < 16000.0) {
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
    var range = (entity.range * 64) * (entity.range * 64);
    for (var i in entityBatch) {
        if (entityBatch[i].faction == entity.faction) continue;
        if (entityBatch[i].hp <= 0) continue;
        if (dist2(entity, entityBatch[i]) < range) {
            entity.fireUpon = entityBatch[i];
        }
    }

    // Check if idle or shoot
    if (entity.fireUpon) {
        if (entity.state == undefined) {
            fire(entity);
        }  
    } else {
        if (entity.state == entityState_firing) {
            entity.state = undefined;
        }
    }

    // Shoot does damage to target
    if (entity.state == entityState_firing) {
        if (frameTick % entity.firingRate == 0) {
            createSmoke(entity.fireUpon);
            dealDamage(entity.fireUpon, entity.dmg);
        }
    }
}



function fire(entity) {
    entity.state = entityState_firing;
}


// ---------------------------------------------------------------------------
// -        UPDATE BUILDINGS
// ---------------------------------------------------------------------------
function updateBuilding(entity) {
    // Under construction
    if (entity.state == entityState_building) {
        var t = frameTick - entity.beginBuild;
        if (t > entity.buildDuration) {
            entity.state = entityState_idle;
        }
    }
}


function updateSupplyBuilding(entity) {

    // Active/Idle
    if (entity.state == entityState_idle) {
        
        for (var i = 0; i < entity.supply.length; ++i) {
            if (entity.supply[i] == undefined) {

                // Clearance on map
                if (collideUnit(entity)) continue;

                // Cost
                var ice = unit_table[entity.supply_type[i]][1];

                if (economies[entity.faction].ice < ice) break;
                economies[entity.faction].ice -= ice;


                // Create new production unit
                if (entity.supply_type[i] == 'Supply_S') {
                    entity.supply[i] = createHarvester(
                        entity.ppx + stage_x, 
                        entity.ppy + stage_y, 
                        entity.faction);
                } else {
                    entity.supply[i] = createAttackUnit(
                        entity.ppx + stage_x, 
                        entity.ppy + stage_y, 
                        entity.supply_type[i],
                        entity.faction);
                }
                entity.supply[i].parent = entity;
                entity.state = entityState_produce;
                entity.nextUnit = entity.supply[i];
                entity.beginProduce = frameTick;
                entity.produceDuration = unit_table[entity.supply_type[i]][2];
                break;
            }
        }
    }

    // Under construction
    else if (entity.state == entityState_building) {
        var t = frameTick - entity.beginBuild;
        if (t > entity.buildDuration) {
            entity.state = entityState_idle;
        }
    }

    // Production
    else if (entity.state == entityState_produce) {
    
        var t = frameTick - entity.beginProduce;
        if (t > entity.produceDuration) {
            // Add unit to scene
            entityBatch.push(entity.nextUnit);           
            entity.state = entityState_idle;
        }    
    } 
}

// ---------------------------------------------------------------------------
// -        DAMAGING
// ---------------------------------------------------------------------------
function dealDamage(entity, dmg) {

    entity.hp -= dmg;

    // Kill?
    if (entity.hp <= 0 && entity.state != entityState_explode) {
        entity.state = entityState_explode;
        entity.frameOffset = frameTick;
        entity.target = undefined;
        entity.fireUpon = undefined;
    }
}



// ---------------------------------------------------------------------------
// -        CREATE ENTITIES
// ---------------------------------------------------------------------------
function createAttackUnit(x, y, name, faction) {
    var tt = ScreenToTile(x, y);
    var ss = TileToScreen(tt.x, tt.y, 0, 0);

    var stat = unit_table[name];

    entity = {};
    entity.ppx = ss.x;
    entity.ppy = ss.y;
    entity.dir = 0;
    entity.canMove = true;
    entity.faction = faction;
    entity.unitName = name;
    entity.name = stat[0];
    
    entity.hp = stat[3];
    entity.maxhp = stat[3];
    entity.explOffset = 42;

    entity.dmg = stat[4];
    entity.firingRate = stat[5];
    entity.range = stat[6];
    entity.speed = stat[7];

    entity.update = attackUnitUpdate;
    
    entity.frames = framesBank[faction][name];

    entity.dir = Math.floor(Math.random() * 4);

    return entity;
}


function createHarvester(x, y, faction) {
    var tt = ScreenToTile(x, y);
    var ss = TileToScreen(tt.x, tt.y, 0, 0);

    var stat = unit_table['Supply_S'];

    entity = {};
    entity.ppx = ss.x;
    entity.ppy = ss.y;
    entity.dir = 0;
    entity.canMove = true;
    entity.faction = faction;
    entity.name = stat[0];
    entity.unitName = 'Supply_S';

    entity.hp = stat[3];
    entity.maxhp = stat[3];
    entity.explOffset = 42;

    entity.dmg = stat[4];
    entity.firingRate = stat[5];
    entity.range = stat[6];
    entity.speed = stat[7];

    entity.update = harvesterUpdate;
    
    entity.dir = Math.floor(Math.random() * 4);
    
    return entity;
}



// ---------------------------------------------------------------------------
// -        UPDATE FUNCTIONS
// ---------------------------------------------------------------------------


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

    entity.hp = 1000;
    entity.maxhp = 1000;
    entity.explOffset = 42;

    // State
    entity.state = entityState_building;
    entity.beginBuild = frameTick;
    entity.buildDuration = (build_costs[t] == undefined) ? 0 : build_costs[t][2];
    
    // TODO B
    var unitName = buildNames[t];
    colourName = ''+faction;
    entity.unitName = 'bldg';
    entity.dir = t;
    
    entityBatch.push(entity);
        
    // Some more builds
    if (t == 3) {
        entity.name = 'Barracks';
        entity.supply = [undefined, undefined, undefined, undefined];
        entity.supply_type = ['Infantry_S', 'Infantry_S', 'Infantry_S', 'Infantry_S']; 
        entity.update = updateSupplyBuilding;
    }
    if (t == 4) {
        entity.name = 'Factory';
        entity.supply = [undefined, undefined, undefined];
        entity.supply_type = ['Tank_S', 'Tank_S', 'Tank_S'];             
        entity.update = updateSupplyBuilding;
    }
    if (t == 0) {
        entity.name = 'Airport';
        entity.supply = [undefined, undefined, undefined];
        entity.supply_type = ['Copter_S', 'Copter_S', 'Copter_S'];             
        entity.update = updateSupplyBuilding;
    }

    // Palace Build Machine
    if (t == 1) {
        entity.update = updateSupplyBuilding;
        entity.supply = [undefined];
        entity.supply_type = ['Supply_S'];
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
    if (t == 2) {
        entity.name = 'Power';
        economies[entity.faction].power += 5; // ?
        entity.update = updateBuilding;
    }

    // Clear out building space
    var i = tt.x - 2, j = tt.y + 1;
    setPlacementMap(i, j, 2);
    setPlacementMap(i+1, j, 2);
    setPlacementMap(i, j+1, 2);
    setPlacementMap(i+1, j+1, 2);

    return entity;
}
