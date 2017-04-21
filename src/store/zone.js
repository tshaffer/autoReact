// @flow

// ------------------------------------
// Constants
// ------------------------------------
export const SET_ZONE_ID = 'SET_ZONE_ID';

// ------------------------------------
// Actions
// ------------------------------------
export function setZoneId(zoneId : string){

  return {
    type: SET_ZONE_ID,
    payload: zoneId
  };
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  zoneId : '',
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
  }

  return state;
}


