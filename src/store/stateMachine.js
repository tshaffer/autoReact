// @flow

import fs from 'fs';
import path from 'path';

const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

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

    const state : Object = getState();

    openSyncSpec(path.join(rootPath, 'local-sync.json')).then( (syncSpec) => {
      dispatch(setSyncSpec(syncSpec));
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

// ------------------------------------
// Selectors
// ------------------------------------

