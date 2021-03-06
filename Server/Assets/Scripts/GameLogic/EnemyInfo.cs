﻿using ActionGameFramework.Health;
using System;
using System.Collections;
using System.Collections.Generic;
using TowerDefense.Affectors;
using TowerDefense.Agents;
using TowerDefense.Level;
using TowerDefense.Towers;
using TowerDefense.Towers.Data;
using TowerDefense.Towers.Projectiles;
using UnityEngine;
using UnityEngine.AI;

public class EnemyInfo : MonoBehaviour {

    // These two structs are the parameters for the network messages.  
    // They'll be serialized into JSON and then trasmitted across Twitch's IRC.
    // Note that these fields need the [Serializable] attribute.
    // These need to stay in sync (by both type and name) with the Typescript code.
    [Serializable]
    public struct ServerEnemyInformation
    {
        public string enemyName;
        public float attack;
        public float health;
        public float speed;
    }

    [Serializable]
    public struct ServerEnemyPosition
    {
        public string enemyName;
        public int x;
        public int y;
        public int scaleX;
        public int scaleY;
    }

    [Serializable]
    public struct ServerEnemies
    {
        public ServerEnemyPosition[] enemies;
        public ServerEnemyInformation[] info;
        public int waveNumber;
    }

    // This will be the enemies we'll be watching in the video - we'll be broadcasting
    // their screen space positions as metadata for the HTML5 client to use.
    public Agent[] enemies;

    // This is the camera for the application.  We need this to be able to
    // determine where, in screen space, the enemies are.
    public Camera mainCamera;

    // This is the structure we will fill in as parameters for our broadcasted
    // metadata message.
    ServerEnemies metadataUpdateParms;

    public int currWaveNum;

    private void Start()
    {
        metadataUpdateParms = new ServerEnemies();
        mainCamera = GameObject.FindGameObjectWithTag("MainCamera").GetComponent<Camera>();
    }

    void FixedUpdate()
    {
        /*
         * Get Enemy Information from the Wave Manager
         */
        Dictionary<string, Agent> enemyTypes = new Dictionary<string, Agent>();

        WaveManager wm = GameObject.FindGameObjectWithTag("Wave Manager").GetComponent<WaveManager>();
        List<SpawnInstruction> si = wm.waves[wm.waveNumber - 1].spawnInstructions;

        for (int i = 0; i < si.Count; i++)
        {
            if(!enemyTypes.ContainsKey(si[i].agentConfiguration.agentName)) {
                enemyTypes.Add(si[i].agentConfiguration.agentName, si[i].agentConfiguration.agentPrefab);
            }
        }

        metadataUpdateParms.info = new ServerEnemyInformation[enemyTypes.Count];

        metadataUpdateParms.waveNumber = wm.waveNumber;
        

        int idx = 0;
        foreach (KeyValuePair<string, Agent> enemy in enemyTypes)
        {
            metadataUpdateParms.info[idx].enemyName = enemy.Key;
            metadataUpdateParms.info[idx].health = enemy.Value.configuration.maxHealth;
            metadataUpdateParms.info[idx].speed = enemy.Value.gameObject.GetComponent<NavMeshAgent>().speed;
            metadataUpdateParms.info[idx].attack = enemy.Value.gameObject.GetComponent<Damager>().damage;
            idx++;
        }

        /*
         * get positions of all of the enemies currently spawned
         */

        GameObject[] enemiesObj = GameObject.FindGameObjectsWithTag("Enemy");
        enemies = new Agent[enemiesObj.Length];

        metadataUpdateParms.enemies = new ServerEnemyPosition[enemies.Length];

        for (var i = 0; i < enemiesObj.Length; i++)
        {
            enemies[i] = enemiesObj[i].GetComponent<Agent>();
        }

        for (var k = 0; k < enemiesObj.Length; k++)
        {
            //var screenPos = APG.Helper.ScreenPosition(mainCamera, enemies[k]);

            /* use the getcollider function and then get the 8 coords to enter into the 
             * worldtoscreenfunc and then get the top left (max x and min y) 
             * Also get the bottom right corner and pass into the for loop in line 85. 
             * Scale is abs(bottomright-topleft)
             */

            Collider col = enemies[k].GetCollider();

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

            metadataUpdateParms.enemies[k].enemyName = enemies[k].name.Replace("(Clone)", "");
            metadataUpdateParms.enemies[k].x = (int)topLeftX;
            metadataUpdateParms.enemies[k].y = (int)topLeftY;
            metadataUpdateParms.enemies[k].scaleX = (int)Mathf.Abs(bottomRightX - topLeftX);
            metadataUpdateParms.enemies[k].scaleY = (int)Mathf.Abs(bottomRightY - topLeftY);
        }
    }

    public ServerEnemies GetEnemyInformation()
    {
        return metadataUpdateParms;
    }
}
