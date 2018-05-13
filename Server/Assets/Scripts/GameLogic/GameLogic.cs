
using System;
using UnityEngine;

public class GameLogic : MonoBehaviour
{
    // This is the APG networking component.  We're not actually using
    // the twitch part of it here - the metadata system is a subcomponent of it.
    public TwitchNetworking networking;

    private TowerInfo ti;
    private EnemyInfo ei;

    [Serializable]
    public struct ServerMessage
    {
        public EnemyInfo.ServerEnemies enemyInfo;
        public TowerInfo.ServerTowers towerInfo;
    }

    public ServerMessage sm;

    void Start()
    {
        // make sure the unity game doesn't pause if we change focus, which we almost
        // certainly will be while testing.
        Application.runInBackground = true;

        // Add components to grab information
        ti = gameObject.AddComponent<TowerInfo>();
        ei = gameObject.AddComponent<EnemyInfo>();

        sm = new ServerMessage();
    }

    void FixedUpdate()
    {
        sm.enemyInfo = ei.GetEnemyInformation();
        sm.towerInfo = ti.GetTowerInformation();

        networking.GetAudienceSys().WriteMetadata<ServerMessage>("server", sm);
        networking.GetAudienceSys().WriteMetadata<ServerMessage>("server", sm);

    }

}