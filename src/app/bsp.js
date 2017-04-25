/* @flow */

import fs from 'fs';
import path from 'path';

const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

import {
  dmOpenSign,
  dmGetZonesForSign,
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
  setActiveMediaState
} from '../store/activeMediaStates';

let _singleton = null;

class BSP {

  store : Object;
  dispatch : Function;
  getState : Function;
  playerHSM : Object;
  hsmList : Array<Object>;
  syncSpec : Object;

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
      const zoneHSM = new ZoneHSM(bsdm, zoneId);
      zoneHSMs.push(zoneHSM);
      this.hsmList.push(zoneHSM);
    });

    zoneHSMs.forEach( (zoneHSM) => {
      zoneHSM.constructorFunction();
      zoneHSM.initialize();
      this.dispatch(setActiveMediaState(zoneHSM.id, zoneHSM.activeState.id));
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

      this.dispatch(setActiveMediaState(hsm.id, hsm.activeState.id));
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

          // disable to allow hacking of files - that is, overwriting files in the pool without updating the sync spec
          // with updated sha1
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
}

export const bsp = new BSP();

