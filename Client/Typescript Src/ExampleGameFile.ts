/* Metadata Server Example

This is the metadata example's javascript client.

When the webpage (game.html) is opened, it will create a twitch video plugin and a
transparent HTML5 canvas on top of it, which is controlled by this code.

If the corresponding Unity game is running, set up correctly, and streaming to Twitch,
the webpage this client is embedded in will be recieving video of several towers flying
around in various curves while a drifting 3d camera watches them.

This client will, meanwhile, be receiving metadata about the contents of the streaming
video - specifically, it will be receiving screen space positional information about the
various towers as well as real time game logic statistics about them.

What this specific file does is perform some client logic and graphics rendering with that
metadata, over the video frame. Namely,

1) if the user's mouse is over one of the towers, that tower will be highlighted

2) if the user clicks on a highlight tower, the tower will have a target put over it that will
follow the tower in realtime.

3) If a tower is highlighted, some statistics will be displayed about it.

That's it!

SOME NOTES:

Change the field "forceChatIRCChannelName" in game.html to change which twitch video
stream the client watches.

make sure to open game.html in Chrome with the command line parameters
"--user-data-dir="C:/whatever" --disable-web-security"  The HTML5 app reads data out
of the twitch video plugin, which is normally a violation of the browser security model
(it is regarded as a cross site scripting issue.)
 
 */

// Pre-cache all of the assets we're going to use in this app.  We have to do this to make sure these assets
// around downloaded to clients before the app launches.

function CacheGameAssets(c: Cacher): void {
    c.images('assets', ['hudselect.png', 'TowerInformationPopup.png', 'background.png', 'EnemyInformationPopup.png']);
	c.sounds('assets', ['click.mp3']);
}

// These two interfaces are the parameters for network messages.  They'll be serialized into JSON and then trasmitted across the metadata server.
// The specific fields need to stay in sync (by both type and name) with the C# code.

interface Servertower{
    x: number;
	y: number;
    scaleX: number;
    scaleY: number;
    name: string;
    attack: number;
    coolDown: number;
    fireRate: number;
}
interface Servertowers{
	items: Servertower[];
}

interface ServerEnemyInformation {
    enemyName: string;
    health: number;
    speed: number;
    attack: number;
}

interface ServerEnemyPosition {
    enemyName: string;
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
}

interface ServerEnemies {
    info: ServerEnemyInformation[];
    enemies: ServerEnemyPosition[];
    waveNumber: number;
}

function InitializeGame(apg: APGSys): void {

	// _____________________________________ SET SHARED APP VARIABLES _______________________________________

	var phaserGameWorld: Phaser.Group = apg.w;

	// This field will be the metadata sent down from the server for the current frame.  
	// When the user clicks the mouse, we'll pause before they're allowed to click the mouse again.
	var lastClickDelay: number = 0;

	// Register the clicking sound
	var clickSound: Phaser.Sound = apg.g.add.audio('assets/click.mp3', .4, false);


	// _____________________________________ MAKE GAME OBJECTS _______________________________________

	// This app has four main game objects, three of which use updated metadata to change what
	// graphics are drawn over the video frame.  There is a highlight that draws when a tower is
	// near the mouse cursor, there is a target that follows a tower if it has been selected, there
	// is a text label showing updating gameplay specific stats of the currently selected tower, and
	// there is a background under that text that obscures that visually jarring binary frame data
	// in the video stream.

    // #region Tower
    {
        // _____________________________________ REGISTER CALLBACKS _______________________________________

        // Setup callbacks with the metadata subsystem.

        var metadataForFrame: Servertowers = null;

        apg.ResetServerMessageRegistry();
        apg.Register<Servertowers>("towers", updatedMetadataForNewFrame => {
            // We register a simple callback that updates when the video frame has advanced and there is new metadata.
            // We will use this metadata in game object frame updates to change what is displayed in the overlay.
            // In theory, it would be more efficient to do the actual updating in this callback, but it's not a priority.
            metadataForFrame = updatedMetadataForNewFrame;
        });


        // Index in the Servertowers array of the currently selected tower.  We'll default to showing the first tower.
        var towerID: number = 0;

        // _____ Mouse Highlighter _______

        // This is a highlight for the situation when the mouse cursor is roughly over one of the towers.
        // It let's us tell the viewer that they could click on that tower to target it.
        // We will also do the logic in this game object to see if the mouse is down, and if so, we will
        // target that tower, if one is highlighted, or untarget otherwise.
        var towerMouseHighlight: Phaser.Sprite = new Phaser.Sprite(apg.g, 0, 0, 'assets/TowerInformationPopup.png');
        //towerMouseHighlight.blendMode = PIXI.blendModes.ADD;
        towerMouseHighlight.anchor = new Phaser.Point(0.4, 0.75);
        towerMouseHighlight.scale = new Phaser.Point(1, 1);
        towerMouseHighlight.update = () => {
            lastClickDelay--;
            if (metadataForFrame != null) {
                var overAtower: boolean = false;
                var towerIndex = -1;
                for (var k: number = 0; k < metadataForFrame.items.length; k++) {
                    // get the screen coordinates that have been passed down as metadata.

                    //x = topleftX and y = topLeftY
                    var x: number = APGHelper.ScreenX(metadataForFrame.items[k].x);
                    var y: number = APGHelper.ScreenY(metadataForFrame.items[k].y);

                    //scaleX = width and sccaleY = height
                    var scaleX: number = APGHelper.ScreenX(metadataForFrame.items[k].scaleX);
                    var scaleY: number = APGHelper.ScreenY(metadataForFrame.items[k].scaleY);

                    // Test if our mouse is close to the screen space coordinates of the current tower.
                    // This test is simple and hard-coded for this demo.
                    if (apg.g.input.activePointer.x >= x && apg.g.input.activePointer.x <= x + scaleX &&
                        apg.g.input.activePointer.y >= y && apg.g.input.activePointer.y <= y + scaleY) {

                        // We are over a tower, so record its index.
                        towerIndex = k;
                        overAtower = true;

                        // Center the highlight on this tower and make it visible.
                        towerMouseHighlight.x = x;
                        towerMouseHighlight.y = y;
                        towerMouseHighlight.visible = true;

                        towerID = towerIndex;
                    }
                }

                if (!overAtower) {
                    // The case where we are not over a tower.  Make the highlight invisible and turn off targeting
                    // if the mouse was clicked.
                    towerMouseHighlight.visible = false;
                    towerID = -1;
                    lastClickDelay = 20;

					//clear graphics here if doing global clear

                }
            }
        }
        phaserGameWorld.addChild(towerMouseHighlight);

        // _____ Background Graphic  _______

        // This is a small bit of art that will cover up the binary data in the video frame.
        // It is also the back ground that stat text will be drawn over.
        var backgroundCoveringBinaryEncoding: Phaser.Sprite = new Phaser.Sprite(apg.g, -640, -320, 'assets/background.png');
        phaserGameWorld.addChild(backgroundCoveringBinaryEncoding);

        // _____ Stats Text _______

        // This is statistic text.  It will display game logic metadata for the currently selected tower if, in fact, a tower is currently selected.
        var towerStatsText: Phaser.Text = new Phaser.Text(apg.g, towerMouseHighlight.x, towerMouseHighlight.y, "", { font: '12px Helvetica', fill: '#C0C0C0' });
        towerStatsText.anchor = new Phaser.Point(1.0, 1.35);

        //The Rectangle representing the fire rate
        //var towerStatsFireBar: Phaser.Graphics = new Phaser.Graphics(apg.g, 0, 0);
        var towerStatsFireBar: Phaser.Rectangle = new Phaser.Rectangle(0, 0, 0, 0);


        //Showing the game data when the tower is being hovered over
        towerStatsText.update = () => {
            if (towerID != -1 && metadataForFrame != null && metadataForFrame != undefined) {

                towerStatsText.x = towerMouseHighlight.x;
                towerStatsText.y = towerMouseHighlight.y;

                //shows the text
                towerStatsText.visible = true;
                towerStatsText.text = metadataForFrame.items[towerID].name + "\nFIRE RATE: \nATTACK:";
                
                //
                towerStatsFireBar.width = metadataForFrame.items[towerID].fireRate * 100;
                towerStatsFireBar.height = 10;
                towerStatsFireBar.x = towerMouseHighlight.x;
                towerStatsFireBar.y = towerMouseHighlight.y;

				//draws the rectangles
                towerStatsFireBar.visible = true;
                towerStatsFireBar.beginFill(0xff000);
                towerStatsFireBar.drawRect(towerStatsFireBar.x, towerStatsFireBar.y, towerStatsFireBar.width, 100);
				towerStatsFireBar.endFill();
                //*/
            }
            else {
                towerStatsText.visible = false;
				towerStatsFireBar.kill();
				towerStatsFireBar.remove();
                //towerStatsFireBar.visible = false;
            }
        }
        phaserGameWorld.addChild(towerStatsText);
        //phaserGameWorld.addChild(towerStatsFireBar);
    }
    // #endregion


    // #region Enemy
    {

        var enemyMetadataForFrame: ServerEnemies = null;

        // Setup callbacks with the metadata subsystem.
        apg.ResetServerMessageRegistry();
        apg.Register<ServerEnemies>("enemies", updatedMetadataForNewFrame => {
            // We register a simple callback that updates when the video frame has advanced and there is new metadata.
            // We will use this metadata in game object frame updates to change what is displayed in the overlay.
            // In theory, it would be more efficient to do the actual updating in this callback, but it's not a priority.
            enemyMetadataForFrame = updatedMetadataForNewFrame;
        });

        // Index in the Serverenemies array of the currently selected enemy.  We'll default to showing the first enemy.
        var enemyID: number = 0;

        var waveNumber: number = -1;
        var waveImages: Array<Phaser.Sprite> = new Array<Phaser.Sprite>();
        var waveText: Array<Phaser.Text> = new Array<Phaser.Text>();

        //parent graphic to contain enemy graphics
        var enemyInformationArea: Phaser.Sprite = new Phaser.Sprite(apg.g, 800, 75, 'assets/background.png');
        enemyInformationArea.anchor = new Phaser.Point(0, 0);
        enemyInformationArea.scale = new Phaser.Point(0.35, 0.9);
        enemyInformationArea.update = () => {

            if (enemyMetadataForFrame != null) {
                if (enemyMetadataForFrame.waveNumber != waveNumber) {

                    //remove previous level's enemy information
                    for (var i: number = 0; i < waveImages.length; i++) {
                        phaserGameWorld.removeChild(waveImages[i]);
                    }

                    //Create graphics of enemy information
                    for (var i: number = 0; i < enemyMetadataForFrame.info.length; i++) {

                        var enemyInformationPopup: Phaser.Sprite = new Phaser.Sprite(apg.g, enemyInformationArea.x + 20, i * 100 + enemyInformationArea.y + 20, 'assets/EnemyInformationPopup.png');
                        enemyInformationPopup.update = () => {
                            //on cursor mouseover, go through enemies array and create phaser sprite on top of enemies of matching type
                        }
                        phaserGameWorld.addChild(enemyInformationPopup);

                        var enemyInformationText: Phaser.Text = new Phaser.Text(apg.g, 100, 0, "", { font: '12px Helvetica', fill: '#C0C0C0' });
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

        }
        phaserGameWorld.addChild(enemyInformationArea);


        /*


        var enemyMouseHighlight: Phaser.Sprite = new Phaser.Sprite(apg.g, 0, 0, 'assets/EnemyInformationPopup.png');
        //enemyMouseHighlight.blendMode = PIXI.blendModes.ADD;
        enemyMouseHighlight.anchor = new Phaser.Point(0.4, 0.75);
        enemyMouseHighlight.scale = new Phaser.Point(1, 1);
        enemyMouseHighlight.update = () => {
            lastClickDelay--;
            if (enemyMetadataForFrame != null) {
                var overAenemy: boolean = false;
                var enemyIndex = -1;
                for (var k: number = 0; k < enemyMetadataForFrame.info.length; k++) {
                    // get the screen coordinates that have been passed down as metadata.

                    //x = topleftX and y = topLeftY
                    var x: number = APGHelper.ScreenX(enemyMetadataForFrame.items[k].x);
                    var y: number = APGHelper.ScreenY(enemyMetadataForFrame.items[k].y);

                    //scaleX = width and sccaleY = height
                    var scaleX: number = APGHelper.ScreenX(enemyMetadataForFrame.items[k].scaleX);
                    var scaleY: number = APGHelper.ScreenY(enemyMetadataForFrame.items[k].scaleY);

                    // Test if our mouse is close to the screen space coordinates of the current enemy.
                    // This test is simple and hard-coded for this demo.
                    if (apg.g.input.activePointer.x >= x && apg.g.input.activePointer.x <= x + scaleX &&
                        apg.g.input.activePointer.y >= y && apg.g.input.activePointer.y <= y + scaleY) {

                        // We are over a enemy, so record its index.
                        enemyIndex = k;
                        overAenemy = true;

                        // Center the highlight on this enemy and make it visible.
                        enemyMouseHighlight.x = x;
                        enemyMouseHighlight.y = y;
                        enemyMouseHighlight.visible = true;

                        enemyID = enemyIndex;
                    }
                }

                if (!overAenemy) {
                    // The case where we are not over a enemy.  Make the highlight invisible and turn off targeting
                    // if the mouse was clicked.
                    enemyMouseHighlight.visible = false;
                    enemyID = -1;
                    lastClickDelay = 20;
                }
            }
        }
        phaserGameWorld.addChild(enemyMouseHighlight);

        // _____ Background Graphic  _______

        // This is a small bit of art that will cover up the binary data in the video frame.
        // It is also the back ground that stat text will be drawn over.
        var backgroundCoveringBinaryEncoding: Phaser.Sprite = new Phaser.Sprite(apg.g, -640, -320, 'assets/background.png');
        phaserGameWorld.addChild(backgroundCoveringBinaryEncoding);

        // _____ Stats Text _______

        // This is statistic text.  It will display game logic metadata for the currently selected enemy if, in fact, a enemy is currently selected.
        var enemyStatsText: Phaser.Text = new Phaser.Text(apg.g, enemyMouseHighlight.x, enemyMouseHighlight.y, "", { font: '12px Helvetica', fill: '#C0C0C0' });
        enemyStatsText.anchor = new Phaser.Point(1.0, 1.35);

        //The Rectangle representing the fire rate
        //var enemyStatsFireBar: Phaser.Graphics = new Phaser.Graphics(apg.g, 0, 0);
        var enemyStatsFireBar: Phaser.Rectangle = new Phaser.Rectangle(0, 0, 0, 0);


        //Showing the game data when the enemy is being hovered over
        enemyStatsText.update = () => {
            if (enemyID != -1 && enemyMetadataForFrame != null && enemyMetadataForFrame != undefined) {

                enemyStatsText.x = enemyMouseHighlight.x;
                enemyStatsText.y = enemyMouseHighlight.y;

                //shows the text
                enemyStatsText.visible = true;
                enemyStatsText.text = enemyMetadataForFrame.items[enemyID].name + "\nFIRE RATE: \nATTACK:";

                /*draws the rectangles
                enemyStatsFireBar.visible = true;
                enemyStatsFireBar.beginFill(0xff000);
                enemyStatsFireBar.drawRect(enemyMouseHighlight.x, enemyMouseHighlight.y, enemyMetadataForFrame.items[enemyID].fireRate * 100, 100);
                */
                /*
                enemyStatsFireBar.width = enemyMetadataForFrame.items[enemyID].fireRate * 10;
                enemyStatsFireBar.height = 10;
                enemyStatsFireBar.x = enemyMouseHighlight.x;
                enemyStatsFireBar.y = enemyMouseHighlight.y;

                //*/

        /*
            }
            else {
                enemyStatsText.visible = false;
                //enemyStatsFireBar.visible = false;
            }
        }
        phaserGameWorld.addChild(enemyStatsText);
        //phaserGameWorld.addChild(enemyStatsFireBar);
        */
    }
    // #endregion

}