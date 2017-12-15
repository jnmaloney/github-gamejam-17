select = {};
select.card = new Image();
select.card.src = 'img/card.png';
select.hoverGo = 0;
select.hoverBuildUpgrades = [];
select.upgrade = 0;

var buildUpgrades = [
    'Palace',
    'Barracks',
    'Factory',
    'Airport'
];

function mouseSelect(res, e) {


    if (res == 'move') {
        select.hover = undefined;
        var y = 0.5 * (canvas.height - 720) + 122;
       
        w = 48;
        h = 48;
        for (var i = 0; i < 8; ++i) {
        
            x = 0.5 * (canvas.width - 1024) + 282 + 75 * i
    
            if (currX > x && currY > y &&
                currX < x + w && currY < y + h) {
                    select.hover = i;
                    break;
                }
        
        }

        x = 0.5 * (canvas.width - 1024) + 954 - 125;
        y = 0.5 * (canvas.height - 720) + 716 - 50;
        w = 248;
        h = 148;
        if (currX > x && currY > y &&
            currX < x + w && currY < y + h)
                select.hoverGo = 1;
        else
                select.hoverGo = 0;

        // bld upg
        x = 0.5 * (canvas.width - 1024) + 662;
        y = 0.5 * (canvas.height - 720) + 362;
        w = 248;
        h = 42;
        for (var i in buildUpgrades) {
            y += 42;

            if (currX > x && currY > y &&
                currX < x + w && currY < y + h)
                    select.hoverBuildUpgrades[i] = 1;
            else
                    select.hoverBuildUpgrades[i] = 0;
        }
    }
    if (res == 'down') {
        if (select.hover != undefined) {
            select.faction = select.hover;
            select.enemyFaction1 = select.faction == 0 ? 4 : 0;
            select.enemyFaction2 = select.faction == 1 ? 5 : 1;
            select.enemyFaction3 = select.faction == 2 ? 6 : 2;
            select.enemyFaction4 = select.faction == 3 ? 7 : 3;
        } else if (select.hoverGo) {
            // ... next scene
            setState(gameEngineState_game);
        } else {
            for (var i in buildUpgrades) {
                if (select.hoverBuildUpgrades[i]) {
                    select.upgrade = i;
                    break;
                }
            }
        }
    }

}

function beginSelect() {

    select.faction = 2;
    select.enemyFaction1 = select.faction == 0 ? 4 : 0;
    select.enemyFaction2 = select.faction == 1 ? 5 : 1;
    select.enemyFaction3 = select.faction == 2 ? 6 : 2;
    select.enemyFaction4 = select.faction == 3 ? 7 : 3;

}

function playSelect(dt) {
 
}


function drawSelect() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = "#bec6d5";
    ctx.fillRect(0, 0, canvas.width, canvas.height); 

 
    var x = 0.5 * (canvas.width);
    var y = 0.5 * (canvas.height - 720) + 50;


    var text = 'Choose your Faction'
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText(text, x, y, 200);
    ctx.fillStyle = 'white';
    ctx.fillText(text, x-1, y-1, 200);


    x = 0.5 * (canvas.width - 1024) + 4;
    y = 0.5 * (canvas.height - 720) + 70;
    w = 1024 - 8;
    h = 720 - 74 - 32;

    ctx.fillStyle = "#aaa";
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.font = 'bold 18px sans-serif';

    // Color
    x = 0.5 * (canvas.width - 1024) + 112;
    y = 0.5 * (canvas.height - 720) + 152;
    text = 'Colour'
    ctx.fillStyle = 'black';
    ctx.fillText(text, x, y, 200);
    ctx.fillStyle = 'white';
    ctx.fillText(text, x-1, y-1, 200);


 
    w = 24;
    h = 24;
    for (var i = 0; i < 8; ++i) {
        text = i+1;
    
        x = 0.5 * (canvas.width - 1024) + 312 + 75 * i

        ctx.fillStyle = 'black';
        ctx.fillText(text, x, y, 200);

        ctx.fillStyle = 'white';
        if (i == select.hover) ctx.fillStyle = 'yellow';
        if (i == select.faction) ctx.fillStyle = 'blue';

        ctx.fillText(text, x-1, y-1, 200);
    
    }

    var unitNames = ['Copter_S', 'Tank_S', 'Infantry_S'];

    // Load
    loadFramesBank(select.faction, 'Infantry_S', true, false);
    loadFramesBank(select.faction, 'Tank_S', true, false);
    loadFramesBank(select.faction, 'Copter_S', true, false);

    x = 0.5 * (canvas.width - 1024) + 112;
    y = 0.5 * (canvas.height - 720) + 505;

    text = 'Units';
    ctx.fillStyle = 'black';
    ctx.fillText(text, x, y, 200);
    ctx.fillStyle = 'white';
    ctx.fillText(text, x-1, y-1, 200);

    x = 0.5 * (canvas.width - 1024) + 292;
    y = 0.5 * (canvas.height - 720) + 402;

    // bkg
    ctx.drawImage(select.card, x, y);

    // Units
    for (var i = 0; i < 3; ++i) { 
        x = 0.5 * (canvas.width - 1024) + 298 + 55 * (i % 2);
        y += 32; 

        var tile = getEntityTile({unitName: unitNames[i], faction: select.faction, dir: i%2});
        
        ctx.drawImage(
            tile.sheet, 
            tile.x, tile.y,
            tile.w, tile.h,
            x, y - 27,
            tile.w, tile.h);
    }
    
    // Upgrades
    x = 0.5 * (canvas.width - 1024) + 752;
    y = 0.5 * (canvas.height - 720) + 392;

    for (var i in buildUpgrades) {
        text = buildUpgrades[i];
        y += 42;
    
        ctx.fillStyle = 'black';
        ctx.fillText(text, x, y, 200);
        ctx.fillStyle = 'white';
        if (select.hoverBuildUpgrades[i]) ctx.fillStyle = 'yellow';
        ctx.fillText(text, x-1, y-1, 200);
    }

    x = 0.5 * (canvas.width - 1024) + 852;
    y = 0.5 * (canvas.height - 720) + 392;
    
    text = '+1';
    y += 42 * (select.upgrade*1 + 1);

    ctx.fillStyle = 'black';
    ctx.fillText(text, x, y, 200);
    ctx.fillStyle = 'white';
    ctx.fillText(text, x-1, y-1, 200);


    // Next GO >>
    x = 0.5 * (canvas.width - 1024) + 954;
    y = 0.5 * (canvas.height - 720) + 716;
    text = 'GO >>'
    ctx.fillStyle = 'black';
    ctx.fillText(text, x, y, 200);
    ctx.fillStyle = 'white';
    if (select.hoverGo) ctx.fillStyle = 'yellow';
    ctx.fillText(text, x-1, y-1, 200);

}

    