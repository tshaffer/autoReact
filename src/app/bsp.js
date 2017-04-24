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

export let myBSP = {};

export class BSP {

  store : Object;
  playerHSM : Object;
  hsmList : Array<Object>;
  syncSpec : Object;

  constructor(reduxStore : Object) {
    this.store = reduxStore;
    // this.syncSpec = null;
    this.hsmList = [];

    myBSP = this;
  }

  initialize() {

    const dispatch = this.store.dispatch;
    const getState = this.store.getState;

    const rootPath: string = PlatformService.default.getRootDirectory();
    const pathToPool: string = PlatformService.default.getPathToPool();

    let state;

    this.openSyncSpec(path.join(rootPath, 'local-sync.json')).then((cardSyncSpec) => {

      this.syncSpec = cardSyncSpec;

      const poolAssetFiles = this.buildPoolAssetFiles(this.syncSpec, pathToPool);
      setPoolAssetFiles(poolAssetFiles);

      state = this.store.getState();

// Create player state machine
      this.playerHSM = new PlayerHSM(this, dispatch, getState, state.bsdm);

// Zone state machines are created by the Player state machine when it parses the schedule and autoplay files
      this.playerHSM.initialize(dispatch, getState);

    }).catch((err) => {
      console.log(err);
      debugger;
    });
  }

  startPlayback(dispatch : Function, bsdm : Object) {

    let zoneHSMs = [];

    const zoneIds = dmGetZonesForSign(bsdm);
    zoneIds.forEach( (zoneId) => {
      const zoneHSM = new ZoneHSM(dispatch, bsdm, zoneId);
      zoneHSMs.push(zoneHSM);
      this.hsmList.push(zoneHSM);
    });

    zoneHSMs.forEach( (zoneHSM) => {
      zoneHSM.constructorFunction();
      zoneHSM.initialize();
      dispatch(setActiveMediaState(zoneHSM.id, zoneHSM.activeState.id));
    });
  }

  restartPlayback(presentationName : string, dispatch : Function, getState : Function) {

    console.log('restart: ', presentationName);

    const rootPath: string = PlatformService.default.getRootDirectory();

    return new Promise( (resolve) => {
      this.getAutoschedule(this.syncSpec, rootPath).then( (autoSchedule) => {

        // TODO - only a single scheduled item is supported

        const scheduledPresentation = autoSchedule.scheduledPresentations[0];
        const presentationToSchedule = scheduledPresentation.presentationToSchedule;
        const presentationName = presentationToSchedule.name;
        const bmlFileName = presentationName + '.bml';

        this.getSyncSpecFile(bmlFileName, this.syncSpec, rootPath).then( (autoPlay) => {
          console.log(autoPlay);
          dispatch(dmOpenSign(autoPlay));
          let state = getState();
          console.log(state);

          resolve();

        });
      });

    });
  }

  postMessage(event : Object) {
    return (dispatch: Function, getState: Function) => {
      this.dispatchEvent(dispatch, getState, event);
    };
  }

  dispatchEvent(dispatch : Function, getState : Function, event : Object) {

    this.playerHSM.Dispatch(event);

    this.hsmList.forEach( (hsm) => {
      console.log('before: ', hsm.activeState);
      hsm.Dispatch(event);
      console.log('after: ', hsm.activeState);

      dispatch(setActiveMediaState(hsm.id, hsm.activeState.id));

      const state = getState();
      console.log(state);
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
