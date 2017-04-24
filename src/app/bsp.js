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
  PlayerHSM
} from '../hsm/playerHSM';

import {
  ZoneHSM
} from '../hsm/zoneHSM';

import {
  setActiveMediaState
} from '../store/activeMediaStates';

import {
  registerHSM,
  setSyncSpec,
  setPoolAssetFiles,
  setPlayerHSM,
} from '../store/stateMachine';

export let myBSP = {};

export class BSP {

  store : Object;
  syncSpec : Object;

  constructor(reduxStore : Object) {
    this.store = reduxStore;
    // this.syncSpec = null;

    myBSP = this;
  }

  run() {

    const dispatch = this.store.dispatch;
    const getState = this.store.getState;

    const rootPath: string = PlatformService.default.getRootDirectory();
    const pathToPool: string = PlatformService.default.getPathToPool();

    let state;

    this.openSyncSpec(path.join(rootPath, 'local-sync.json')).then((cardSyncSpec) => {

      dispatch(setSyncSpec(cardSyncSpec));

      this.syncSpec = cardSyncSpec;

      const poolAssetFiles = this.buildPoolAssetFiles(this.syncSpec, pathToPool);
      dispatch(setPoolAssetFiles(poolAssetFiles));

      state = this.store.getState();

// Create player state machine
      const playerHSM = new PlayerHSM(this, dispatch, getState, state.bsdm);
      dispatch(setPlayerHSM(playerHSM));

// Zone state machines are created by the Player state machine when it parses the schedule and autoplay files
      playerHSM.initialize(dispatch, getState);

    }).catch((err) => {
      console.log(err);
      debugger;
    });

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

  getAutoschedule(syncSpec : Object, rootPath : string) {
    return this.getSyncSpecFile('autoschedule.json', syncSpec, rootPath);
  }

  postMessage(event : Object) {
    return (dispatch: Function, getState: Function) => {
      this.dispatchEvent(dispatch, getState, event);
    };
  }

  dispatchEvent(dispatch : Function, getState : Function, event : Object) {

    const stateMachine = getState().stateMachine;
    const hsmList : Array<Object> = stateMachine.hsm;

    stateMachine.playerHSM.Dispatch(event);

    hsmList.forEach( (hsm) => {
      console.log('before: ', hsm.activeState);
      hsm.Dispatch(event);
      console.log('after: ', hsm.activeState);

      dispatch(setActiveMediaState(hsm.id, hsm.activeState.id));

      const state = getState();
      console.log(state);
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

  restart(presentationName : string, dispatch : Function, getState : Function) {

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

  startPlayback(dispatch : Function, bsdm : Object) {

    let zoneHSMs = [];

    const zoneIds = dmGetZonesForSign(bsdm);
    zoneIds.forEach( (zoneId) => {
      const zoneHSM = new ZoneHSM(dispatch, bsdm, zoneId);
      zoneHSMs.push(zoneHSM);
      dispatch(registerHSM(zoneHSM));
    });

    zoneHSMs.forEach( (zoneHSM) => {
      zoneHSM.constructorFunction();
      zoneHSM.initialize();
      dispatch(setActiveMediaState(zoneHSM.id, zoneHSM.activeState.id));
    });
  }

}
