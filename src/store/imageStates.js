// @flow

import { HState } from '../hsm/HState';

// ------------------------------------
// Constants
// ------------------------------------
export const ADD_IMAGE_HSTATE = 'ADD_IMAGE_HSTATE';


// ------------------------------------
// Actions
// ------------------------------------
export function addImageHState(imageHState : Object){

  return {
    type: ADD_IMAGE_HSTATE,
    payload: imageHState
  };
}


// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  imageHStates : [],
  imageHStatesById : {}
};

