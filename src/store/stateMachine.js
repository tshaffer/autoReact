// @flow

// import fs from 'fs';
// import path from 'path';

// const StringDecoder = require('string_decoder').StringDecoder;
// const decoder = new StringDecoder('utf8');

// import {
//   dmOpenSign,
//   dmGetZonesForSign,
// } from '@brightsign/bsdatamodel';

// import {
//   PlayerHSM
// } from '../hsm/playerHSM';
//
// import {
//   ZoneHSM
// } from '../hsm/zoneHSM';

// import PlatformService from '../platform';

// import { setActiveMediaState } from './activeMediaStates';

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
// export function restartPresentation(rootPath : string, pathToPool : string) {
//   return (dispatch : Function, getState : Function) => {
//     runBSP(rootPath, pathToPool, dispatch, getState);
//   };
// }

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


