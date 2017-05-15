/* @flow */

import fs from 'fs';
import path from 'path';

const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

import {
  DataFeedUsageType,
} from '@brightsign/bscore';

import {
  dmOpenSign,
  dmGetZonesForSign,
  dmGetZoneById,
  dmGetDataFeedIdsForSign,
  dmGetDataFeedById,
} from '@brightsign/bsdatamodel';

import PlatformService from '../platform';

import {
  setPoolAssetFiles
} from '../utilities/utilities';

import {
  HSM
} from '../hsm/HSM';

import {
  PlayerHSM
} from '../hsm/playerHSM';

import {
  ZoneHSM
} from '../hsm/zoneHSM';

import {
  TickerZoneHSM
} from '../hsm/tickerZoneHSM';

import {
  DataFeed
} from '../entities/dataFeed';

import {
  MrssDataFeed
} from '../entities/mrssDataFeed';

import {
  TextDataFeed
} from '../entities/textDataFeed';

import {
  addDataFeed
} from '../store/dataFeeds';

let _singleton = null;

type DataFeedLUT = { [dataFeedId:string]: DataFeed };
type FileNameToFilePathLUT =  { [fileName:string]: string };

class BSP {

  store : Object;
  dispatch : Function;
  getState : Function;
  playerHSM : PlayerHSM;
  hsmList : Array<HSM>;
  syncSpec : Object;
  liveDataFeedsToDownload : Array<DataFeed>;
  dataFeeds : DataFeedLUT;

  constructor() {
    if(!_singleton){
      console.log('bsp constructor invoked');
      _singleton = this;
    }
  }

  initialize(reduxStore : Object) {

    this.store = reduxStore;
    this.dispatch = this.store.dispatch;
    this.getState = this.store.getState;
    // this.syncSpec = null;
    this.hsmList = [] ;
    this.dataFeeds = {};

    const rootPath: string = PlatformService.default.getRootDirectory();
    const pathToPool: string = PlatformService.default.getPathToPool();

    let state : Object;

    this.openSyncSpec(path.join(rootPath, 'local-sync.json')).then((cardSyncSpec) => {

      this.syncSpec = cardSyncSpec;

      const poolAssetFiles : FileNameToFilePathLUT = this.buildPoolAssetFiles(this.syncSpec, pathToPool);
      setPoolAssetFiles(poolAssetFiles);

      state = this.store.getState();

// Create player state machine
      this.playerHSM = new PlayerHSM(this, this.dispatch, this.getState, state.bsdm);

// Zone state machines are created by the Player state machine when it parses the schedule and autoplay files
      this.playerHSM.initialize();

    }).catch((err) => {
      console.log(err);
      debugger;
    });
  }

  startPlayback() {

    const bsdm = this.getState().bsdm;

    let zoneHSMs : Array<ZoneHSM> = [];

    const zoneIds : Array<string> = dmGetZonesForSign(bsdm);
    zoneIds.forEach( (zoneId : string) => {

      const bsdmZone = dmGetZoneById(bsdm, { id: zoneId });

      let zoneHSM : ZoneHSM;

      switch (bsdmZone.type) {
        case 'Ticker': {
          zoneHSM = new TickerZoneHSM(this, this.dispatch, bsdm, zoneId);
          break;
        }
        default: {
          zoneHSM = new ZoneHSM(this.dispatch, this.getState, zoneId);
          break;
        }
      }
      zoneHSMs.push(zoneHSM);
      this.hsmList.push(zoneHSM);
    });

    zoneHSMs.forEach( (zoneHSM : ZoneHSM) => {
      zoneHSM.constructorFunction();
      zoneHSM.initialize();
    });
  }

  restartPlayback(presentationName : string) : Promise<void> {

    console.log('restart: ', presentationName);

    const rootPath: string = PlatformService.default.getRootDirectory();

    return new Promise( (resolve) => {
      this.getAutoschedule(this.syncSpec, rootPath).then( (autoSchedule) => {

        // TODO - only a single scheduled item is currently supported

        const scheduledPresentation = autoSchedule.scheduledPresentations[0];
        const presentationToSchedule = scheduledPresentation.presentationToSchedule;
        const presentationName = presentationToSchedule.name;
        const bmlFileName = presentationName + '.bml';

        this.getSyncSpecFile(bmlFileName, this.syncSpec, rootPath).then( (autoPlay) => {
          console.log(autoPlay);
          this.dispatch(dmOpenSign(autoPlay));

          // get data feeds for the sign
          let bsdm = this.getState().bsdm;
          const dataFeedIds = dmGetDataFeedIdsForSign(bsdm);
          dataFeedIds.forEach( (dataFeedId) => {
            const dmDataFeed = dmGetDataFeedById(bsdm, { id: dataFeedId });

            if (dmDataFeed.usage === DataFeedUsageType.Mrss) {
              let dataFeed : MrssDataFeed = new MrssDataFeed(dmDataFeed);
              this.dataFeeds[dmDataFeed.id] = dataFeed;
              this.dispatch(addDataFeed(dataFeed));
            }
            else if (dmDataFeed.usage === DataFeedUsageType.Text) {
              let dataFeed : TextDataFeed = new TextDataFeed(dmDataFeed);
              this.dataFeeds[dmDataFeed.id] = dataFeed;
              this.dispatch(addDataFeed(dataFeed));
            }
            else {
              debugger;
            }
          });
          resolve();
        });
      });
    });
  }

  postMessage(event : Object) {
    return () => {
      this.dispatchEvent(event);
    };
  }

  dispatchEvent(event : Object) {

    this.playerHSM.Dispatch(event);

    this.hsmList.forEach( (hsm) => {
      hsm.Dispatch(event);
    });
  }

  getAutoschedule(syncSpec : Object, rootPath : string) {
    return this.getSyncSpecFile('autoschedule.json', syncSpec, rootPath);
  }

  openSyncSpec(filePath : string = '') : Promise<Object> {
    return new Promise( (resolve, reject) => {
      fs.readFile(filePath, (err, dataBuffer : Buffer) => {

        if (err) {
          reject(err);
        } else {
          const syncSpecStr : string = decoder.write(dataBuffer);
          const syncSpec : Object = JSON.parse(syncSpecStr);
          resolve(syncSpec);
        }
      });
    });
  }

  buildPoolAssetFiles(syncSpec : Object, pathToPool : string) : FileNameToFilePathLUT {

    let poolAssetFiles : FileNameToFilePathLUT = {};

    syncSpec.files.download.forEach( (syncSpecFile : Object) => {
      poolAssetFiles[syncSpecFile.name] = path.join(pathToPool, syncSpecFile.link);
    });

    return poolAssetFiles;
  }

  getSyncSpecFile(fileName : string, syncSpec : Object, rootPath : string) {

    return new Promise( (resolve, reject) => {

      let syncSpecFile = this.getFile(syncSpec, fileName);
      if (syncSpecFile == null) {
        debugger;
        syncSpecFile = {};    // required to eliminate flow warnings
      }

      // const fileSize = syncSpecFile.size;
      const filePath : string = path.join(rootPath, syncSpecFile.link);

      fs.readFile(filePath, (err, dataBuffer : Buffer) => {
        if (err) {
          reject(err);
        } else {
          const fileStr : string = decoder.write(dataBuffer);
          const file : Object = JSON.parse(fileStr);

          // comment out the following code to allow hacking of files -
          // that is, overwriting files in the pool without updating the sync spec with updated sha1
          // if (fileSize !== fileStr.length) {
          //   debugger;
          // }
          resolve(file);
        }
      });
    });
  }

  getFile(syncSpec : Object, fileName : string) : ?Object {

    let file = null;

    syncSpec.files.download.forEach( (syncSpecFile) => {
      if (syncSpecFile.name === fileName) {
        file = syncSpecFile;
        return;
      }
    });

    return file;
  }

  queueRetrieveLiveDataFeed(dataFeed : DataFeed) {

    const liveDataFeed = dataFeed;

    if (liveDataFeed.usage === DataFeedUsageType.Text) {
      dataFeed.retrieveFeed(this);
    }
    else {
      // is the following correct? check with autorun classic
      this.liveDataFeedsToDownload.push(liveDataFeed);

      // launch download of first feed
      if (this.liveDataFeedsToDownload.length === 1) {
        dataFeed.retrieveFeed(this);
      }
    }
  }
}

export const bsp = new BSP();

