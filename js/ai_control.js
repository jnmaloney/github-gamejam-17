// ---------------------------------------------------------------------------
// -        SETUP
// ---------------------------------------------------------------------------
var opponent_ai = {
    selected: [],
    state: 0,
    ice: 0,
    build_order: [2, 3, 2, 3, 2, 4, 2, 4, 2, 0],
    c: [
        [5, 5],
        //[9, 7],
        [5, 7],
        [7, 9],
        [9, 5],
        [11, 9],     
        [15, 9],
        [9, 11],
        [7, 11],
        [9, 3],
        [5, 3],        
    ],
    builds: [undefined, undefined, undefined, undefined, 
        undefined, undefined, undefined,
        undefined, undefined, undefined],
};



var aiEconomy = {};
aiEconomy.ice = 500;
aiEconomy.power = 0;


// Called form move or smth
function aiUpdate() {
    var enemy_faction = select.faction ? 0 : 2;
    for (var i in entityBatch) {
        var e = entityBatch[i];
        if (e.faction == enemy_faction && 
            e.dmg > 0) {
            var ss = TileToScreen(85, 74, 0, 0); // retarget to fort
            e.target = { x: ss.x - 96, y: ss.y + 16 };
        }
    }

    aiBuild();
}


function aiBuild() {

    for (var i in opponent_ai.builds) {

        var e = opponent_ai.builds[i];
        if (e && e.state == entityState_explode) {
            opponent_ai.builds[i] = undefined;
            continue;
        }

        if (e == undefined) {
            var t = opponent_ai.build_order[i];
            var ice = build_costs[t][0];
            if (aiEconomy.ice > ice + 200 + i*50) {
                // Create it
                var x = opponent_ai.c[i][0],
                    y = opponent_ai.c[i][1];
                ss = TileToScreen(x, y, stage_x, stage_y);
                // Oh
                var enemy_faction = select.faction ? 0 : 2;
                opponent_ai.builds[i] = 
                    createEntity(t, ss.x, ss.y, enemy_faction);
                // Cost
                aiEconomy.ice -= ice;
                break;
            }
        }
    }
}

