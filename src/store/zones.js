// @flow

// ------------------------------------
// Constants
// ------------------------------------
export const ADD_ZONE = 'ADD_ZONE';
export const SET_ACTIVE_STATE = 'SET_ACTIVE_STATE';

// ------------------------------------
// Actions
// ------------------------------------
export function addZone(zone : Object) {

  return {
    type: ADD_ZONE,
    payload: zone
  };
}

export function setActiveState(zoneId : string, activeState : Object) {

  return {
    type: SET_ACTIVE_STATE,
    payload: {
      zoneId,
      activeState,
    }
  };
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  zones : [],
  zonesById: {}
};

export default function(state : Object = initialState, action : Object) {

  switch (action.type) {

    case ADD_ZONE: {

      const zone = action.payload;

      let newState = Object.assign({}, state);
      newState.zones.push(zone);
      newState.zonesById[zone.id] = zone;

      console.log(newState);
      return newState;
    }

    case SET_ACTIVE_STATE: {

      let newState = Object.assign({}, state);

      // let newState = {
      //   ...state,
      //   activeState: action.payload
      // };

      console.log(newState);
      return newState;
    }
  }

  return state;
}


