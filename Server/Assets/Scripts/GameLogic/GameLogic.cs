
using System;
using UnityEngine;
using TowerDefense.Towers;
using TowerDefense.Towers.Data;
using TowerDefense.Affectors;
using ActionGameFramework.Health;
using TowerDefense.Towers.Projectiles;

public class GameLogic : MonoBehaviour
{
    // This is the APG networking component.  We're not actually using
    // the twitch part of it here - the metadata system is a subcomponent of it.
    public TwitchNetworking networking;

    private TowerInfo ti;
    private EnemyInfo ei;

    void Start()
    {
        // make sure the unity game doesn't pause if we change focus, which we almost
        // certainly will be while testing.
        Application.runInBackground = true;

        // Add components to grab information
        ti = gameObject.AddComponent<TowerInfo>();
        ei = gameObject.AddComponent<EnemyInfo>();

    }

    void FixedUpdate()
    {
        // Get information to pass over
        // Tell system to broadcast information
        //networking.GetAudienceSys().WriteMetadata("towers", ti.GetTowerInformation());
        networking.GetAudienceSys().WriteMetadata("enemies", ei.GetEnemyInformation());

    }

}