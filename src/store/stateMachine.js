// @flow

import fs from 'fs';
import path from 'path';

const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

import {
  dmOpenSign,
  dmGetZonesForSign,
} from '@brightsign/bsdatamodel';

import {
  PlayerHSM
} from '../hsm/playerHSM';

import {
  ZoneHSM
} from '../hsm/zoneHSM';

import PlatformService from '../platform';

import { setActiveMediaState } from './activeMediaStates';

// ------------------------------------
// Constants
// ------------------------------------
export const SET_SYNC_SPEC = 'SET_SYNC_SPEC';
export const SET_POOL_ASSET_FILES = 'SET_POOL_ASSET_FILES';
export const SET_PLAYBACK_STATE = 'SET_PLAYBACK_STATE';
export const POST_MESSAGE = 'POST_MESSAGE';
export const REGISTER_HSM = 'REGISTER_HSM';
export const SET_PLAYER_HSM = 'SET_PLAYER_HSM';

// ------------------------------------
// Actions
// ------------------------------------
export function setSyncSpec(syncSpec : Object){

  return {
    type: SET_SYNC_SPEC,
    payload: syncSpec
  };
}

export function setPoolAssetFiles(poolAssetFiles : Object) {

  return {
    type: SET_POOL_ASSET_FILES,
    payload: poolAssetFiles
  };
}

export function setPlaybackState(playbackState : string){

  return {
    type: SET_PLAYBACK_STATE,
    payload: playbackState
  };
}

export function registerHSM(hsm : Object) {

  return {
    type: REGISTER_HSM,
    payload: hsm
  };
}

export function setPlayerHSM(playerHSM : Object){

  return {
    type: SET_PLAYER_HSM,
    payload: playerHSM
  };
}


// ------------------------------------
// Action Creators
// ------------------------------------
export function initBSP(rootPath : string, pathToPool : string) {
  return (dispatch : Function, getState : Function) => {
    runBSP(rootPath, pathToPool, dispatch, getState);
  };
}

export function restartPresentation(rootPath : string, pathToPool : string) {
  return (dispatch : Function, getState : Function) => {
    runBSP(rootPath, pathToPool, dispatch, getState);
  };
}

export function postMessage(event : Object) {
  return (dispatch: Function, getState: Function) => {
    dispatchEvent(dispatch, getState, event);
  };
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  syncSpec : {},
  poolAssetFiles : {},
  playbackState: 'active',
  hsm: [],
  playerHSM: {}
};

export default function(state : Object = initialState, action : Object) {

  switch (action.type) {

    case SET_SYNC_SPEC: {

      let newState = {
        ...state,
        syncSpec: action.payload
      };

      console.log(newState);
      return newState;
    }

    case SET_POOL_ASSET_FILES: {

      let newState = {
        ...state,
        poolAssetFiles: action.payload
      };

      console.log(newState);
      return newState;
    }

    case SET_PLAYBACK_STATE: {

      let newState = {
        ...state,
        playbackState: action.payload
      };

      console.log(newState);
      return newState;
    }

    case REGISTER_HSM: {

      let newState = Object.assign({}, state);
      newState.hsm.push(action.payload);

      return newState;
    }

    case SET_PLAYER_HSM: {
      let newState = {
        ...state,
        playerHSM: action.payload
      };

      return newState;
    }
  }

  return state;
}


// ------------------------------------
// Utilities
// ------------------------------------
let syncSpec: Object = {};

function runBSP(rootPath : string, pathToPool : string, dispatch : Function, getState : Function) {

  let state;

  openSyncSpec(path.join(rootPath, 'local-sync.json')).then((cardSyncSpec) => {

    dispatch(setSyncSpec(cardSyncSpec));

    syncSpec = cardSyncSpec;

    const poolAssetFiles = buildPoolAssetFiles(syncSpec, pathToPool);
    dispatch(setPoolAssetFiles(poolAssetFiles));


    state = getState();

// Create player state machine
    const playerHSM = new PlayerHSM(dispatch, state.bsdm);
    dispatch(setPlayerHSM(playerHSM));

// Zone state machines are created by the Player state machine when it parses the schedule and autoplay files
    playerHSM.initialize(dispatch, getState);

    // return getAutoschedule(syncSpec, rootPath);

  // }).then((autoSchedule) => {
  //
  //   console.log(autoSchedule);
    // return getBml(autoSchedule, syncSpec, rootPath);

  // }).then((autoPlay) => {
  //
  //   console.log(autoPlay);
  //   dispatch(dmOpenSign(autoPlay));
  //   state = getState();
  //   console.log(state);
  //   // buildBSP(dispatch, state.bsdm);
  //   // buildSign(dispatch, state.bsdm);
  }).catch((err) => {
    console.log(err);
    debugger;
  });
}


export function restartBSP(presentationName : string, dispatch : Function, getState : Function) {

  const rootPath: string = PlatformService.default.getRootDirectory();

  return new Promise( (resolve, reject) => {
    getAutoschedule(syncSpec, rootPath).then( (autoSchedule) => {

      // TODO - only a single scheduled item is supported

      const scheduledPresentation = autoSchedule.scheduledPresentations[0];
      const presentationToSchedule = scheduledPresentation.presentationToSchedule;
      const presentationName = presentationToSchedule.name;
      const bmlFileName = presentationName + '.bml';

      getSyncSpecFile(bmlFileName, syncSpec, rootPath).then( (autoPlay) => {
        console.log(autoPlay);
        dispatch(dmOpenSign(autoPlay));
        let state = getState();
        console.log(state);
      });
    });

    resolve();
  });
}

export function startBSPPlayback(dispatch : Function, bsdm : Object) {

  const zoneIds = dmGetZonesForSign(bsdm);
  zoneIds.forEach( (zoneId) => {
    const zoneHSM = new ZoneHSM(dispatch, bsdm, zoneId);
    dispatch(registerHSM(zoneHSM));
  });
}

// function buildSign(dispatch : Function, bsdm : Object) {
//
//   const zoneIds = dmGetZonesForSign(bsdm);
//   zoneIds.forEach( (zoneId) => {
//     const zoneHSM = new ZoneHSM(dispatch, bsdm, zoneId);
//     dispatch(registerHSM(zoneHSM));
//   });
// }

function getFile(syncSpec : Object, fileName : string) : ?Object {

  let file = null;

  syncSpec.files.download.forEach( (syncSpecFile) => {
    if (syncSpecFile.name === fileName) {
      file = syncSpecFile;
      return;
    }
  });

  return file;
}


function getSyncSpecFile(fileName : string, syncSpec : Object, rootPath : string) {

  return new Promise( (resolve, reject) => {

    let syncSpecFile = getFile(syncSpec, fileName);
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

// ------------------------------------
// App support functions
// ------------------------------------

function openSyncSpec(filePath : string = '') {
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

function buildPoolAssetFiles(syncSpec : Object, pathToPool : string) : Object {

  let poolAssetFiles = {};
  
  syncSpec.files.download.forEach( (syncSpecFile) => {
    poolAssetFiles[syncSpecFile.name] = path.join(pathToPool, syncSpecFile.link);
  });

  return poolAssetFiles;
}

function getAutoschedule(syncSpec : Object, rootPath : string) {
  return getSyncSpecFile('autoschedule.json', syncSpec, rootPath);
}

// function getBml(autoSchedule : Object, syncSpec : Object, rootPath : string) {
//
//   // TODO - only a single scheduled item is supported
//
//   const scheduledPresentation = autoSchedule.scheduledPresentations[0];
//   const presentationToSchedule = scheduledPresentation.presentationToSchedule;
//   const presentationName = presentationToSchedule.name;
//   const bmlFileName = presentationName + '.bml';
//
//   return getSyncSpecFile(bmlFileName, syncSpec, rootPath);
// }

// ------------------------------------
// Selectors
// ------------------------------------
export function getPoolFilePath(state : Object, resourceIdentifier : string) {

  const stateMachine = state.stateMachine;
  const filePath =  stateMachine.poolAssetFiles[resourceIdentifier];
  console.log('resourceIdentifier: ' + resourceIdentifier + ', filePath: ' +  filePath);
  return filePath;
}

// ------------------------------------
// ??
// ------------------------------------
function dispatchEvent(dispatch : Function, getState : Function, event : Object) {

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

