function beginButtonOver() {
    this.tilePosition.y = -150;
    this.isOver = true;
}

function beginButtonOut() {
    this.tilePosition.y = 0;
    this.isOver = false;
}

function beginButtonDown() {
    app.stage = stages[1];
}

function selectButtonOver() {
    this.tilePosition.y = -100;
    this.isOver = true;
}

function selectButtonOut() {
    this.tilePosition.y = 0;
    this.isOver = false;
}

function selectMode1() {
    app.stage = stages[2];
    startgame(1);
}

function selectMode2() {
    app.stage = stages[2];
    startgame(2);
}

function selectMode3() {
    app.stage = stages[2];
    startgame(3);
}

function funcButtonOver() {
    this.tilePosition.y = -120;
    this.isOver = true;
}

function funcButtonOut() {
    this.tilePosition.y = 0;
    this.isOver = false;
}

function returnHome() {
    resetdata();
    app.stage = stages[1];
}

function restartGame() {
    resetdata();
    app.stage = stages[2];
    startgame(gamemode);
}