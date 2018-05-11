<<<<<<< HEAD
var APGHelper = (function () {
    function APGHelper() {
    }
    APGHelper.ScreenX = function (val) { return val / 10000 * 1024; };
    APGHelper.ScreenY = function (val) { return (1 - val / 10000) * (768 - 96 - 96); };
    return APGHelper;
}());
function CacheGameAssets(c) {
    c.images('assets', ['hudselect.png', 'blueorb.png', 'background.png']);
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> parent of 0dee4be... Merge branch 'master' of https://github.com/raegu14/GameAware
    c.sounds('assets', ['click.mp3']);
}
function InitializeGame(apg) {
    var phaserGameWorld = apg.w;
    var metadataForFrame = null;
    var lastClickDelay = 0;
    var fireflyID = 0;
    var clickSound = apg.g.add.audio('assets/click.mp3', .4, false);
<<<<<<< HEAD
    apg.ResetServerMessageRegistry();
    apg.Register("fireflies", function (updatedMetadataForNewFrame) {
        metadataForFrame = updatedMetadataForNewFrame;
    });
    var fireflyMouseHighlight = new Phaser.Sprite(apg.g, 0, 0, 'assets/blueorb.png');
    fireflyMouseHighlight.blendMode = PIXI.blendModes.ADD;
    fireflyMouseHighlight.anchor = new Phaser.Point(.5, .5);
    fireflyMouseHighlight.scale = new Phaser.Point(1, 1);
    fireflyMouseHighlight.update = function () {
        lastClickDelay--;
        if (metadataForFrame != null) {
            var overAFirefly = false;
            var fireflyIndex = -1;
            for (var k = 0; k < metadataForFrame.items.length; k++) {
                var x = APGHelper.ScreenX(metadataForFrame.items[k].x);
                var y = APGHelper.ScreenY(metadataForFrame.items[k].y);
                if (Math.abs(apg.g.input.activePointer.x - x) < 48 && Math.abs(apg.g.input.activePointer.y - y) < 48) {
                    fireflyIndex = k;
                    overAFirefly = true;
                    fireflyMouseHighlight.x = x;
                    fireflyMouseHighlight.y = y;
                    fireflyMouseHighlight.visible = true;
                }
            }
            if (!overAFirefly) {
                fireflyMouseHighlight.visible = false;
                if (apg.g.input.activePointer.isDown && lastClickDelay <= 0) {
                    fireflyID = -1;
                    lastClickDelay = 20;
                }
            }
            else {
                if (apg.g.input.activePointer.isDown && lastClickDelay <= 0) {
                    fireflyID = fireflyIndex;
                    clickSound.play();
                    lastClickDelay = 20;
                }
            }
        }
    };
    phaserGameWorld.addChild(fireflyMouseHighlight);
    var fireflyTargetGraphic = new Phaser.Sprite(apg.g, 0, 0, 'assets/hudselect.png');
    fireflyTargetGraphic.blendMode = PIXI.blendModes.ADD;
    fireflyTargetGraphic.anchor = new Phaser.Point(.5, .5);
    fireflyTargetGraphic.scale = new Phaser.Point(1, 1);
    fireflyTargetGraphic.update = function () {
        if (fireflyID != -1 && metadataForFrame != null && metadataForFrame != undefined) {
            fireflyTargetGraphic.visible = true;
            fireflyTargetGraphic.x = APGHelper.ScreenX(metadataForFrame.items[fireflyID].x);
            fireflyTargetGraphic.y = APGHelper.ScreenY(metadataForFrame.items[fireflyID].y);
        }
        else
            fireflyTargetGraphic.visible = false;
    };
    phaserGameWorld.addChild(fireflyTargetGraphic);
    var backgroundCoveringBinaryEncoding = new Phaser.Sprite(apg.g, -640, -320, 'assets/background.png');
    phaserGameWorld.addChild(backgroundCoveringBinaryEncoding);
    var fireflyStatsText = new Phaser.Text(apg.g, 20, 10, "", { font: '16px Caveat Brush', fill: '#112' });
    fireflyStatsText.update = function () {
        if (fireflyID != -1 && metadataForFrame != null && metadataForFrame != undefined) {
            fireflyStatsText.visible = true;
            fireflyStatsText.text = "ID: " + fireflyID + "\nScale " + Math.floor(metadataForFrame.items[fireflyID].scale / 10000 * 48);
        }
        else
            fireflyStatsText.visible = false;
    };
    phaserGameWorld.addChild(fireflyStatsText);
}
=======
var APGHelper = (function () {
    function APGHelper() {
    }
    APGHelper.ScreenX = function (val) { return val / 10000 * 1024; };
    APGHelper.ScreenY = function (val) { return (1 - val / 10000) * (768 - 96 - 96); };
    return APGHelper;
}());
function CacheGameAssets(c) {
    c.images('assets', ['blueorb.png', 'hudselect.png', 'TowerInformationPopup.png', 'background.png', 'HoverbuggyInformationPopup.png', 'HoverbossInformationPopup.png', 'HovercopterInformationPopup.png', 'HovertankInformationPopup.png', 'Rectangle.png']);
=======
>>>>>>> parent of 0dee4be... Merge branch 'master' of https://github.com/raegu14/GameAware
    c.sounds('assets', ['click.mp3']);
}
function InitializeGame(apg) {
    var phaserGameWorld = apg.w;
    var metadataForFrame = null;
    var lastClickDelay = 0;
    var fireflyID = 0;
    var clickSound = apg.g.add.audio('assets/click.mp3', .4, false);
=======
>>>>>>> parent of 0dee4be... Merge branch 'master' of https://github.com/raegu14/GameAware
    apg.ResetServerMessageRegistry();
    apg.Register("fireflies", function (updatedMetadataForNewFrame) {
        metadataForFrame = updatedMetadataForNewFrame;
    });
<<<<<<< HEAD
<<<<<<< HEAD
    {
        var towerID = 0;
        var towerMouseHighlight = new Phaser.Sprite(apg.g, 0, 0, 'assets/TowerInformationPopup.png');
        towerMouseHighlight.anchor = new Phaser.Point(0.4, 0.75);
        towerMouseHighlight.scale = new Phaser.Point(1, 1);
        towerMouseHighlight.update = function () {
            lastClickDelay--;
            if (metadataForFrame != null) {
                var overAtower = false;
                for (var k = 0; k < metadataForFrame.items.length; k++) {
                    var leftX = APGHelper.ScreenX(metadataForFrame.items[k].x);
                    var topY = APGHelper.ScreenY(metadataForFrame.items[k].y);
                    var rightX = APGHelper.ScreenX(metadataForFrame.items[k].scaleX + metadataForFrame.items[k].x);
                    var bottomY = APGHelper.ScreenY(metadataForFrame.items[k].y - metadataForFrame.items[k].scaleY);
                    if (apg.g.input.activePointer.x >= leftX && apg.g.input.activePointer.x <= rightX &&
                        apg.g.input.activePointer.y >= topY && apg.g.input.activePointer.y <= bottomY) {
                        overAtower = true;
                        towerMouseHighlight.x = leftX;
                        towerMouseHighlight.y = topY;
                        towerMouseHighlight.visible = true;
                        towerID = k;
                        towerStatsText.text = metadataForFrame.items[towerID].name + "\nFIRE RATE \nATTACK";
                        towerStatsFireBar.scale = new Phaser.Point(metadataForFrame.items[towerID].fireRate * 1.5, 0.6);
                        towerStatsAttackBar.scale = new Phaser.Point(metadataForFrame.items[towerID].attack * 0.75, 0.6);
                    }
=======
=======
>>>>>>> parent of 0dee4be... Merge branch 'master' of https://github.com/raegu14/GameAware
    var fireflyMouseHighlight = new Phaser.Sprite(apg.g, 0, 0, 'assets/blueorb.png');
    fireflyMouseHighlight.blendMode = PIXI.blendModes.ADD;
    fireflyMouseHighlight.anchor = new Phaser.Point(.5, .5);
    fireflyMouseHighlight.scale = new Phaser.Point(1, 1);
    fireflyMouseHighlight.update = function () {
        lastClickDelay--;
        if (metadataForFrame != null) {
            var overAFirefly = false;
            var fireflyIndex = -1;
            for (var k = 0; k < metadataForFrame.items.length; k++) {
                var x = APGHelper.ScreenX(metadataForFrame.items[k].x);
                var y = APGHelper.ScreenY(metadataForFrame.items[k].y);
                if (Math.abs(apg.g.input.activePointer.x - x) < 48 && Math.abs(apg.g.input.activePointer.y - y) < 48) {
                    fireflyIndex = k;
                    overAFirefly = true;
                    fireflyMouseHighlight.x = x;
                    fireflyMouseHighlight.y = y;
                    fireflyMouseHighlight.visible = true;
<<<<<<< HEAD
>>>>>>> parent of 0dee4be... Merge branch 'master' of https://github.com/raegu14/GameAware
=======
>>>>>>> parent of 0dee4be... Merge branch 'master' of https://github.com/raegu14/GameAware
                }
            }
            if (!overAFirefly) {
                fireflyMouseHighlight.visible = false;
                if (apg.g.input.activePointer.isDown && lastClickDelay <= 0) {
                    fireflyID = -1;
                    lastClickDelay = 20;
                }
            }
<<<<<<< HEAD
<<<<<<< HEAD
        };
        phaserGameWorld.addChild(towerMouseHighlight);
        var towerStatsText = new Phaser.Text(apg.g, -85, -85, "", { font: '12px Helvetica', fill: '#C0C0C0' });
        towerStatsText.update = function () { };
        towerMouseHighlight.addChild(towerStatsText);
        var towerStatsFireBar = new Phaser.Sprite(apg.g, -10, -63, 'assets/Rectangle.png');
        towerStatsFireBar.scale = new Phaser.Point(0.6, 0.6);
        towerStatsFireBar.tint = 0xFF6961;
        towerStatsFireBar.update = function () {
            if (towerStatsFireBar.parent != towerMouseHighlight) {
                towerStatsFireBar.parent.removeChild(towerStatsFireBar);
                towerMouseHighlight.addChild(towerStatsFireBar);
            }
        };
        phaserGameWorld.addChild(towerStatsFireBar);
        var towerStatsAttackBar = new Phaser.Sprite(apg.g, -10, -43, 'assets/Rectangle.png');
        towerStatsAttackBar.scale = new Phaser.Point(0.6, 0.6);
        towerStatsAttackBar.tint = 0xE6C76A;
        towerStatsAttackBar.update = function () {
            if (towerStatsAttackBar.parent != towerMouseHighlight) {
                towerStatsAttackBar.parent.removeChild(towerStatsAttackBar);
                towerMouseHighlight.addChild(towerStatsAttackBar);
            }
        };
        phaserGameWorld.addChild(towerStatsAttackBar);
    }
    {
        var enemyID = 0;
        var waveNumber = -1;
        var waveImages = new Array();
        var waveText = new Array();
        var enemyHighlights = new Array();
        var enemyInformationArea = new Phaser.Sprite(apg.g, 800, 75, 'assets/background.png');
        enemyInformationArea.anchor = new Phaser.Point(0, 0);
        enemyInformationArea.scale = new Phaser.Point(0.35, 0.9);
        enemyInformationArea.update = function () {
            if (enemyMetadataForFrame != null) {
                if (enemyMetadataForFrame.waveNumber != waveNumber) {
                    for (var i = 0; i < waveImages.length; i++) {
                        phaserGameWorld.removeChild(waveImages[i]);
                    }
                    var overAenemy = false;
                    for (var i = 0; i < enemyMetadataForFrame.info.length; i++) {
                        var enemyInformationPopup = new Phaser.Sprite(apg.g, enemyInformationArea.x + 20, i * 100 + enemyInformationArea.y + 20, 'assets/' + enemyMetadataForFrame.info[i].enemyName + 'InformationPopup.png');
                        enemyInformationPopup.update = function () {
                            if (enemyMetadataForFrame != null) {
                                var x = enemyInformationPopup.x;
                                var y = enemyInformationPopup.y;
                                var scaleX = enemyInformationPopup.scale.x;
                                var scaleY = enemyInformationPopup.scale.y;
                                if (apg.g.input.activePointer.x >= x && apg.g.input.activePointer.x <= x + scaleX &&
                                    apg.g.input.activePointer.y >= y && apg.g.input.activePointer.y <= y + scaleY) {
                                    enemyID = i;
                                    overAenemy = true;
                                    console.log(overAenemy);
                                    for (var k = 0; k < enemyMetadataForFrame.enemies.length; k++) {
                                        var enemyHighlight = new Phaser.Sprite(apg.g, 0, 0, 'assets/blueorb.png');
                                        enemyHighlight.x = APGHelper.ScreenX(enemyMetadataForFrame.enemies[k].x);
                                        enemyHighlight.y = APGHelper.ScreenY(enemyMetadataForFrame.enemies[k].y);
                                        enemyHighlight.visible = true;
                                        phaserGameWorld.addChild(enemyHighlight);
                                        enemyHighlights.push(enemyHighlight);
                                    }
                                }
                            }
                        };
                        phaserGameWorld.addChild(enemyInformationPopup);
                        var enemyInformationText = new Phaser.Text(apg.g, 100, 10, "", { font: '12px Helvetica', fill: '#C0C0C0' });
                        enemyInformationText.anchor = new Phaser.Point(0, 0);
                        enemyInformationText.text = enemyMetadataForFrame.info[i].enemyName + "\nHealth: " + enemyMetadataForFrame.info[i].health + "\nSpeed: " + enemyMetadataForFrame.info[i].speed + "\nAttack:" + enemyMetadataForFrame.info[i].attack;
                        enemyInformationPopup.addChild(enemyInformationText);
                        var enemyStatsHealthBar = new Phaser.Sprite(apg.g, -10, -63, 'assets/Rectangle.png');
                        enemyStatsHealthBar.scale = new Phaser.Point(0.6, 0.6);
                        enemyStatsHealthBar.tint = 0xFF6961;
                        enemyStatsHealthBar.update = function () {
                            if (enemyStatsHealthBar.parent != enemyInformationPopup) {
                                enemyStatsHealthBar.parent.removeChild(enemyStatsHealthBar);
                                enemyInformationPopup.addChild(enemyStatsHealthBar);
                            }
                        };
                        phaserGameWorld.addChild(enemyStatsHealthBar);
                        var enemyStatsSpeedBar = new Phaser.Sprite(apg.g, -10, -43, 'assets/Rectangle.png');
                        towerStatsAttackBar.scale = new Phaser.Point(0.6, 0.6);
                        towerStatsAttackBar.tint = 0xE6C76A;
                        towerStatsAttackBar.update = function () {
                            if (towerStatsAttackBar.parent != towerMouseHighlight) {
                                towerStatsAttackBar.parent.removeChild(towerStatsAttackBar);
                                towerMouseHighlight.addChild(towerStatsAttackBar);
                            }
                        };
                        phaserGameWorld.addChild(towerStatsAttackBar);
                        waveImages.push(enemyInformationPopup);
                        waveText.push(enemyInformationText);
                    }
                    if (!overAenemy) {
                        enemyID = -1;
                        for (var i = 0; i < enemyHighlights.length; i++) {
                            phaserGameWorld.removeChild(enemyHighlights[i]);
                        }
                    }
                    waveNumber = enemyMetadataForFrame.waveNumber;
=======
=======
>>>>>>> parent of 0dee4be... Merge branch 'master' of https://github.com/raegu14/GameAware
            else {
                if (apg.g.input.activePointer.isDown && lastClickDelay <= 0) {
                    fireflyID = fireflyIndex;
                    clickSound.play();
                    lastClickDelay = 20;
<<<<<<< HEAD
>>>>>>> parent of 0dee4be... Merge branch 'master' of https://github.com/raegu14/GameAware
=======
>>>>>>> parent of 0dee4be... Merge branch 'master' of https://github.com/raegu14/GameAware
                }
            }
        }
    };
    phaserGameWorld.addChild(fireflyMouseHighlight);
    var fireflyTargetGraphic = new Phaser.Sprite(apg.g, 0, 0, 'assets/hudselect.png');
    fireflyTargetGraphic.blendMode = PIXI.blendModes.ADD;
    fireflyTargetGraphic.anchor = new Phaser.Point(.5, .5);
    fireflyTargetGraphic.scale = new Phaser.Point(1, 1);
    fireflyTargetGraphic.update = function () {
        if (fireflyID != -1 && metadataForFrame != null && metadataForFrame != undefined) {
            fireflyTargetGraphic.visible = true;
            fireflyTargetGraphic.x = APGHelper.ScreenX(metadataForFrame.items[fireflyID].x);
            fireflyTargetGraphic.y = APGHelper.ScreenY(metadataForFrame.items[fireflyID].y);
        }
        else
            fireflyTargetGraphic.visible = false;
    };
    phaserGameWorld.addChild(fireflyTargetGraphic);
    var backgroundCoveringBinaryEncoding = new Phaser.Sprite(apg.g, -640, -320, 'assets/background.png');
    phaserGameWorld.addChild(backgroundCoveringBinaryEncoding);
    var fireflyStatsText = new Phaser.Text(apg.g, 20, 10, "", { font: '16px Caveat Brush', fill: '#112' });
    fireflyStatsText.update = function () {
        if (fireflyID != -1 && metadataForFrame != null && metadataForFrame != undefined) {
            fireflyStatsText.visible = true;
            fireflyStatsText.text = "ID: " + fireflyID + "\nScale " + Math.floor(metadataForFrame.items[fireflyID].scale / 10000 * 48);
        }
        else
            fireflyStatsText.visible = false;
    };
    phaserGameWorld.addChild(fireflyStatsText);
}
>>>>>>> 78835dadacccb92a976e1b29533f1b3741b3006e
//# sourceMappingURL=GameLogic.js.map