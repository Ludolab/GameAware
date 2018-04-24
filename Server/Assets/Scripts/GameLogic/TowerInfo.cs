using ActionGameFramework.Health;
using System;
using System.Collections;
using System.Collections.Generic;
using TowerDefense.Affectors;
using TowerDefense.Towers;
using TowerDefense.Towers.Data;
using TowerDefense.Towers.Projectiles;
using UnityEngine;

public class TowerInfo : MonoBehaviour {

    // These two structs are the parameters for the network messages.  
    // They'll be serialized into JSON and then trasmitted across Twitch's IRC.
    // Note that these fields need the [Serializable] attribute.
    // These need to stay in sync (by both type and name) with the Typescript code.
    [Serializable]
    public struct ServerTowerInformation
    {
        public int x;
        public int y;
        public int scaleX;
        public int scaleY;
        public float attack;
        public float coolDown;
        public float fireRate;
        public string name;
    }
    [Serializable]
    public struct ServerTowers
    {
        public ServerTowerInformation[] items;
    }

    // This will be the towers we'll be watching in the video - we'll be broadcasting
    // their screen space positions as metadata for the HTML5 client to use.
    public Tower[] towers;

    // This is the camera for the application.  We need this to be able to
    // determine where, in screen space, the towers are.
    public Camera mainCamera;

    // This is the structure we will fill in as parameters for our broadcasted
    // metadata message.
    ServerTowers metadataUpdateParms;

    private void Start()
    {
        metadataUpdateParms = new ServerTowers();
        mainCamera = GameObject.FindGameObjectWithTag("MainCamera").GetComponent<Camera>();
    }

    void FixedUpdate()
    {
        // The towers will be updating their positions and scale in their own update functions.
        // The following section of code will let's the metadata system know that this
        // is the particular metadata we want to send down to the clients.

        //dyanmically get the towers that exist. Update the tower array

        GameObject[] towersObj = GameObject.FindGameObjectsWithTag("Tower");
        towers = new Tower[24];

        // The towers will be updating their positions and scale in their own update functions.
        // The following section of code will let's the metadata system know that this
        // is the particular metadata we want to send down to the clients.
        metadataUpdateParms.items = new ServerTowerInformation[towers.Length];


        for (var i = 0; i < towersObj.Length; i++)
        {
            towers[i] = towersObj[i].GetComponent<Tower>();
        }

        for (var k = 0; k < towersObj.Length; k++)
        {

            //var screenPos = APG.Helper.ScreenPosition(mainCamera, towers[k]);

            /* use the getcollider function and then get the 8 coords to enter into the 
             * worldtoscreenfunc and then get the top left (max x and min y) 
             * Also get the bottom right corner and pass into the for loop in line 85. 
             * Scale is abs(bottomright-topleft)
             */

            Collider col = towers[k].getCollider();

            Vector2 wFrontTopLeft = APG.Helper.ScreenPosition(mainCamera, new Vector3(col.bounds.min.x, col.bounds.max.y, col.bounds.min.z));
            Vector2 wFrontTopRight = APG.Helper.ScreenPosition(mainCamera, new Vector3(col.bounds.max.x, col.bounds.max.y, col.bounds.min.z));
            Vector2 wFrontBottomRight = APG.Helper.ScreenPosition(mainCamera, new Vector3(col.bounds.max.x, col.bounds.min.y, col.bounds.min.z));
            Vector2 wFrontBottomLeft = APG.Helper.ScreenPosition(mainCamera, new Vector3(col.bounds.min.x, col.bounds.min.y, col.bounds.min.z));
            Vector2 wBackTopLeft = APG.Helper.ScreenPosition(mainCamera, new Vector3(col.bounds.min.x, col.bounds.max.y, col.bounds.max.z));
            Vector2 wBackTopRight = APG.Helper.ScreenPosition(mainCamera, new Vector3(col.bounds.max.x, col.bounds.max.y, col.bounds.max.z));
            Vector2 wBackBottomRight = APG.Helper.ScreenPosition(mainCamera, new Vector3(col.bounds.max.x, col.bounds.min.y, col.bounds.max.z));
            Vector2 wBackBottomLeft = APG.Helper.ScreenPosition(mainCamera, new Vector3(col.bounds.min.x, col.bounds.min.y, col.bounds.max.z));

            /* Get Max and Min bounding box positions */

            var topLeftX = Mathf.Min(wFrontTopLeft.x, wFrontTopRight.x, wFrontBottomRight.x
                                        , wFrontBottomLeft.x, wBackTopLeft.x, wBackTopRight.x
                                        , wBackBottomRight.x, wBackBottomLeft.x);

            var topLeftY = Mathf.Max(wFrontTopLeft.y, wFrontTopRight.y, wFrontBottomRight.y
                                        , wFrontBottomLeft.y, wBackTopLeft.y, wBackTopRight.y
                                        , wBackBottomRight.y, wBackBottomLeft.y);

            var bottomRightX = Mathf.Max(wFrontTopLeft.x, wFrontTopRight.x, wFrontBottomRight.x
                                        , wFrontBottomLeft.x, wBackTopLeft.x, wBackTopRight.x
                                        , wBackBottomRight.x, wBackBottomLeft.x);

            var bottomRightY = Mathf.Min(wFrontTopLeft.y, wFrontTopRight.y, wFrontBottomRight.y
                                        , wFrontBottomLeft.y, wBackTopLeft.y, wBackTopRight.y
                                        , wBackBottomRight.y, wBackBottomLeft.y);


            metadataUpdateParms.items[k].x = (int)topLeftX;
            metadataUpdateParms.items[k].y = (int)topLeftY;
            metadataUpdateParms.items[k].scaleX = (int)Mathf.Abs(bottomRightX - topLeftX);
            metadataUpdateParms.items[k].scaleY = (int)Mathf.Abs(bottomRightY - topLeftY);

            /* Get Tower Information */
            TowerLevelData data = towers[k].GetComponentInChildren<TowerLevel>().levelData;
            AttackAffector attack = towers[k].GetComponentInChildren<AttackAffector>();
            metadataUpdateParms.items[k].attack = attack.projectile.GetComponent<Damager>().damage;
            metadataUpdateParms.items[k].fireRate = attack.fireRate;

            metadataUpdateParms.items[k].name = towers[k].towerName;
        }
    }
    
    public ServerTowers GetTowerInformation()
    {
        return metadataUpdateParms;
    }
}
