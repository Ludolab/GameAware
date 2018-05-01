var APGHelper = (function () {
    function APGHelper() {
    }
    APGHelper.ScreenX = function (val) { return val / 10000 * 1024; };
    APGHelper.ScreenY = function (val) { return (1 - val / 10000) * (768 - 96 - 96); };
    return APGHelper;
}());
function CacheGameAssets(c) {
    c.images('assets', ['hudselect.png', 'TowerInformationPopup.png', 'background.png', 'EnemyInformationPopup.png']);
    c.sounds('assets', ['click.mp3']);
}
function InitializeGame(apg) {
    var phaserGameWorld = apg.w;
    var lastClickDelay = 0;
    var clickSound = apg.g.add.audio('assets/click.mp3', .4, false);
    var serverMetadataForFrame = null;
    var metadataForFrame = null;
    var enemyMetadataForFrame = null;
    apg.ResetServerMessageRegistry();
    apg.Register("server", function (updatedMetadataForNewFrame) {
        serverMetadataForFrame = updatedMetadataForNewFrame;
        metadataForFrame = serverMetadataForFrame.towerInfo;
        enemyMetadataForFrame = serverMetadataForFrame.enemyInfo;
    });
    {
        var towerID = 0;
        var towerMouseHighlight = new Phaser.Sprite(apg.g, 0, 0, 'assets/TowerInformationPopup.png');
        towerMouseHighlight.anchor = new Phaser.Point(0.4, 0.75);
        towerMouseHighlight.scale = new Phaser.Point(1, 1);
        towerMouseHighlight.update = function () {
            lastClickDelay--;
            if (metadataForFrame != null) {
                var overAtower = false;
                var towerIndex = -1;
                for (var k = 0; k < metadataForFrame.items.length; k++) {
                    var topX = APGHelper.ScreenX(metadataForFrame.items[k].x);
                    var topY = APGHelper.ScreenY(metadataForFrame.items[k].y);
                    var bottomX = APGHelper.ScreenX(metadataForFrame.items[k].scaleX + metadataForFrame.items[k].x);
                    var bottomY = APGHelper.ScreenY(metadataForFrame.items[k].y - metadataForFrame.items[k].scaleY);
                    if (apg.g.input.activePointer.y >= bottomY && apg.g.input.activePointer.y <= bottomY) {
                        console.log("y is correct");
                    }
                    if (apg.g.input.activePointer.x >= topX && apg.g.input.activePointer.x <= bottomX &&
                        apg.g.input.activePointer.y >= topY && apg.g.input.activePointer.y <= bottomY) {
                        console.log("correct position");
                        towerIndex = k;
                        overAtower = true;
                        towerMouseHighlight.x = topX;
                        towerMouseHighlight.y = topY;
                        towerMouseHighlight.visible = true;
                        towerID = towerIndex;
                    }
                }
                if (!overAtower) {
                    towerMouseHighlight.visible = false;
                    towerID = -1;
                    lastClickDelay = 20;
                }
            }
        };
        phaserGameWorld.addChild(towerMouseHighlight);
        var backgroundCoveringBinaryEncoding = new Phaser.Sprite(apg.g, -640, -320, 'assets/background.png');
        phaserGameWorld.addChild(backgroundCoveringBinaryEncoding);
        var towerStatsText = new Phaser.Text(apg.g, towerMouseHighlight.x, towerMouseHighlight.y, "", { font: '12px Helvetica', fill: '#C0C0C0' });
        towerStatsText.anchor = new Phaser.Point(1.0, 1.35);
        var towerStatsFireBar = new Phaser.Graphics(apg.g, 0, 0);
        towerStatsText.update = function () {
            if (towerID != -1 && metadataForFrame != null && metadataForFrame != undefined) {
                towerStatsText.x = towerMouseHighlight.x;
                towerStatsText.y = towerMouseHighlight.y;
                towerStatsText.visible = true;
                towerStatsText.text = metadataForFrame.items[towerID].name + "\nFIRE RATE: \nATTACK:";
                towerStatsFireBar.width = metadataForFrame.items[towerID].fireRate * 100;
                towerStatsFireBar.height = 10;
                towerStatsFireBar.x = towerMouseHighlight.x;
                towerStatsFireBar.y = towerMouseHighlight.y;
                towerStatsFireBar.visible = true;
                towerStatsFireBar.beginFill(0xff000);
                towerStatsFireBar.drawRect(towerStatsFireBar.x, towerStatsFireBar.y, towerStatsFireBar.width, 100);
                towerStatsFireBar.endFill();
            }
            else {
                towerStatsText.visible = false;
                towerStatsFireBar.kill();
            }
        };
        phaserGameWorld.addChild(towerStatsText);
    }
    {
        var enemyID = 0;
        var waveNumber = -1;
        var waveImages = new Array();
        var waveText = new Array();
        var enemyInformationArea = new Phaser.Sprite(apg.g, 800, 75, 'assets/background.png');
        enemyInformationArea.anchor = new Phaser.Point(0, 0);
        enemyInformationArea.scale = new Phaser.Point(0.35, 0.9);
        enemyInformationArea.update = function () {
            if (enemyMetadataForFrame != null) {
                if (enemyMetadataForFrame.waveNumber != waveNumber) {
                    for (var i = 0; i < waveImages.length; i++) {
                        phaserGameWorld.removeChild(waveImages[i]);
                    }
                    for (var i = 0; i < enemyMetadataForFrame.info.length; i++) {
                        var enemyInformationPopup = new Phaser.Sprite(apg.g, enemyInformationArea.x + 20, i * 100 + enemyInformationArea.y + 20, 'assets/EnemyInformationPopup.png');
                        enemyInformationPopup.update = function () {
                        };
                        phaserGameWorld.addChild(enemyInformationPopup);
                        var enemyInformationText = new Phaser.Text(apg.g, 100, 0, "", { font: '12px Helvetica', fill: '#C0C0C0' });
                        enemyInformationText.anchor = new Phaser.Point(0, 0);
                        enemyInformationText.text = enemyMetadataForFrame.info[i].enemyName + "\nHEALTH: " + enemyMetadataForFrame.info[i].health + "\nSPEED: " + enemyMetadataForFrame.info[i].speed + "\nATTACK:" + enemyMetadataForFrame.info[i].attack;
                        enemyInformationPopup.addChild(enemyInformationText);
                        waveImages.push(enemyInformationPopup);
                        waveText.push(enemyInformationText);
                        console.log("created something");
                    }
                    waveNumber = enemyMetadataForFrame.waveNumber;
                }
            }
        };
        phaserGameWorld.addChild(enemyInformationArea);
    }
}
//# sourceMappingURL=GameLogic.js.map