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
  ZoneHSM
} from '../hsm/zoneHSM';

import { addZoneHSM } from './zoneHSMs';

import { setActiveState } from './zone';

// ------------------------------------
// Constants
// ------------------------------------
export const SET_SYNC_SPEC = 'SET_SYNC_SPEC';
export const SET_POOL_ASSET_FILES = 'SET_POOL_ASSET_FILES';
export const SET_PLAYBACK_STATE = 'SET_PLAYBACK_STATE';
export const ADD_ZONE = 'ADD_ZONE';
export const POST_MESSAGE = 'POST_MESSAGE';
export const REGISTER_HSM = 'REGISTER_HSM';

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

export function addZone(zoneId : string, zone : Object) {

  return {
    type: ADD_ZONE,
    payload: {
      zoneId,
      zone
    }
  };
}

export function registerHSM(hsm : Object) {

  return {
    type: REGISTER_HSM,
    payload: hsm
  };
}


// ------------------------------------
// Action Creators
// ------------------------------------
export function initStateMachine(rootPath : string, pathToPool : string) {
  return (dispatch : Function, getState : Function) => {
    launchPresentationPlayback(rootPath, pathToPool, dispatch, getState);
  };
}

export function restartPresentation(rootPath : string, pathToPool : string) {
  return (dispatch : Function, getState : Function) => {
    launchPresentationPlayback(rootPath, pathToPool, dispatch, getState);
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
  zonesById: {},
  hsm: []
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

    case ADD_ZONE: {

      let newZonesById = Object.assign({}, state.zonesById);
      newZonesById[action.payload.zoneId] = action.payload.zone;

      let newState = {
        ...state,
        zonesById: newZonesById
      };

      return newState;
    }

    case REGISTER_HSM: {

      let newState = Object.assign({}, state);
      newState.hsm.push(action.payload);

      return newState;
    }
  }

  return state;
}


// ------------------------------------
// Utilities
// ------------------------------------
function launchPresentationPlayback(rootPath : string, pathToPool : string, dispatch : Function, getState : Function) {
  let syncSpec: Object = {};

  openSyncSpec(path.join(rootPath, 'local-sync.json')).then((cardSyncSpec) => {

    dispatch(setSyncSpec(cardSyncSpec));

    syncSpec = cardSyncSpec;

    const poolAssetFiles = buildPoolAssetFiles(syncSpec, pathToPool);
    dispatch(setPoolAssetFiles(poolAssetFiles));

    return getAutoschedule(syncSpec, rootPath);

  }).then((autoSchedule) => {

    console.log(autoSchedule);
    return getBml(autoSchedule, syncSpec, rootPath);

  }).then((autoPlay) => {

    console.log(autoPlay);
    dispatch(dmOpenSign(autoPlay));
    const state = getState();
    console.log(state);
    buildSign(dispatch, state.bsdm);

  }).catch((err) => {
    console.log(err);
    debugger;
  });
}

function buildSign(dispatch : Function, bsdm : Object) {

  const zoneIds = dmGetZonesForSign(bsdm);
  zoneIds.forEach( (zoneId) => {
    const zoneHSM = new ZoneHSM(dispatch, bsdm, zoneId);
    dispatch(addZoneHSM(zoneHSM, zoneId));
    dispatch(registerHSM(zoneHSM));
  });

}

function getFile(syncSpec : Object, fileName : string) : ?Object {

  let file = null;

  syncSpec.files.forEach( (syncSpecFile) => {
    if (syncSpecFile.name === fileName) {
      file = syncSpecFile;
      return;
    }
  });

  return file;
}

function buildPoolFilePath(sha1: string) {

  let relativeFilePath = '';

  if (sha1.length >= 2) {

    let folders = [];
    folders.push(sha1.substring(sha1.length - 2, sha1.length - 2 + 1));
    folders.push(sha1.substring(sha1.length - 1, sha1.length - 1 + 1));

    relativeFilePath = path.join(folders[0], folders[1]);
  }
  else {
    // not sure if this case can occur
    debugger;
  }

  return relativeFilePath;
}


function getSyncSpecFile(fileName : string, syncSpec : Object, rootPath : string) {

  return new Promise( (resolve, reject) => {

    let syncSpecFile = getFile(syncSpec, fileName);
    if (syncSpecFile == null) {
      debugger;
      syncSpecFile = {};    // required to eliminate flow warnings
    }

    const hashValue = syncSpecFile.hash["#"];
    // const hashMethod = syncSpecFile.hash['@'];
    const fileSize = syncSpecFile.size;
    // const link = syncSpecFile.link;

    const relativePath = buildPoolFilePath(hashValue);
    const filePath = path.join(rootPath, 'pool', relativePath, 'sha1-' + hashValue.toString());

    fs.readFile(filePath, (err, dataBuffer) => {
      if (err) {
        reject(err);
      } else {
        const fileStr : string = decoder.write(dataBuffer);
        const file : Object = JSON.parse(fileStr);

        if (fileSize !== fileStr.length) {
          debugger;
        }
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
  
  syncSpec.files.forEach( (syncSpecFile) => {

    const hashValue = syncSpecFile.hash["#"];

    const relativePath = buildPoolFilePath(hashValue);
    const filePath = path.join(pathToPool, 'pool', relativePath, 'sha1-' + hashValue.toString());

    poolAssetFiles[syncSpecFile.name] = filePath;
    
  });

  return poolAssetFiles;
}

function getAutoschedule(syncSpec : Object, rootPath : string) {
  return getSyncSpecFile('autoschedule.json', syncSpec, rootPath);
}

function getBml(autoSchedule : Object, syncSpec : Object, rootPath : string) {

  const scheduledPresentation = autoSchedule.scheduledPresentation;
  const presentationToSchedule = scheduledPresentation.presentationToSchedule;
  const presentationName = presentationToSchedule.name;
  const bmlFileName = presentationName + '.bml';

  return getSyncSpecFile(bmlFileName, syncSpec, rootPath);
}

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

  hsmList.forEach( (hsm) => {
    console.log('before: ', hsm.activeState);
    hsm.Dispatch(event);
    console.log('after: ', hsm.activeState);

    // update activeEvent
    dispatch(setActiveState(hsm.activeState));
  });
}

