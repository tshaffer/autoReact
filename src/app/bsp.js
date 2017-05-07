/* @flow */

import fs from 'fs';
import path from 'path';

const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

import {
  DataFeedUsageType,
  DataFeedType,
} from '@brightsign/bscore';

import {
  dmOpenSign,
  dmGetZonesForSign,
  dmGetZoneById,
  dmGetSignState,
  dmAddBsnDataFeed,
} from '@brightsign/bsdatamodel';

import PlatformService from '../platform';

import {
  setPoolAssetFiles
} from '../utilities/utilities';

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
  // bsdmStringParameterType,
  // bsdmStringComponent,
  bsdmParameterizedString,
  bsdmMrssDataFeedContentItem,
  bsdmState,
  BSNDataFeedAdder,
  IAddBSNDataFeed,
} from '../bsdmWrappers/bsdm';

let _singleton = null;

// https://flow.org/en/docs/types/functions/

type callbackFunction = (st: string, an : any) => void;

function flibbet(callback: callbackFunction) {
  // callbackFunction here is the function signature (error:string, result: any): void;
  callback('flibbet', 69);
}

function specificCallback(s : string, a : any) {
  console.log(s);
  console.log(a);
}

type addDataFeedFunction = (name : string, dataFeedType : string, url : Object, bsnId : number,
                            bsnName : string, usage : string, updateInterval : number) => Object;

function addDataFeed(functionToCall : addDataFeedFunction, name, dataFeedType, url, bsnId, bsnName, usage, updateInterval) {
  const action = functionToCall(name, dataFeedType, url, bsnId, bsnName, usage, updateInterval);
  return action;
}

// function bsdmAddBsnDataFeed(name : string, dataFeedType : string, url : Object, bsnId : number,
//                             bsnName : string, usage : string, updateInterval : number) : Object {
//   const action = dmAddBsnDataFeed(name, dataFeedType, url, bsnId, bsnName, usage, updateInterval);
//   return action;
// }

class BSP {

  store : Object;
  dispatch : Function;
  getState : Function;
  playerHSM : Object;
  hsmList : Array<Object>;
  syncSpec : Object;
  liveDataFeedsByTimer : Object;
  liveDataFeedsToDownload : Array<Object>;
  dataFeeds : Object;

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
    this.hsmList = [];
    this.dataFeeds = {};

    const rootPath: string = PlatformService.default.getRootDirectory();
    const pathToPool: string = PlatformService.default.getPathToPool();

    let state;

    this.openSyncSpec(path.join(rootPath, 'local-sync.json')).then((cardSyncSpec) => {

      this.syncSpec = cardSyncSpec;

      const poolAssetFiles = this.buildPoolAssetFiles(this.syncSpec, pathToPool);
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

  startPlayback(bsdm : Object) {

    let zoneHSMs = [];

    const zoneIds = dmGetZonesForSign(bsdm);
    zoneIds.forEach( (zoneId) => {

      const bsdmZone = dmGetZoneById(bsdm, { id: zoneId });

      let zoneHSM;

      switch (bsdmZone.type) {
        case 'Ticker': {
          zoneHSM = new TickerZoneHSM(this, this.dispatch, bsdm, zoneId);
          break;
        }
        default: {
          zoneHSM = new ZoneHSM(this.dispatch, bsdm, zoneId);
          break;
        }
      }
      zoneHSMs.push(zoneHSM);
      this.hsmList.push(zoneHSM);
    });

    zoneHSMs.forEach( (zoneHSM) => {
      zoneHSM.constructorFunction();
      zoneHSM.initialize();
    });
  }

  restartPlayback(presentationName : string) {

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

          this.dispatch(this.buildPresentation('/Users/tedshaffer/Desktop/baconPresBuilderOut/mz5.bpf'));

          // get data feeds for the sign
          // let bsdm = this.getState().bsdm;
          // const dataFeedIds = dmGetDataFeedIdsForSign(bsdm);
          // dataFeedIds.forEach( (dataFeedId) => {
          //   const dmDataFeed = dmGetDataFeedById(bsdm, { id: dataFeedId });
          //   let dataFeed : DataFeed = new DataFeed(dmDataFeed);
          //   this.dataFeeds[dmDataFeed.id] = dataFeed;
          //   this.dispatch(addDataFeed(dataFeed));
          // });

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

  openSyncSpec(filePath : string = '') {
    return new Promise( (resolve, reject) => {
      fs.readFile(filePath, (err, dataBuffer) => {

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

  buildPoolAssetFiles(syncSpec : Object, pathToPool : string) : Object {

    let poolAssetFiles = {};

    syncSpec.files.download.forEach( (syncSpecFile) => {
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
      const filePath = path.join(rootPath, syncSpecFile.link);

      fs.readFile(filePath, (err, dataBuffer) => {
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
      debugger;
      // is the following correct? check with autorun classic
      this.liveDataFeedsToDownload.push(liveDataFeed);

      // launch download of first feed
      if (this.liveDataFeedsToDownload.length === 1) {
        dataFeed.retrieveFeed(this);
      }
    }
  }


  buildPresentation(filePath : string) {

    return (dispatch : Function, getState : Function) => {

      debugger;

      flibbet(specificCallback);

      const dpFeedUrl : bsdmParameterizedString =
        new bsdmParameterizedString('http://bsnm.s3.amazonaws.com/ted/ade7af41a29d90abb1aa546a0721f999');

      let adderAction = addDataFeed(dmAddBsnDataFeed, 'africa', DataFeedType.BSNDynamicPlaylist,
        dpFeedUrl.dmParameterizedString,
        237307,
        'africa',
        DataFeedUsageType.Content,
        60);

      // let adderAction = bsdmAddBsnDataFeed('africa', DataFeedType.BSNDynamicPlaylist,
      //   dpFeedUrl.dmParameterizedString,
      //   237307,
      //   'africa',
      //   DataFeedUsageType.Content,
      //   60);

      // const bsnDataFeedAdder : IAddBSNDataFeed = new BSNDataFeedAdder();
      // let adderAction = bsnDataFeedAdder.addBSNDataFeed('africa', DataFeedType.BSNDynamicPlaylist,
      //   dpFeedUrl.dmParameterizedString,
      //   237307,
      //   'africa',
      //   DataFeedUsageType.Content,
      //   60);

      const innerAction = dispatch(adderAction);


      const dataFeedId = innerAction.payload.id;
      const mrssDataFeedContentItem = new bsdmMrssDataFeedContentItem('africaDF', dataFeedId, false);

      let state = getState();

      const bsdm = new bsdmState(getState().bsdm);
      bsdm.zones.forEach( (zone) => {
        if (zone.type === 'VideoOrImages' || zone.type === 'VideoOnly' || zone.type === 'Images') {
          const dmMediaStateContainer : Object = bsdm.getZoneMediaStateContainer(zone.id);
          const action = bsdm.appendMediaState(dmMediaStateContainer, mrssDataFeedContentItem.mrssDataFeedContentItem);
          dispatch(action).then( (_) => {
            state = getState();
            this.savePresentationAs(dmGetSignState(state.bsdm), filePath);
            debugger;
          }).catch((err) => {
            console.log(err);
            debugger;
          });
        }
      });
    };
  }

  savePresentationAs(presentation : Object, path : string) {

    const bpfStr = JSON.stringify(presentation, null, '\t');
    fs.writeFileSync(path, bpfStr);
  }

}

export const bsp = new BSP();

