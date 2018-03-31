/* Basic Metadata Example
 * 
 * Here is what this game example does.
 * 
 * There are some number of towers.  They will fly around the screen.
 * The game's camera will animate as this happens, to add visual interest and
 * make the scene a bit more complex.
 * The game will then also broadcast the screen space coordinates of the towers
 * every frame, to be used by the HTML5 client for compositing logic.
 * 
 */

using System;
using UnityEngine;
using TowerDefense.Towers;

public class GameLogic : MonoBehaviour
{

    // These two structs are the parameters for the network messages.  
    // They'll be serialized into JSON and then trasmitted across Twitch's IRC.
    // Note that these fields need the [Serializable] attribute.
    // These need to stay in sync (by both type and name) with the Typescript code.
    [Serializable]
    struct ServerTowerInformation
    {
        public int x;
        public int y;
        public int scaleX;
        public int scaleY;
    }
    [Serializable]
    struct ServerTowers
    {
        public ServerTowerInformation[] items;
    }

    // This will be the towers we'll be watching in the video - we'll be broadcasting
    // their screen space positions as metadata for the HTML5 client to use.
    public Tower[] towers;

    // This is the camera for the application.  We need this to be able to
    // determine where, in screen space, the towers are.
    public Camera mainCamera;

    // This is the APG networking component.  We're not actually using
    // the twitch part of it here - the metadata system is a subcomponent of it.
    public TwitchNetworking networking;

    // This is the structure we will fill in as parameters for our broadcasted
    // metadata message.
    ServerTowers metadataUpdateParms = new ServerTowers();

    void Start()
    {
        // make sure the unity game doesn't pause if we change focus, which we almost
        // certainly will be while testing.
        Application.runInBackground = true;

        // we will be 
        metadataUpdateParms.items = new ServerTowerInformation[towers.Length];
    }

    float time2 = 0;
    void FixedUpdate()
    {
        // Move the camera around, changing both its position and orientation.
        // The hardcode math here is the generate certain kinds of desired motion -
        // it's not important that you understand how it works.
        //time2 += .3f;
        //mainCamera.transform.position = new Vector3(
        //    400 + 100 * Mathf.Cos(time2 * .013f + 72) + 100 * Mathf.Cos(time2 * .0065f + 172),
        //    225 + 80 * Mathf.Cos(time2 * .011f + 372) + 70 * Mathf.Cos(time2 * .0071f + 672),
        //    -500 + 10 * Mathf.Cos(time2 * .0073f + 1372) + 8 * Mathf.Cos(time2 * .0087f + 1672)
        //    );
        //mainCamera.transform.rotation = Quaternion.Euler(new Vector3(
        //    4 * Mathf.Cos(time2 * .013f + 172) + 3 * Mathf.Cos(time2 * .0065f + 1172),
        //    3 * Mathf.Cos(time2 * .011f + 1372) + 2 * Mathf.Cos(time2 * .0071f + 1672),
        //    0));

        // The towers will be updating their positions and scale in their own update functions.
        // The following section of code will let's the metadata system know that this
        // is the particular metadata we want to send down to the clients.

        //dyanmically get the towers that exist. Update the tower array

        GameObject[] towersObj = GameObject.FindGameObjectsWithTag("Tower");
        towers = new Tower[24];

        for (var i = 0; i < towersObj.Length; i++)
        {
            towers[i] = towersObj[i].GetComponent<Tower>();
        }

        for ( var k = 0; k < towers.Length; k++ ){

            //var screenPos = APG.Helper.ScreenPosition(mainCamera, towers[k]);

            Collider col = towers[k].getCollider();

            Vector3 wFrontTopLeft = new Vector3(col.bounds.min.x, col.bounds.max.y, col.bounds.min.z);
            Vector3 wFrontTopRight = new Vector3(col.bounds.max.x, col.bounds.max.y, col.bounds.min.z);
            Vector3 wFrontBottomRight = new Vector3(col.bounds.max.x, col.bounds.min.y, col.bounds.min.z);
            Vector3 wFrontBottomLeft = new Vector3(col.bounds.min.x, col.bounds.min.y, col.bounds.min.z);
            Vector3 wBackTopLeft = new Vector3(col.bounds.min.x, col.bounds.max.y, col.bounds.max.z);
            Vector3 wBackTopRight = new Vector3(col.bounds.max.x, col.bounds.max.y, col.bounds.max.z);
            Vector3 wBackBottomRight = new Vector3(col.bounds.max.x, col.bounds.min.y, col.bounds.max.z);
            Vector3 wBackBottomLeft = new Vector3(col.bounds.min.x, col.bounds.min.y, col.bounds.max.z);

            var sFrontTopLeft = mainCamera.WorldToScreenPoint(wFrontTopLeft);
            var sFrontTopRight = mainCamera.WorldToScreenPoint(wFrontTopRight);
            var sFrontBottomRight = mainCamera.WorldToScreenPoint(wFrontBottomRight);
            var sFrontBottomLeft = mainCamera.WorldToScreenPoint(wFrontBottomLeft);
            var sBackTopLeft = mainCamera.WorldToScreenPoint(wBackTopLeft);
            var sBackTopRight = mainCamera.WorldToScreenPoint(wBackTopRight);
            var sBackBottomRight = mainCamera.WorldToScreenPoint(wBackBottomRight);
            var sBackBottomLeft = mainCamera.WorldToScreenPoint(wBackBottomLeft);

            var topLeftX = Mathf.Min(sFrontTopLeft.x, sFrontTopRight.x, sFrontBottomRight.x
                                        , sFrontBottomLeft.x, sBackTopLeft.x, sBackTopRight.x
                                        , sBackBottomRight.x, sBackBottomLeft.x);

            var topLeftY = Mathf.Max(sFrontTopLeft.y, sFrontTopRight.y, sFrontBottomRight.y
                                        , sFrontBottomLeft.y, sBackTopLeft.y, sBackTopRight.y
                                        , sBackBottomRight.y, sBackBottomLeft.y);

            var bottomRightX = Mathf.Max(sFrontTopLeft.x, sFrontTopRight.x, sFrontBottomRight.x
                                        , sFrontBottomLeft.x, sBackTopLeft.x, sBackTopRight.x
                                        , sBackBottomRight.x, sBackBottomLeft.x);

            var bottomRightY = Mathf.Min(sFrontTopLeft.y, sFrontTopRight.y, sFrontBottomRight.y
                                        , sFrontBottomLeft.y, sBackTopLeft.y, sBackTopRight.y
                                        , sBackBottomRight.y, sBackBottomLeft.y);


            metadataUpdateParms.items[k].x = (int)topLeftX;
            metadataUpdateParms.items[k].y = (int)topLeftY;
            metadataUpdateParms.items[k].scaleX = (int)Mathf.Abs(bottomRightX - topLeftX);
            metadataUpdateParms.items[k].scaleY = (int)Mathf.Abs(bottomRightY - topLeftY);

            /* metadataUpdateParms.items[k].x = (int)screenPos.x;
            metadataUpdateParms.items[k].y = (int)screenPos.y;
            metadataUpdateParms.items[k].scale = (int)(10000 * towers[k].transform.localScale.x / 48f);
            */
        }
       
        // And once we've filled up our metadata, this is how we tell the metadata system
        // that we want to broadcast that information.
        networking.GetAudienceSys().WriteMetadata<ServerTowers>("towers", metadataUpdateParms);
    }
}