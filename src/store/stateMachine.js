// @flow

import fs from 'fs';
import path from 'path';

const xml2js = require('xml2js');

const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

import {
  dmOpenSign,
} from '@brightsign/bsdatamodel';


// ------------------------------------
// Constants
// ------------------------------------
export const SET_SYNC_SPEC = 'SET_SYNC_SPEC';
export const SET_POOL_ASSET_FILES = 'SET_POOL_ASSET_FILES';
export const SET_PLAYBACK_STATE = 'SET_PLAYBACK_STATE';

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


// ------------------------------------
// Action Creators
// ------------------------------------
export function initStateMachine(rootPath : string) {
  return (dispatch : Function, getState : Function) => {
    launchPresentationPlayback(rootPath, dispatch, getState);
  };
}

export function restartPresentation(rootPath : string) {
  return (dispatch : Function, getState : Function) => {
    launchPresentationPlayback(rootPath, dispatch, getState);
  };
}


// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  syncSpec : {},
  poolAssetFiles : {},
  playbackState: 'active'
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
  }

  return state;
}


// ------------------------------------
// Utilities
// ------------------------------------
function convertSyncSpec(syncSpec : Object) : Object {

  let newSyncSpec = {};

  newSyncSpec.meta = {};
  newSyncSpec.meta.client = {};

  let client = newSyncSpec.meta.client;
  let bogusClient = syncSpec.sync.meta[0].client[0];

  client.diagnosticLoggingEnabled = bogusClient.diagnosticLoggingEnabled[0];
  client.enableSerialDebugging = bogusClient.enableSerialDebugging[0];
  client.enableSystemDebugging = bogusClient.enableSystemLogDebugging[0];
  client.eventLoggingEnabled = bogusClient.eventLoggingEnabled[0];
  client.limitStorageSpace = bogusClient.limitStorageSpace[0];
  client.playbackLoggingEnabled = bogusClient.playbackLoggingEnabled[0];
  client.stateLoggingEnabled = bogusClient.stateLoggingEnabled[0];
  client.uploadLogFilesAtBoot = bogusClient.uploadLogFilesAtBoot[0];
  client.uploadLogFilesAtSpecificTime = bogusClient.uploadLogFilesAtSpecificTime[0];
  client.uploadLogFilesTime = bogusClient.uploadLogFilesTime[0];
  client.variableLoggingEnabled = bogusClient.variableLoggingEnabled[0];

  newSyncSpec.files = [];
  let bogusFiles = syncSpec.sync.files[0];

  // let bogusDelete = bogusFiles.delete;
  let bogusDownload = bogusFiles.download;
  // let bogusIgnore = bogusFiles.ignore;

  // TODO - newSyncSpec.delete
  // TODO - newSyncSpec.ignore

  bogusDownload.forEach( (download) => {

    let hash = {};
    hash['#'] =  download.hash[0]._;
    hash['@'] = {};
    hash['@'].method = download.hash[0].$.method;

    newSyncSpec.files.push( {
      group : download.group,
      hash,
      link : download.link[0],
      name : download.name[0],
      size : Number(download.size[0])
    });
  });

  return newSyncSpec;
}

function getGoodSyncSpec(rootPath : string) {
  return new Promise( (resolve, reject) => {
    fs.readFile(path.join(rootPath, 'local-sync.xml'), (err, dataBuffer) => {
      if (err) {
        reject(err);
      } else {
        const syncSpecStr : string = decoder.write(dataBuffer);
        let parser = new xml2js.Parser();
        try {
          parser.parseString(syncSpecStr, (err, bogusSyncSpec) => {
            if (err) {
              console.log(err);
              debugger;
            }
            console.log(bogusSyncSpec);
            let syncSpec = convertSyncSpec(bogusSyncSpec);
            console.log(syncSpec);
            resolve(syncSpec);
          });
        }
        catch (e) {
          console.log(e);
          debugger;
        }
      }
    });
  });
}

function launchPresentationPlayback(rootPath : string, dispatch : Function, getState : Function) {
  let syncSpec: Object = {};

  getGoodSyncSpec(rootPath).then((cardSyncSpec) => {
    dispatch(setSyncSpec(cardSyncSpec));

    syncSpec = cardSyncSpec;

    const poolAssetFiles = buildPoolAssetFiles(syncSpec, rootPath);
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

  }).catch((err) => {
    console.log(err);
    debugger;
  });
}

  // openSyncSpec(path.join(rootPath, 'local-sync.json')).then( (cardSyncSpec) => {
  //
  //   dispatch(setSyncSpec(cardSyncSpec));
  //
  //   syncSpec = cardSyncSpec;
  //
  //   const poolAssetFiles = buildPoolAssetFiles(syncSpec, rootPath);
  //   dispatch(setPoolAssetFiles(poolAssetFiles));
  //
  //   return getAutoschedule(syncSpec, rootPath);
  //
  // }).then( (autoSchedule) => {
  //
  //   console.log(autoSchedule);
  //   return getBml(autoSchedule, syncSpec, rootPath);
  //
  // }).then( (autoPlay) => {
  //
  //   console.log(autoPlay);
  //   dispatch(dmOpenSign(autoPlay));
  //   const state = getState();
  //   console.log(state);
  //
  // }).catch( (err) => {
  //   console.log(err);
  //   debugger;
  // });

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

function buildPoolAssetFiles(syncSpec : Object, rootPath : string) : Object {

  let poolAssetFiles = {};
  
  syncSpec.files.forEach( (syncSpecFile) => {

    const hashValue = syncSpecFile.hash["#"];

    const relativePath = buildPoolFilePath(hashValue);
    const filePath = path.join(rootPath, 'pool', relativePath, 'sha1-' + hashValue.toString());

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
