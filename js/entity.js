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
  'Copter_S':   ['Copter',     350,   1800,    150,    1,      4,      4,      1.90],
  'Copter':     ['Copter',     350,   1500,    150,    0,      0,      0,      2.00],  
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
            entity.target = undefined;
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
                entity.actionTimer = { t:0, final: 1600 };
                entity.actionTrigger = undefined;
            }

    } else {
        if (entity.r && entity.r < 5 * 64) {
            ++entity.r;
        } else {
            entity.r = 1;
        }
        var a = Math.random() * 2 * Math.PI;
        var x = Math.floor(
            2 * entity.r * Math.cos(a) + 
            entity.ppx + stage_x );// + 0.5 * (TILE_WIDTH) );
        var y = Math.floor(
            entity.r * Math.sin(a) + 
            entity.ppy + stage_y ); //+ TILE_DEPTH - 7);

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


function canfire(a, b) {
    if (a.faction == b.faction) return false;
    if (a.faction == select.faction) return true;
    if (b.faction == select.faction) return true;
    return false;
}


function attackUnitUpdate(entity) {

    // Find nearby enemy?
    entity.fireUpon = undefined;
    var range = (entity.range * 64) * (entity.range * 64);
    for (var i in entityBatch) {
        if (!canfire(entityBatch[i], entity)) continue;
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

            if (entity.power > 0) {
                economies[entity.faction].power += entity.power;
            }
        }
    }
}


function updateSupplyBuilding(entity) {

    // Active/Idle
    if (entity.state == entityState_idle) {
        
        for (var i = 0; i < entity.supply.length; ++i) {
            if (entity.supply[i] == undefined) {

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
            // Clearance on map
            if (!collideUnit(entity)) {
                // Add unit to scene
                entityBatch.push(entity.nextUnit);           
                entity.state = entityState_idle;
            }    
        }
    } 
}


function buildingDestroy(entity) {
  
    if (entity.power > 0) {
        economies[entity.faction].power -= entity.power;
    } 
    else if (entity.power < 0) {
        economies[entity.faction].powerUsed += entity.power;
    }

    // Clear out building space
    var i = entity.placement[0], j = entity.placement[1];
    setPlacementMap(i, j, 0);
    setPlacementMap(i+1, j, 0);
    setPlacementMap(i, j+1, 0);
    setPlacementMap(i+1, j+1, 0);

    // Game
    if (entity.palace) {
        endGame(entity);
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

        if (!entity.canMove) buildingDestroy(entity);
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

    if (name == "Copter" || name == "Copter_S") {
        entity.air = true;
    } else entityBatch.air = false;

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

    entity.harvester = true;
    
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
    if (canPlace(tt.x, tt.y) != 0) return undefined; 
    if (canPlace(tt.x+1, tt.y) != 0) return undefined;
    if (canPlace(tt.x, tt.y+1) != 0) return undefined;
    if (canPlace(tt.x+1, tt.y+1) != 0) return undefined;
    
    // y hack
    y += 32;
    tt = ScreenToTile(x, y);
    var ss = TileToScreen(tt.x, tt.y, 0, 0);

    entity = {};
    entity.ppx = ss.x;// + 0.5 * (TILE_WIDTH - entity.img.width);
    entity.ppy = ss.y;// - entity.img.height + TILE_DEPTH;
    entity.faction = faction;
    
    entityBatch.push(entity);

    constructBuildingEntity(t, entity);

    // Clear out building space
    var i = tt.x - 2, j = tt.y + 1;
    setPlacementMap(i, j, 2);
    setPlacementMap(i+1, j, 2);
    setPlacementMap(i, j+1, 2);
    setPlacementMap(i+1, j+1, 2);

    entity.placement = [i, j];

    if (t == 1) {
        setPlacementMap(i, j+2, 2);
        setPlacementMap(i+1, j+2, 2);
        setPlacementMap(i, j+3, 2);
        setPlacementMap(i+1, j+3, 2);    
    }

    return entity;
}


var buildingTables = [];


function setupTemplates() {
    var templateAirport = {
        name: 'Airport',
        supply: [undefined, undefined],
        supply_type: ['Copter', 'Copter'], 
        update: updateSupplyBuilding,
        power: -2,
    };

    var templateAirport_S = {
        name: 'Airport',
        supply: [undefined, undefined],
        supply_type: ['Copter_S', 'Copter_S'], 
        update: updateSupplyBuilding,
        power: -2,
    };

    var templateAirport_S_p = {
        name: 'Airport',
        supply: [undefined, undefined, undefined],
        supply_type: ['Copter_S', 'Copter_S', 'Copter_S'], 
        update: updateSupplyBuilding,
        power: -2,
    };

    var templateBarracks = {
        name: 'Barracks',
        supply: [undefined, undefined, undefined, undefined],
        supply_type: ['Infantry', 'Infantry', 'Infantry', 'Infantry'], 
        update: updateSupplyBuilding,
        power: -2,
    };

    var templateBarracks_S = {
        name: 'Barracks',
        supply: [undefined, undefined, undefined],
        supply_type: ['Infantry_S', 'Infantry_S', 'Infantry_S'], 
        update: updateSupplyBuilding,
        power: -2,
    };

    var templateBarracks_S_p = {
        name: 'Barracks',
        supply: [undefined, undefined, undefined, undefined],
        supply_type: ['Infantry_S', 'Infantry_S', 'Infantry_S', 'Infantry_S'], 
        update: updateSupplyBuilding,
        power: -2,
    };

    var templateFactory = {
        name: 'Factory',
        supply: [undefined, undefined, undefined],
        supply_type: ['Tank_S', 'Tank_S', 'Tank_S'], 
        update: updateSupplyBuilding,
        power: -2,
    };

    var templateFactory_p = {
        name: 'Factory',
        supply: [undefined, undefined, undefined, undefined],
        supply_type: ['Tank_S', 'Tank_S', 'Tank_S', 'Tank_S'], 
        update: updateSupplyBuilding,
        power: -2,
    };

    var templatePower = {
        name: 'Power Supply',
        supply: [],
        supply_type: [],
        update: updateBuilding,
        power: 2,
    };

    var templatePalace = {
        name: 'Palace',
        supply: [undefined],
        supply_type: ['Supply_S'], 
        update: updateSupplyBuilding,
        power: 0,
    };

    var templatePalace_p = {
        name: 'Palace',
        supply: [undefined, undefined],
        supply_type: ['Supply_S', 'Supply_S'], 
        update: updateSupplyBuilding,
        power: 0,
    };

    buildingTables[select.faction] = {
        0: select.upgrade == 3 ?    templateAirport_S_p    :    templateAirport_S,
        1: select.upgrade == 0 ?    templatePalace_p       :    templatePalace,
        2: templatePower,
        3: select.upgrade == 1 ?    templateBarracks_S_p   :    templateBarracks_S,
        4: select.upgrade == 2 ?    templateFactory_p      :    templateFactory,
    }


    buildingTables[select.enemyFaction1] = {
        0: templateAirport,
        1: templatePalace,
        2: templatePower,
        3: templateBarracks,
        4: templateFactory,
    };


    buildingTables[select.enemyFaction2] = {
        0: templateAirport_S,
        1: templatePalace,
        2: templatePower,
        3: templateBarracks_S_p,
        4: templateFactory,
    };

    buildingTables[select.enemyFaction3] = {
        0: templateAirport_S,
        1: templatePalace_p,
        2: templatePower,
        3: templateBarracks_S,
        4: templateFactory,
    };

    buildingTables[select.enemyFaction4] = {
        0: templateAirport,
        1: templatePalace_p,
        2: templatePower,
        3: templateBarracks,
        4: templateFactory_p,
    };
}


function constructBuildingEntity(t, entity) {

    entity.dir = 0;
    
    entity.hp = 1000;
    entity.maxhp = 1000;
    entity.explOffset = 42;

    // State
    entity.state = entityState_building;
    entity.beginBuild = frameTick;
    entity.buildDuration = (build_costs[t] == undefined) ? 0 : build_costs[t][2];
  
    var unitName = buildNames[t];
    entity.unitName = 'bldg';
    entity.dir = t;
    
    var template = buildingTables[entity.faction][t];

    entity.name = template.name;
    entity.supply = template.supply.slice(0); // DEEP COPY 
    entity.supply_type = template.supply_type.slice(0); 
    entity.update = template.update;
    entity.power = template.power;

    // Palace Build Machine
    if (t == 1) {
        entity.control = {
            'a': ['Build Airport', commandBuildAirport], 
            'b': ['Build Barracks', commandBuildBarracks],
            'c': ['Build Factory', commandBuildFactory],
            'd': undefined,
            'e': ['Build Power', commandBuildCity],
        };

        entity.palace = true;
    }

}