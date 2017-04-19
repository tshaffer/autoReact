// @flow

// ------------------------------------
// Constants
// ------------------------------------
export const SET_ZONE_ID = 'SET_ZONE_ID';
export const SET_STATE_INDEX = 'SET_STATE_INDEX';
export const SET_ACTIVE_STATE = 'SET_ACTIVE_STATE';

// ------------------------------------
// Actions
// ------------------------------------
export function setZoneId(zoneId : string){

  return {
    type: SET_ZONE_ID,
    payload: zoneId
  };
}

export function setActiveState(activeState : Object) {

  return {
    type: SET_ACTIVE_STATE,
    payload: activeState
  };
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  zoneId : '',
  activeState: null
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

    case SET_ACTIVE_STATE: {

      let newState = {
        ...state,
        activeState: action.payload
      };

      console.log(newState);
      return newState;
    }
  }

  return state;
}


