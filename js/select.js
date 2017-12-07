select = {};
select.card = new Image();
select.card.src = 'img/card.png';
select.faction = 2;
select.hoverGo = 0;

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


    }
    if (res == 'down') {
        if (select.hover != undefined) {
            select.faction = select.hover;
        } else if (select.hoverGo) {
            // ... next scene
            setState(gameEngineState_game);
        }
    }

}

function beginSelect() {



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

    // Building Cards
    var buildingNames = [
        ['Factory', 'Airport', 'Laboratory'],
        ['Estate', 'Factory', 'Airport'],
        ['Estate', 'Factory', 'Laboratory'],
        ['Estate', 'Airport', 'Laboratory'],
        ['Factory', 'Airport', 'Laboratory'],
        ['Estate', 'Factory', 'Airport'],
        ['Estate', 'Factory', 'Laboratory'],
        ['Estate', 'Airport', 'Laboratory'],
    ];

    var j = select.faction;

    x = 0.5 * (canvas.width - 1024) + 112;
    y = 0.5 * (canvas.height - 720) + 252 + 95;

    text = 'Buildings';
    ctx.fillStyle = 'black';
    ctx.fillText(text, x, y, 200);
    ctx.fillStyle = 'white';
    ctx.fillText(text, x-1, y-1, 200);

    y = 0.5 * (canvas.height - 720) + 252;

    for (var i = 0; i < 3; ++i) { 
        x = 0.5 * (canvas.width - 1024) + 292 + 205 * i;

        ctx.drawImage(select.card, x, y);

        var f = 0;
        var dir = 0;
        var colourName = j;
        var standing_prefix = "_img/";
        var img = new Image();
        img.src = standing_prefix + "color"+colourName+"/"+buildingNames[j][i]+"_Large_face"+dir+"_"+f+".png";
        ctx.drawImage(img, x + 35, y + 30);

    }

    // Unit cards
    var unitNames = [
        ['Tank_S', 'Copter_S', 'Artillery_T'],
        ['Infantry_S', 'Artillery_S', 'Copter_S'],
        ['Infantry_S', 'Tank_S', 'Artillery_T'],
        ['Infantry_S', 'Copter_S', 'Plane_T'],
        ['Artillery_S', 'Copter_S', 'Tank_T'],
        ['Infantry_S', 'Tank_S', 'Tank_T'],
        ['Infantry_S', 'Artillery_S', 'Tank_T'],
        ['Infantry_S', 'Copter_S', 'Infantry_T'],
    ];
    
        x = 0.5 * (canvas.width - 1024) + 112;
        y = 0.5 * (canvas.height - 720) + 452 + 95;
    
        text = 'Units';
        ctx.fillStyle = 'black';
        ctx.fillText(text, x, y, 200);
        ctx.fillStyle = 'white';
        ctx.fillText(text, x-1, y-1, 200);
    
        y = 0.5 * (canvas.height - 720) + 452;
    
        for (var i = 0; i < 3; ++i) { 
            x = 0.5 * (canvas.width - 1024) + 292 + 205 * i;
    
            ctx.drawImage(select.card, x, y);
    
            var f = 0;
            var dir = 0;
            var colourName = j;
            var standing_prefix = "_img/";
            var img = new Image();
            img.src = standing_prefix + "color"+colourName+"/"+unitNames[j][i]+"_Large_face"+dir+"_"+f+".png";
            ctx.drawImage(img, x + 35, y + 30);
    
        }
    

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

    