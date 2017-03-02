// @flow

import fs from 'fs';
import path from 'path';

const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

// ------------------------------------
// Constants
// ------------------------------------

// ------------------------------------
// Actions
// ------------------------------------

// ------------------------------------
// Action Creators
// ------------------------------------
export function initStateMachine(rootPath : string) {
  return (dispatch : Function, getState : Function) => {

    const state : Object = getState();
    console.log(state);
    console.log(rootPath);
    console.log(dispatch);

    openSyncSpec(path.join(rootPath, 'local-sync.json')).then( (syncSpec) => {
      debugger;
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
};

export default function(state : Object = initialState, action : string) {

  // switch (action.type) {
  //
  // }

  console.log('stateMachine reducer: ', state);
  console.log(action);


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

