// ---------------------------------------------------------------------------
// -        LOOP
// ---------------------------------------------------------------------------
var now,
    delta = 0.0,
    then = timestamp();
var frame = 0;
var frameTick = 0;
var interval = 1000.0 / 60.0;
function loop() {
    now = timestamp();
    delta += Math.min(1000, (now - then));
    while(delta > interval) {
        delta -= interval;
        gameState(interval / 1000);
        if ((++frameTick)%15 == 0) ++frame;
    }
    //draw
    then = now;
    requestAnimationFrame(loop);
}
function gameState(dt) {
    // Draw
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var srcX = 0, srcY = 0;
    var width = 128, height = 64;
    var x = 0, y = 0;
    var tx = canvas.width / width + 2;
    var ty = canvas.height / height + 2;
    var off_x = stage_x % width - 64;
    var off_y = stage_y % height;
    var i_off = stage_x == 0 ? 0 : -Math.floor(Math.abs(stage_x / width)) * Math.abs(stage_x) / stage_x;
    var j_off = stage_y == 0 ? 0 : -Math.floor(Math.abs(stage_y / height)) * Math.abs(stage_y) / stage_y;
    off_x -= width;
    off_y -= height;
    for (var i = 0+i_off; i < tx+i_off; ++i) {
        for (var j = 0+j_off; j < ty+j_off; ++j) {
            x = off_x + (i-i_off) * width;
            y = off_y + (j-j_off) * height;
            var t = (i ==1 && j == 2) ? 2 :
                    ((j%2 == 0) && ((i+j)%3 == 0)) ? 0 :
                    1;
            var tile = tiles[t];
            ctx.drawImage(tile, srcX, srcY, width, height, x, y, width, height);
        }
    }

    // Cursor
    if (place) {
        var tt = ScreenToTile(currX, currY);
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

    // Entities
    for (var i = 0; i < entityBatch.length; ++i) {
        var entity = entityBatch[i][frame%4];
        x = entity.ppx + stage_x;
        y = entity.ppy + stage_y;
        width = 248;
        height = 308;
        var tile = entity;
        ctx.drawImage(tile, srcX, srcY, width, height, x, y, width, height);
    }
}
