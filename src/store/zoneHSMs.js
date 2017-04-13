// @flow

// ------------------------------------
// Constants
// ------------------------------------
export const ADD_ZONE_HSM = 'ADD_ZONE_HSM';

// ------------------------------------
// Actions
// ------------------------------------
export function addZoneHSM(zoneHSM : Object, zoneId : string){

  return {
    type: ADD_ZONE_HSM,
    payload: {
      zoneHSM,
      zoneId
    }
  };
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  zoneHSMs : [],
  zoneHSMById : {}
};

export default function(state : Object = initialState, action : Object) {

  switch (action.type) {

    case ADD_ZONE_HSM: {

      let newState = Object.assign({}, state);

      newState.zoneHSMs.push(action.payload.zoneHSM);
      newState.zoneHSMById[action.payload.zoneId] = action.payload.zoneHSM;

      console.log(newState);

      debugger;

      return newState;
    }

  }

  return state;
}


