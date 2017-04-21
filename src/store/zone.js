// @flow

// ------------------------------------
// Constants
// ------------------------------------
export const SET_ZONE_ID = 'SET_ZONE_ID';
export const SET_STATE_INDEX = 'SET_STATE_INDEX';

// ------------------------------------
// Actions
// ------------------------------------
export function setZoneId(zoneId : string){

  return {
    type: SET_ZONE_ID,
    payload: zoneId
  };
}

export function setStateIndex(stateIndex : number){

  return {
    type: SET_STATE_INDEX,
    payload: stateIndex
  };
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  zoneId : '',
  stateIndex : 0,
};

export default function(state : Object = initialState, action : Object) {

  switch (action.type) {

    case SET_ZONE_ID: {

      let newState = {
        ...state,
        zoneId: action.payload
      };

      console.log(newState);
      return newState;
    }

    case SET_STATE_INDEX: {

      let newState = {
        ...state,
        stateIndex: action.payload
      };

      console.log(newState);
      return newState;
    }
  }

  return state;
}


