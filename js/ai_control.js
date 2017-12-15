// ---------------------------------------------------------------------------
// -        SETUP
// ---------------------------------------------------------------------------
var aiList = [];
var aiMode_rally = {};
var aiMode_attack = {};


function setupAI(ai) {

    var factions = [select.enemyFaction1, select.enemyFaction2, select.enemyFaction3, select.enemyFaction4];

    // AI Player Object
    var opponent_ai = {
        faction: factions[ai.index],
        selected: [],
        state: 0,
        ice: 0,
        build_order: [2, 3, 2, 3, 2, 4, 2, 4, 2, 0],
        builds: [undefined, undefined, undefined, undefined, 
            undefined, undefined, undefined,
            undefined, undefined, undefined],
        c: [],
    };

    // Add to list
    aiList.push(opponent_ai);
       
    
    // Economy
    var aiEconomy = {};
    aiEconomy.ice = 2200;
    aiEconomy.power = 0;

    opponent_ai.economy = aiEconomy;

    // Map Loaded Info
    opponent_ai.info = ai;

    // Generate build-tile list
    for (var i = -3; i < 4; ++i) {
        for (var j = -3; j < 4; ++j) {
            if (i == 0 && j == 0) continue;
            var x = 2 * i;
            var y = 2 * j;
            opponent_ai.c.push([x, y]);
        }
    }
}

// ---------------------------------------------------------------------------
// -        UPDATE
// ---------------------------------------------------------------------------
function aiUpdate(ai) {
    
    var ctrl1 = [];

    // Check all entities
    for (var i in entityBatch) {
        var e = entityBatch[i];
        if (e.faction == ai.faction && 
            e.hp > 0) {

            // Find opponent fort
            if (e.dmg > 0) {

                ctrl1.push(e);

            } else if (!e.target) {
                // Target for harvester
                var obj = ai.info.harvests[ai.info.index];
                var x = Math.floor((obj.x + 2 * obj.width * Math.random()) / 32);
                var y = Math.floor((obj.y + obj.height * Math.random()) / 32);
                var ss = TileToScreen(
                    x, y, 
                    0, 0);
                e.target = { x: ss.x - 96, y: ss.y + 16 };
            }
        }
    }

    // Change Mode
    if (ctrl1.length > 6) {
        ai.mode = aiMode_attack;
    } else if (ctrl1.length < 4) {
        ai.mode = aiMode_rally;
    }
    
    // Attack units command
    for (var i in ctrl1) {
        var e = ctrl1[i];
        setEntityTarget(ai, e);
    }
    
    // Building
    aiBuild(ai);
}


function aiBuild(ai) {

    for (var i in ai.builds) {

        var e = ai.builds[i];
        if (e && e.state == entityState_explode) {
            ai.builds[i] = undefined;
            continue;
        }

        if (e == undefined) {
            var pos = Math.floor(Math.random() * ai.c.length);// % ai.c.length;
            var t = ai.build_order[i];
            var ice = build_costs[t][0];
            if (ai.economy.ice > ice + 200 + i*50) {
                // Position
                var x = ai.c[pos][0],
                    y = ai.c[pos][1];
                ss = TileToScreen(
                    ai.info.spawn.x / 32 + 2 + x, 
                    ai.info.spawn.y / 32 - 0 + y, 
                    stage_x, stage_y);

                // Create it and save a reference
                ai.builds[i] = 
                    createEntity(t, ss.x, ss.y, ai.faction);
                // Cost
                if (ai.builds[i]) {
                    ai.economy.ice -= ice;
                }
                break;
            }
        }
    }
}


// ---------------------------------------------------------------------------
// -        TARGETING
// ---------------------------------------------------------------------------
function setEntityTarget(ai, e) {

    //if (e.target == undefined) {

        if (ai.mode == aiMode_attack) {

            var obj = ai.info.attacks[0];
            var x = Math.floor((obj.x + obj.width * Math.random()) / 32);
            var y = Math.floor((obj.y + obj.height * Math.random()) / 32);
            var ss = TileToScreen(
                x, y, 
                0, 0);
            e.target = { x: ss.x - 96, y: ss.y + 16 };

        } else {

            var obj = ai.info.rallies[ai.info.index];
            var x = Math.floor((obj.x + obj.width * Math.random()) / 32);
            var y = Math.floor((obj.y + obj.height * Math.random()) / 32);
            var ss = TileToScreen(
                x, y, 
                0, 0);
            e.target = { x: ss.x - 96, y: ss.y + 16 };

        }
    //}
}

