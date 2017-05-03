/* @flow */

import fs from 'fs';
import path from 'path';

const xml2js = require('xml2js');

const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

import {
  DataFeedType,
  DataFeedUsageType,
} from '@brightsign/bscore';

import {
  dmOpenSign,
  dmGetSimpleStringFromParameterizedString,
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
  PlayerHSM
} from '../hsm/playerHSM';

import {
  ZoneHSM
} from '../hsm/zoneHSM';

import {
  TickerZoneHSM
} from '../hsm/tickerZoneHSM';

import {
  ARLiveDataFeed
} from '../entities/liveDataFeed';

import {
  addDataFeed
} from '../store/dataFeeds';

let _singleton = null;

class BSP {

  store : Object;
  dispatch : Function;
  getState : Function;
  playerHSM : Object;
  hsmList : Array<Object>;
  syncSpec : Object;
  liveDataFeedsByTimer : Object;
  liveDataFeedsToDownload : Array<Object>;
  arLiveDataFeeds : Object;

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
    this.arLiveDataFeeds = {};

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

          // get data feeds for the sign
          let bsdm = this.getState().bsdm;
          const dataFeedIds = dmGetDataFeedIdsForSign(bsdm);
          dataFeedIds.forEach( (dataFeedId) => {
            const dataFeed = dmGetDataFeedById(bsdm, { id: dataFeedId });
            let arLiveDataFeed : ARLiveDataFeed = new ARLiveDataFeed(dataFeed);
            this.arLiveDataFeeds[dataFeed.name] = arLiveDataFeed;
            this.dispatch(addDataFeed(arLiveDataFeed));
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

  queueRetrieveLiveDataFeed(liveDataFeed : Object) {

    if (liveDataFeed.usage === DataFeedUsageType.Text) {
      this.retrieveLiveDataFeed(liveDataFeed);
    }
    else {
      debugger;
      this.liveDataFeedsToDownload.push(liveDataFeed.name);

      // launch download of first feed
      if (this.liveDataFeedsToDownload.length === 1) {
        this.retrieveLiveDataFeed(liveDataFeed);
      }
    }
  }

  retrieveLiveDataFeed(liveDataFeed : Object) {

    const url = dmGetSimpleStringFromParameterizedString(liveDataFeed.url);

    fetch(url)
      .then( (response) => {
        let blobPromise = response.text();
        blobPromise.then( (content) => {
          let parser = new xml2js.Parser();
          try {
            parser.parseString(content, (err, jsonResponse) => {
              if (err) {
                console.log(err);
                debugger;
              }
              console.log(jsonResponse);
              this.processLiveDataFeed(liveDataFeed, jsonResponse);
            });
          }
          catch (e) {
            console.log(e);
            debugger;
          }
        });
      }).catch( (err) => {
        console.log(err);
        debugger;
      });
  }

  processLiveDataFeed(liveDataFeed : Object, feedData : Object) {

    let arLiveDataFeed = this.arLiveDataFeeds[liveDataFeed.name];

    if (liveDataFeed.usage === DataFeedUsageType.Content &&
      (liveDataFeed.DataFeedType === DataFeedType.BSNDynamicPlaylist) ||
      (liveDataFeed.DataFeedType === DataFeedType.BSNMediaFeed)) {
      console.log(liveDataFeed,' not supported yet');
      debugger;
    }
    else {
      arLiveDataFeed.parseSimpleRSSFeed(feedData);
    }

    // send internal message indicating that the data feed has been updated
    let event = {
      'EventType' : 'LIVE_DATA_FEED_UPDATE',
      'EventData' : arLiveDataFeed
    };
    this.dispatch(this.postMessage(event));


    // updateInterval% = liveDataFeed.updateInterval%

    // ' set a timer to update this live data feed
    // liveDataFeed.RestartLiveDataFeedDownloadTimer(updateInterval%)

  }
}

export const bsp = new BSP();

