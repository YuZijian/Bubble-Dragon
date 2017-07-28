var app;
var stages = [];
var buttons = [];

var balltexture, boomtexture;
var topboard, arrow;
var maskarea;
var score_text;

var endtext, finalscore;

function init() {
    app = new PIXI.Application(800, 700, { view: document.getElementById("bubbles") });
    for (let i = 0; i < 4; i++)
        stages[i] = new PIXI.Container();
    createStart();
    createSelect();
    createGame();
    createEnd();
    app.stage = stages[0];
    app.start();
}

function createStart() {
    var mainTexture = PIXI.Texture.fromImage("images/index.png");
    var mainImage = new PIXI.Sprite(mainTexture);
    var beginButtonTexture = PIXI.Texture.fromImage("images/beginButton.png");
    buttons[0] = new PIXI.extras.TilingSprite(beginButtonTexture, 150, 150);
    buttons[0].buttonMode = true;
    buttons[0].interactive = true;
    buttons[0].hitArea = new PIXI.Circle(75, 75, 75);
    buttons[0].position.x = 320;
    buttons[0].position.y = 500;
    buttons[0].on('mouseover', beginButtonOver)
        .on('mouseout', beginButtonOut)
        .on('click', beginButtonDown);
    stages[0].addChild(mainImage);
    stages[0].addChild(buttons[0]);
}

function createSelect() {
    var selectTexture = PIXI.Texture.fromImage("images/selectBackground.png");
    var selectBg = new PIXI.Sprite(selectTexture);
    stages[1].addChild(selectBg);
    var classicalButtonTexture = PIXI.Texture.fromImage("images/classicalMode.png");
    buttons[1] = new PIXI.extras.TilingSprite(classicalButtonTexture, 300, 100);
    var zanButtonTexture = PIXI.Texture.fromImage("images/zanMode.png");
    buttons[2] = new PIXI.extras.TilingSprite(zanButtonTexture, 300, 100);
    var aliveButtonTexture = PIXI.Texture.fromImage("images/aliveMode.png");
    buttons[3] = new PIXI.extras.TilingSprite(aliveButtonTexture, 300, 100);
    for (let i = 1; i <= 3; i++) {
        buttons[i].buttonMode = true;
        buttons[i].interactive = true;
        buttons[i].position.x = 250;
        buttons[i].position.y = 100 + 100 * i;
        buttons[i].on('mouseover', selectButtonOver)
            .on('mouseout', selectButtonOut);
        stages[1].addChild(buttons[i]);
    }
    buttons[1].on('click', selectMode1);
    buttons[2].on('click', selectMode2);
    buttons[3].on('click', selectMode3);
}

function createGame() {
    balltexture = PIXI.Texture.fromImage("images/balls.png");
    boomtexture = PIXI.Texture.fromImage("images/boom.png");

    var gameTexture = PIXI.Texture.fromImage("images/gameBackground.png");
    var gameBg = new PIXI.Sprite(gameTexture);
    stages[2].addChild(gameBg);

    ballsarea = new PIXI.Graphics();
    ballsarea.clear();
    ballsarea.beginFill(0xffffff, 0.3);
    ballsarea.lineStyle(6, 0x000000, 0.7);
    ballsarea.drawRect(37, 37, 526, 606);
    ballsarea.interactive = true;
    ballsarea.on('mousemove', moveshooter);
    ballsarea.on('click', shootball);
    ballsarea.cursor='none';
    stages[2].addChild(ballsarea);

    maskarea = new PIXI.Graphics();
    maskarea.clear();
    maskarea.drawRect(40, 40, 520, 600);
    stages[2].addChild(maskarea);

    topboard = new PIXI.Sprite.fromImage("images/board.png");
    topboard.pivot.y = 600;
    topboard.position.x = 40;
    topboard.position.y = 40;
    topboard.mask = maskarea;
    stages[2].addChild(topboard);

    arrow = new PIXI.Sprite.fromImage("images/arrow.png");
    arrow.pivot.x = radius;
    arrow.pivot.y = 100 - radius;
    arrow.position.x = shootpoint.x;
    arrow.position.y = shootpoint.y;
    stages[2].addChild(arrow);

    var returnTexture = PIXI.Texture.fromImage("images/returnButton.png");
    buttons[4] = new PIXI.extras.TilingSprite(returnTexture, 120, 120);
    var restartTexture = PIXI.Texture.fromImage("images/restartButton.png");
    buttons[5] = new PIXI.extras.TilingSprite(restartTexture, 120, 120);
    for (let i = 4; i <= 5; i++) {
        buttons[i].buttonMode = true;
        buttons[i].interactive = true;
        buttons[i].position.y = 130 * i - 130;
        buttons[i].position.x = 620;
        buttons[i].on('mouseover', funcButtonOver)
            .on('mouseout', funcButtonOut);
        stages[2].addChild(buttons[i]);
    }
    buttons[4].on('click', returnHome);
    buttons[5].on('click', restartGame);

    var scoreTexture = PIXI.Texture.fromImage("images/scoreCircle.png");
    var scoreCircle = new PIXI.Sprite(scoreTexture);
    scoreCircle.position.x = 590;
    scoreCircle.position.y = 45;
    stages[2].addChild(scoreCircle);

    var style1 = {
        fontFamily: 'Arial',
        fontSize: '70px',
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: '#F7EDCA',
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: false,
    };
    var word_score = new PIXI.Text('score', style1);
    word_score.x = 582;
    word_score.y = 60;
    stages[2].addChild(word_score);

    var style2 = {
        fontFamily: 'Arial',
        fontSize: '45px',
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: '#FFD306',
        stroke: '#5B00AE',
        strokeThickness: 2,
        dropShadow: true,
        dropShadowColor: '#5B00AE',
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
    };
    score_text = new PIXI.Text('0', style2);
    setscore(0);
    stages[2].addChild(score_text);
}

function createEnd() {
    var gameTexture = PIXI.Texture.fromImage("images/gameBackground.png");
    var gameBg = new PIXI.Sprite(gameTexture);
    stages[3].addChild(gameBg);

    var returnTexture = PIXI.Texture.fromImage("images/returnButton.png");
    buttons[6] = new PIXI.extras.TilingSprite(returnTexture, 120, 120);
    var restartTexture = PIXI.Texture.fromImage("images/restartButton.png");
    buttons[7] = new PIXI.extras.TilingSprite(restartTexture, 120, 120);
    for (let i = 6; i <= 7; i++) {
        buttons[i].buttonMode = true;
        buttons[i].interactive = true;
        buttons[i].position.y = 520;
        buttons[i].position.x = 240 + 200 * (i - 6);
        buttons[i].on('mouseover', funcButtonOver)
            .on('mouseout', funcButtonOut);
        stages[3].addChild(buttons[i]);
    }
    buttons[6].on('click', returnHome);
    buttons[7].on('click', restartGame);


    var style1 = {
        fontFamily: '华文琥珀',
        fontSize: '100px',
        fontWeight: 'bold',
        padding: 10,
        fill: '#FFD306',
        stroke: '#4a1850',
        strokeThickness: 1,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,

    };
    endtext = new PIXI.Text('游戏结束', style1);
    endtext.position.x = 180;
    endtext.position.y = 80;
    stages[3].addChild(endtext);

    var scoreCircle = new PIXI.Sprite.fromImage("images/scoreCircle.png");
    scoreCircle.scale.x = 1.5;
    scoreCircle.scale.y = 1.5;
    scoreCircle.position.x = 270;
    scoreCircle.position.y = 220;
    stages[3].addChild(scoreCircle);


    var style2 = {
        align: 'center',
        fontFamily: 'Arial',
        fontSize: '70px',
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: '#F7EDCA',
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        lineHeight: 50,
    };
    var finalscore_text = new PIXI.Text('Final\nscore', style2);
    finalscore_text.x = 300;
    finalscore_text.y = 200;
    stages[3].addChild(finalscore_text);

    var style3 = {
        fontFamily: 'Arial',
        fontSize: '80px',
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: '#FFD306',
        stroke: '#5B00AE',
        strokeThickness: 2,
        dropShadow: true,
        dropShadowColor: '#5B00AE',
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
    };
    finalscore = new PIXI.Text('0', style3);
    setfinalscore(10000);
    stages[3].addChild(finalscore);

}

function setscore(score) {
    score_text.setText(score.toString());
    let rect = score_text.getBounds();
    score_text.x = 675 - rect.width / 2;
    score_text.y = 165 - rect.height / 2;
}

function setfinalscore(score) {
    finalscore.setText(score.toString());
    let rect = finalscore.getBounds();
    finalscore.x = 400 - rect.width / 2;
    finalscore.y = 400 - rect.height / 2;
}