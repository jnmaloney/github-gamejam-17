var intro = {

    gameOffFrames: 91,
    gameOffOffset: -8,
    gameOffSrc: 'img/gameoff.png',
    tundraSrc: 'img/title.png'
};


function introMouse(res, e) {
    if (res == 'down') {
        if (intro.selected) {
            setState(gameEngineState_select);
        }
    }
}

function beginAppIntro() {

    if (!intro.gameOffImg) {
        intro.gameOffImg = new Image();
        intro.gameOffImg.src = intro.gameOffSrc;
    }

    if (!intro.tundraImg) {
        intro.tundraImg = new Image();
        intro.tundraImg.src = intro.tundraSrc;
    }

    intro.gameOffCurrentFrame = -1;

    intro.fade = 30;
}

function playAppIntro(dt) {

    // if (intro.gameOffCurrentFrame <= intro.gameOffFrames) {
    //     if (frame % 4 == 0) {
    //         ++intro.gameOffCurrentFrame;
    //     }
    // }

    var h = 99;   
    var y = 0.5 * (canvas.height + h);
    var y0 = y;
    var y1 = y0 + 15 + 24 + 15;
    if (currY > y0 && currY < y1)
        intro.selected = true;
    else
        intro.selected = false;  
}


function drawAppIntro() {
    // Game off
    if (intro.gameOffCurrentFrame <= intro.gameOffFrames) {

        if (intro.gameOffCurrentFrame >= 0)
            drawScreenGif(intro.gameOffImg, 'black');

        if (frameTick % 2 == 0) {
            ++intro.gameOffCurrentFrame;
        }

        return;
    }

    // Transition
    // ...

    // Tundra
    drawScreen(intro.tundraImg, '#bec6d5');
}



function drawScreen(tile, fill) {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = fill ? fill : "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);  

    var width = tile.width;
    var height = tile.height;
    
    // var h = (canvas.height > height) ? height : canvas.height;
    // var w = h * width / height;
    var h = height;
    var w = width;

    var x = 0.5 * (canvas.width - w);
    var y = 0.355 * (canvas.height - h);

    var ox = 0;
    var oy = 0;

    ctx.drawImage(tile, x, y, w, h);

    if (intro.fade > 0)
        fillFade();
    else
        drawAppMenu();
}


function drawAppMenu() {
 
    var w = 340;
    var h = 99;   
    var x = 0.5 * (canvas.width - w);
    var y = 0.5 * (canvas.height + h);


    ctx.fillStyle = "#aaa";
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    var text = 'New Game'
    var x0 = 0.5 * canvas.width;
    var y0 = y + 15 + 24;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText(text, x0, y0, 200);
    ctx.fillStyle = intro.selected ? 'yellow' : 'white';
    ctx.fillText(text, x0-1, y0-1, 200);

    y0 = y0 + 15 + 24;
    text = 'Quit to Desktop';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText(text, x0, y0, 200);
    ctx.fillStyle = 'white';
    ctx.fillText(text, x0-1, y0-1, 200)
}


function drawScreenGif(tile, fill) {
    
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.fillStyle = fill ? fill : "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);  
          
        var width = tile.width;
        var height = tile.height;
        
        var h = 250;
        var w = 315;
    
        var x = 0.5 * (canvas.width - w);
        var y = 0.5 * (canvas.height - h);
    
        var f = (intro.gameOffCurrentFrame + intro.gameOffOffset + intro.gameOffFrames) % intro.gameOffFrames;
        var ox = 315 * (f % 8);
        var oy = 250 * Math.floor(f/8);
        //console.log(ox + ', ' + oy);
    
        ctx.drawImage(tile, ox, oy, 315, 250, 
            x, y, w, h);
    }
    



    function fillFade() {
        var a = intro.fade / 30.0;
        var tile = intro.gameOffImg;
        --intro.fade;

        var f = 91-8-13 + (frame*15 + frameTick) % 13;
        var ox = 315 * (f % 8);
        var oy = 250 * Math.floor(f/8);

        var x = 0;
        var y = 0;
        var w = canvas.width;
        var h = canvas.height;

        ctx.save();
        ctx.globalAlpha = a;

        ctx.drawImage(tile, ox, oy, 315, 250, 
            x, y, w, h);
            
        ctx.restore();
    }
