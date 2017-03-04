// @flow

import fs from 'fs';
import path from 'path';

const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

import {
  dmOpenSign,
} from '@brightsign/bsdatamodel';


// ------------------------------------
// Constants
// ------------------------------------
export const SET_SYNC_SPEC = 'SET_SYNC_SPEC';

// ------------------------------------
// Actions
// ------------------------------------
export function setSyncSpec(syncSpec : Object){

  return {
    type: SET_SYNC_SPEC,
    payload: syncSpec
  };
}

// ------------------------------------
// Action Creators
// ------------------------------------
export function initStateMachine(rootPath : string) {
  return (dispatch : Function, getState : Function) => {

    let syncSpec : Object = {};

    openSyncSpec(path.join(rootPath, 'local-sync.json')).then( (cardSyncSpec) => {

      dispatch(setSyncSpec(cardSyncSpec));

      syncSpec = cardSyncSpec;
      return getAutoschedule(syncSpec, rootPath);

    }).then( (autoSchedule) => {

      console.log(autoSchedule);
      return getBml(autoSchedule, syncSpec, rootPath);

    }).then( (autoPlay) => {

      console.log(autoPlay);
      dispatch(dmOpenSign(autoPlay));
      const state = getState();
      console.log(state);

    }).catch( (err) => {
      console.log(err);
      debugger;
    });
  };
}


// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  syncSpec : {},
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
  }

  return state;
}


// ------------------------------------
// Utilities
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


function getSyncSpecFile(fileName : string, syncSpec : Object, rootFolder : string) {

  return new Promise( (resolve, reject) => {

    const syncSpecFile = getFile(syncSpec, fileName);
    if (!syncSpecFile) {
      debugger;
    }

    const hashValue = syncSpecFile.hash["#"];
    // const hashMethod = syncSpecFile.hash['@'];
    const fileSize = syncSpecFile.size;
    // const link = syncSpecFile.link;

    const relativePath = getPoolFilePath(hashValue);
    const filePath = path.join(rootFolder, 'pool', relativePath, 'sha1-' + hashValue.toString());

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

function getAutoschedule(syncSpec : Object, rootFolder : string) {
  return getSyncSpecFile('autoschedule.json', syncSpec, rootFolder);
}


function getBml(autoSchedule : Object, syncSpec : Object, rootFolder : string) {

  const scheduledPresentation = autoSchedule.scheduledPresentation;
  const presentationToSchedule = scheduledPresentation.presentationToSchedule;
  const presentationName = presentationToSchedule.name;
  const bmlFileName = presentationName + '.bml';

  return getSyncSpecFile(bmlFileName, syncSpec, rootFolder);
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


function getPoolFilePath(sha1: string) {

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


// ------------------------------------
// Selectors
// ------------------------------------

