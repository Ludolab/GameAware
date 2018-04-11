var APGHelper = (function () {
    function APGHelper() {
    }
    APGHelper.ScreenX = function (val) { return val / 10000 * 1024; };
    APGHelper.ScreenY = function (val) { return (1 - val / 10000) * (768 - 96 - 96); };
    return APGHelper;
}());
function CacheGameAssets(c) {
    c.images('assets', ['hudselect.png', 'TowerInformationPopup.png', 'background.png']);
    c.sounds('assets', ['click.mp3']);
}
function InitializeGame(apg) {
    var phaserGameWorld = apg.w;
    var metadataForFrame = null;
    var lastClickDelay = 0;
    var towerID = 0;
    var clickSound = apg.g.add.audio('assets/click.mp3', .4, false);
    apg.ResetServerMessageRegistry();
    apg.Register("towers", function (updatedMetadataForNewFrame) {
        metadataForFrame = updatedMetadataForNewFrame;
    });
    var towerMouseHighlight = new Phaser.Sprite(apg.g, 0, 0, 'assets/TowerInformationPopup.png');
    towerMouseHighlight.anchor = new Phaser.Point(0.4, 0.75);
    towerMouseHighlight.scale = new Phaser.Point(1, 1);
    towerMouseHighlight.update = function () {
        lastClickDelay--;
        if (metadataForFrame != null) {
            var overAtower = false;
            var towerIndex = -1;
            for (var k = 0; k < metadataForFrame.items.length; k++) {
                var x = APGHelper.ScreenX(metadataForFrame.items[k].x);
                var y = APGHelper.ScreenY(metadataForFrame.items[k].y);
                var scaleX = APGHelper.ScreenX(metadataForFrame.items[k].scaleX);
                var scaleY = APGHelper.ScreenY(metadataForFrame.items[k].scaleY);
                if (Math.abs(apg.g.input.activePointer.x - x) < 48 && Math.abs(apg.g.input.activePointer.y - y) < 48) {
                    towerIndex = k;
                    overAtower = true;
                    towerMouseHighlight.x = x;
                    towerMouseHighlight.y = y;
                    towerMouseHighlight.visible = true;
                }
            }
            if (!overAtower) {
                towerMouseHighlight.visible = false;
                if (apg.g.input.activePointer.isDown && lastClickDelay <= 0) {
                    towerID = -1;
                    lastClickDelay = 20;
                }
            }
            else {
                if (apg.g.input.activePointer.isDown && lastClickDelay <= 0) {
                    towerID = towerIndex;
                    clickSound.play();
                    lastClickDelay = 20;
                }
            }
        }
    };
    phaserGameWorld.addChild(towerMouseHighlight);
    var towerTargetGraphic = new Phaser.Sprite(apg.g, 0, 0, 'assets/hudselect.png');
    towerTargetGraphic.blendMode = PIXI.blendModes.ADD;
    towerTargetGraphic.anchor = new Phaser.Point(.5, .5);
    towerTargetGraphic.scale = new Phaser.Point(1, 1);
    towerTargetGraphic.update = function () {
        if (towerID != -1 && metadataForFrame != null && metadataForFrame != undefined) {
            towerTargetGraphic.visible = true;
            towerTargetGraphic.x = APGHelper.ScreenX(metadataForFrame.items[towerID].x);
            towerTargetGraphic.y = APGHelper.ScreenY(metadataForFrame.items[towerID].y);
        }
        else
            towerTargetGraphic.visible = false;
    };
    phaserGameWorld.addChild(towerTargetGraphic);
    var backgroundCoveringBinaryEncoding = new Phaser.Sprite(apg.g, -640, -320, 'assets/background.png');
    phaserGameWorld.addChild(backgroundCoveringBinaryEncoding);
    var towerStatsText = new Phaser.Text(apg.g, 20, 10, "", { font: '16px Caveat Brush', fill: '#112' });
    towerStatsText.update = function () {
        if (towerID != -1 && metadataForFrame != null && metadataForFrame != undefined) {
            towerStatsText.visible = true;
            towerStatsText.text = "ID: " + towerID + "\nScale " + Math.floor(metadataForFrame.items[towerID].scaleX / 10000 * 48);
        }
        else
            towerStatsText.visible = false;
    };
    phaserGameWorld.addChild(towerStatsText);
}
//# sourceMappingURL=GameLogic.js.map