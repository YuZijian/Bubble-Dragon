var radius = 20;
var originpoint = { x: 60, y: 60 };
var shootpoint = { x: 300, y: 600 };
var waitpoint = { x: 500, y: 600 };
var walls = [40, 560];
var maxangle = Math.PI * 8 / 18;


var balls = [];
var toprow = 0;
var currentball = 0,
    readyball = 0,
    waitball = 0,
    bomb = 0;

var gamemode = 0;
var shootable = 1;
var angle = 0;
var score = 0;

var shootcount = 0,
    bombcount = 0;
var boomcount = 0;
var timer;

var dropballs_list = [];
var removeballs_list = [];

function startgame(mode) {
    score = 0;
    setscore(0);
    gamemode = mode;
    let line_num = 10;
    if (gamemode == 3) {
        line_num = 6;
        timer = setInterval(moveall_mode_3, 300);
    }

    producewaitball();
    app.ticker.add(waitballin);
    app.ticker.add(removeballsinlist);

    for (let i = 0; i < line_num; i++) {
        addline();
        moveallballs(radius * Math.sqrt(3));
    }
    removeempty();
}

function resetdata() {
    app.ticker.remove(moving);
    app.ticker.remove(waitballin);
    app.ticker.remove(removeballsinlist);
    app.ticker.remove(boom);

    clearInterval(timer);

    for (let i in balls)
        for (let j in balls[i])
            stages[2].removeChild(balls[i][j].sprite);
    for (let i in dropballs_list)
        stages[2].removeChild(dropballs_list[i].sprite);
    for (let i in removeballs_list)
        stages[2].removeChild(removeballs_list[i].sprite);

    stages[2].removeChild(currentball.sprite);
    stages[2].removeChild(readyball.sprite);
    stages[2].removeChild(waitball.sprite);
    stages[2].removeChild(bomb);

    balls = [];
    dropballs_list = [];
    removeballs_list = [];
    toprow = 0;
    originpoint = { x: 60, y: 60 };
    topboard.position.y = 40;
    currentball = 0;
    readyball = 0;
    waitball = 0;
    bomb = 0;

    shootable = 1;
    angle = 0;

    shootcount = 0;
    bombcount = 0;
    timecount = 0;
    boomcount = 0;
}

function createball(x, y, color) {
    var ball = new PIXI.extras.TilingSprite(balltexture, 2 * radius, 2 * radius);
    ball.tilePosition.x = 2 * radius * (1 - color);
    ball.tilePosition.y = 0;
    ball.pivot.x = radius;
    ball.pivot.y = radius;
    ball.position.x = x;
    ball.position.y = y;
    var bubble = {
        sprite: ball,
        color: color,
        setColor: function(color) {
            this.sprite.tilePosition.x = 2 * radius * (1 - color);
        },
        setPosX: function(x) {
            this.sprite.position.x = x;
        },
        setPosY: function(y) {
            this.sprite.position.y = y;
        },
        PosX: function() {
            return this.sprite.position.x;
        },
        PosY: function() {
            return this.sprite.position.y;
        },
    };
    return bubble;
}

function transformtoxy(row, column) {
    return { x: originpoint.x + (2 * column + row % 2) * radius, y: originpoint.y + Math.sqrt(3) * radius * row };
}

function addball(row, column, color) {
    if (ifexistball(row, column)) return;
    if (balls[row] == undefined)
        balls[row] = [];
    var p = transformtoxy(row, column);
    balls[row][column] = createball(p.x, p.y, color);
    balls[row][column].sprite.mask = maskarea;
    stages[2].addChild(balls[row][column].sprite);
}

function addline() {
    if (toprow == 0) {
        balls.splice(0, 0, [], []);
        originpoint.y = originpoint.y - Math.sqrt(3) * radius * 2;
        toprow = 1;
    } else if (toprow == 1) {
        toprow = 0;
    }
    for (let i = 0; i < 13 - toprow % 2; i++)
        addball(toprow, i, rand(1, 5));
}

function moveallballs(dis) {
    originpoint.y += dis;
    for (let i in balls)
        for (let j in balls[i])
            balls[i][j].sprite.position.y += dis;
}

function moveshooter(event) {
    var pos = event.data.getLocalPosition(this.parent);
    if (pos.x < 40 || pos.x > 560 || pos.y < 40 || pos.y > 640) return;
    var dy = shootpoint.y - pos.y;
    var dx = pos.x - shootpoint.x;
    var a = Math.atan(dx / dy) + (dy > 0 ? 0 : Math.PI) * (dx > 0 ? 1 : -1);
    if (Math.abs(a) < maxangle) {
        arrow.rotation = a;
    }
}

function shootball(event) {
    var pos = event.data.getLocalPosition(this.parent);
    var dy = shootpoint.y - pos.y;
    var dx = pos.x - shootpoint.x;
    var a = Math.atan(dx / dy) + (dy > 0 ? 0 : Math.PI) * (dx > 0 ? 1 : -1);
    if (Math.abs(a) < maxangle)
        arrow.rotation = a;
    else arrow.rotation = (a > 0 ? 1 : -1) * maxangle;
    if (shootable == 0) {
        angle = arrow.rotation;
        currentball = readyball;
        shootable = 2;
        app.ticker.add(moving);
        app.ticker.add(waitballin);
    }
}

function waitballin() {
    var x = waitball.PosX() - 10;
    if (x < shootpoint.x) {
        waitball.setPosX(shootpoint.x);
        waitballarrive();
        return;
    }
    waitball.setPosX(x);
}

function waitballarrive() {
    app.ticker.remove(waitballin);
    readyball = waitball;
    shootable--;
    producewaitball();
}

function producewaitball() {
    var ran;
    if ((bombcount + 1) * 1000 <= score) {
        ran = 6;
        bombcount = parseInt(score/1000);
    } else ran = rand(1, 5);

    waitball = createball(waitpoint.x, waitpoint.y, ran);
    stages[2].addChild(waitball.sprite);
    waitball.sprite.mask = maskarea;
}

function ifexistball(row, column) {
    if (balls[row] == undefined)
        return false;
    if (balls[row][column] == undefined)
        return false;
    return true;
}

function moving() {
    let x = currentball.PosX() + 15 * Math.sin(angle);
    let y = currentball.PosY() - 15 * Math.cos(angle);
    for (let i in walls) {
        if (Math.abs(x - walls[i]) < radius) {
            x = walls[i] - radius * (angle > 0 ? 1 : -1);
            y = currentball.PosY() - (x - currentball.PosX()) / Math.tan(angle);
            angle = -angle;
            currentball.setPosX(x);
            currentball.setPosY(y);
            return;
        }
    }
    
    if (testImpact({ x: x, y: y })) {
        let pos = { x: currentball.PosX(), y: currentball.PosY() };
        for (let i = 0; i < 4; i++) {
            let mid = { x: (pos.x + x) / 2, y: (pos.y + y) / 2 };
            if (testImpact(mid)) {
                x = mid.x;
                y = mid.y;
            } else pos = { x: mid.x, y: mid.y };
        }
        let pos_end = closestpos({ x: x, y: y });
        let ball_pos = transformtoxy(pos_end.row, pos_end.column);
        currentball.setPosX(ball_pos.x);
        currentball.setPosY(ball_pos.y);
        moveend(pos_end.row, pos_end.column);
        return;
    }
    
    if(y < originpoint.y + toprow * radius * Math.sqrt(3)){
        if(gamemode == 1 || gamemode == 2){
            y = originpoint.y + toprow * radius * Math.sqrt(3);
            x = currentball.PosX() + (currentball.PosY() - y) * Math.tan(angle);
            let p = closestpos({ x: x, y: y });
            let pos = transformtoxy(p.row, p.column);
            currentball.setPosX(pos.x);
            currentball.setPosY(pos.y);
            moveend(p.row, p.column);
            return;
        }
        else if(gamemode == 3){
            outframe();
            return;
        }
    }
    
    currentball.setPosX(x);
    currentball.setPosY(y);
}

function testImpact(pos) {
    let row = parseInt((pos.y - originpoint.y) / (Math.sqrt(3) * radius));
    let s = ((pos.y - originpoint.y) / Math.sqrt(3)) % (2 * radius);
    let column = parseInt((pos.x - originpoint.x + s) / (2 * radius)) - parseInt(s / radius);
    for (let i = Math.max(row - 1, 0); i < row + 3; i++)
        for (let j = Math.max(column - 1, 0); j < column + 3; j++)
            if (ifexistball(i, j)) {
                let ball_pos = transformtoxy(i, j);
                if ((ball_pos.x - pos.x) * (ball_pos.x - pos.x) + (ball_pos.y - pos.y) * (ball_pos.y - pos.y) < radius * radius * 3.5) {
                    return true;
                }
            }
    return false;
}

function closestpos(pos) {
    let row = parseInt((pos.y - originpoint.y) / (Math.sqrt(3) * radius));
    let s = ((pos.y - originpoint.y) / Math.sqrt(3)) % (2 * radius);
    if (s > radius)
        s = 2 * radius - s;
    let column = parseInt((pos.x - originpoint.x - s) / (2 * radius));
    let min_pos_row, min_pos_column;
    let min_distance2 = 4 * radius * radius;
    let dis;
    for (let i = row; i < row + 2; i++)
        for (let j = column; j < column + 2; j++) {
            if (ifexistball(i, j))
                continue;
            ball_pos = transformtoxy(i, j);
            dis = (ball_pos.x - pos.x) * (ball_pos.x - pos.x) + (ball_pos.y - pos.y) * (ball_pos.y - pos.y);
            if (dis < min_distance2) {
                min_distance2 = dis;
                min_pos_row = i;
                min_pos_column = j;
            }
        }
    return { row: min_pos_row, column: min_pos_column };
}

function moveend(row, column) {
    app.ticker.remove(moving);
    if (balls[row] == undefined)
        balls[row] = [];
    balls[row][column] = currentball;

    if (balls[row][column].color == 6) {
        let n = boomball(row, column);    
    } else {
        let n = removeballs(row, column);
        score += n * (n - 1) * 20;
    }

    let n2 = dropballs();
    score += n2 * n2 * 10;
    setscore(score);

    currentball = readyball;
    shootable--;

    if (gamemode == 1) addball_mode1();
    else if (gamemode == 2) addball_mode2();

    removeempty();

    if (balls.length == toprow) {
        clearInterval(timer);
        shootable = -1;
        timer = setTimeout(victory, 1500);
    }

    checkdefeated()
}

function outframe(){
    app.ticker.remove(moving);
    stages[2].removeChild(currentball.sprite);
    shootable--;
}

function findneighbors(row, column) {
    var res = [];
    if (row % 2 == 0) {
        res.push({ row: row - 1, column: column - 1 });
        res.push({ row: row - 1, column: column });
        res.push({ row: row, column: column - 1 });
        res.push({ row: row, column: column + 1 });
        res.push({ row: row + 1, column: column - 1 });
        res.push({ row: row + 1, column: column });
    } else {
        res.push({ row: row - 1, column: column });
        res.push({ row: row - 1, column: column + 1 });
        res.push({ row: row, column: column - 1 });
        res.push({ row: row, column: column + 1 });
        res.push({ row: row + 1, column: column });
        res.push({ row: row + 1, column: column + 1 });
    }
    for (let i = 0; i < res.length; i++) {
        if (res[i].row < 0 || res[i].column < 0) {
            res.splice(i, 1);
            i--;
        }
    }
    return res;
}

function removeballs(row, column) {
    let color = balls[row][column].color;
    let sameballs = [{ row: row, column: column }];
    let neighbors = findneighbors(row, column);
    for (let i = 0; i < sameballs.length; i++) {
        neighbors = findneighbors(sameballs[i].row, sameballs[i].column);
        for (let j in neighbors) {
            if (ifexistball(neighbors[j].row, neighbors[j].column)) {
                if (balls[neighbors[j].row][neighbors[j].column].color == color) {
                    let flag = 1;
                    for (let k in sameballs)
                        if (sameballs[k].row == neighbors[j].row && sameballs[k].column == neighbors[j].column) {
                            flag = 0;
                            break;
                        }
                    if (flag)
                        sameballs.push({ row: neighbors[j].row, column: neighbors[j].column });
                }
            }
        }
    }
    if (sameballs.length >= 3) {
        for (let i in sameballs) {
            removeballs_list.push(balls[sameballs[i].row][sameballs[i].column]);
            delete balls[sameballs[i].row][sameballs[i].column];
        }
        return sameballs.length;
    }
    return 0;
}

function boomball(row, column) {
    bomb = new PIXI.extras.TilingSprite(boomtexture, 200, 200);
    bomb.tilePosition.y = 0;
    bomb.pivot.x = 100;
    bomb.pivot.y = 100;
    bomb.position.x = balls[row][column].PosX();
    bomb.position.y = balls[row][column].PosY();

    stages[2].removeChild(balls[row][column].sprite);
    delete balls[row][column];
    let n = 1;
    let neighbors = findneighbors(row, column);
    for (let i in neighbors) {
        if (ifexistball(neighbors[i].row, neighbors[i].column)) {
            stages[2].removeChild(balls[neighbors[i].row][neighbors[i].column].sprite);
            n++;
            delete balls[neighbors[i].row][neighbors[i].column];
        }
    }

    stages[2].addChild(bomb);
    app.ticker.add(boom);
    return n;
}

function boom() {
    boomcount++;
    if (boomcount % 2 == 0) {
        boomcount = 0;
        bomb.tilePosition.y -= 200;
        if (bomb.tilePosition.y <= -2000) {
            app.ticker.remove(boom);
            stages[2].removeChild(bomb);
        }
    }
}

function dropballs() {
    let n = 0;
    for (let i in balls)
        for (let j in balls[i])
            balls[i][j].dropflag = 1;
    for (let i in balls[toprow])
        changeflag(toprow, parseInt(i));
    for (let i in balls) {
        if (parseInt(i) < toprow) continue;
        for (let j in balls[i])
            if (balls[i][j].dropflag) {
                dropballs_list.push(balls[i][j]);
                n++;
                delete balls[i][j];
            }
    }
    return n;
}

function changeflag(row, column) {
    if (balls[row][column].dropflag == 0) return;
    balls[row][column].dropflag = 0;
    let neighbors = findneighbors(row, column);
    for (let i in neighbors)
        if (ifexistball(neighbors[i].row, neighbors[i].column))
            if (balls[neighbors[i].row][neighbors[i].column].dropflag == 1)
                changeflag(neighbors[i].row, neighbors[i].column)
}

function rand(min, max) {
    let range = max + 1 - min;
    let randnum = min + Math.floor(Math.random() * range);
    return randnum;
}

function removeempty() {
    for (let i in balls) {
        if (parseInt(i) < toprow) continue;
        let flag = 1;
        for (let j = 0; j < balls[i].length; j++)
            if (balls[i][j] != undefined) {
                flag = 0;
                break;
            }
        if (flag) balls.splice(parseInt(i), balls.length - parseInt(i));
    }
}

function addball_mode1() {
    shootcount++;
    if (shootcount % 10 == 0) {
        topboard.position.y += radius * Math.sqrt(3);
        moveallballs(radius * Math.sqrt(3));
    }
}

function addball_mode2() {
    let n = 0;
    for (let i in balls)
        for (let j in balls[i])
            n++;
    if (n < 30) {
        addline();
        moveallballs(radius * Math.sqrt(3));
    }
}

function moveall_mode_3() {
    moveallballs(1);
    checkdefeated();
    addball_mode3();
}

function addball_mode3() {
    if (originpoint.y + toprow * radius * Math.sqrt(3) > 60)
        addline();
}

function removeballsinlist() {
    for (let i = 0; i < removeballs_list.length; i++) {
        let y = removeballs_list[i].sprite.tilePosition.y - 40;
        if (y > -240) removeballs_list[i].sprite.tilePosition.y = y;
        else {
            stages[2].removeChild(removeballs_list[i].sprite);
            removeballs_list.splice(i, 1);
            i--;
        }
    }
    for (let i = 0; i < dropballs_list.length; i++) {
        let y = dropballs_list[i].PosY() + 20;
        if (y < 700) dropballs_list[i].setPosY(y);
        else {
            stages[2].removeChild(dropballs_list[i].sprite);
            dropballs_list.splice(i, 1);
            i--;
        }
    }
}

function checkdefeated() {
    if ((balls.length - 1) * radius * Math.sqrt(3) + originpoint.y >= 565) {
        clearInterval(timer);
        shootable = -1;
        timer = setTimeout(defeated, 1500);
    }
}


function victory() {
    app.stage = stages[3];
    resetdata();
    setfinalscore(score);
    endtext.setText('游戏胜利');
}

function defeated() {
    app.stage = stages[3];
    resetdata();
    setfinalscore(score);
    endtext.setText('游戏结束');
}