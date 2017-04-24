// @flow

// import fs from 'fs';
// import path from 'path';

// const StringDecoder = require('string_decoder').StringDecoder;
// const decoder = new StringDecoder('utf8');

// import {
//   dmOpenSign,
//   dmGetZonesForSign,
// } from '@brightsign/bsdatamodel';

// import PlatformService from '../platform';

// import { setActiveMediaState } from './activeMediaStates';

// ------------------------------------
// Constants
// ------------------------------------
export const SET_POOL_ASSET_FILES = 'SET_POOL_ASSET_FILES';
export const SET_PLAYBACK_STATE = 'SET_PLAYBACK_STATE';

// ------------------------------------
// Actions
// ------------------------------------
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
// export function restartPresentation(rootPath : string, pathToPool : string) {
//   return (dispatch : Function, getState : Function) => {
//     runBSP(rootPath, pathToPool, dispatch, getState);
//   };
// }

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  poolAssetFiles : {},
  playbackState: 'active',
};

export default function(state : Object = initialState, action : Object) {

  switch (action.type) {

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


//
// ------------------------------------
// Selectors
// ------------------------------------
export function getPoolFilePath(state : Object, resourceIdentifier : string) {

  const stateMachine = state.stateMachine;
  const filePath =  stateMachine.poolAssetFiles[resourceIdentifier];
  console.log('resourceIdentifier: ' + resourceIdentifier + ', filePath: ' +  filePath);
  return filePath;
}


