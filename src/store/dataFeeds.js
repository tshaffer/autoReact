// @flow

import {
  ARLiveDataFeed
} from '../entities/liveDataFeed';

// ------------------------------------
// Constants
// ------------------------------------
export const ADD_DATA_FEED = 'ADD_DATA_FEED';
export const UPDATE_DATA_FEED = 'UPDATE_DATA_FEED';

// ------------------------------------
// Actions
// ------------------------------------
export function addDataFeed(dataFeed : Object){

  return {
    type: ADD_DATA_FEED,
    payload: {
      dataFeed,
    }
  };
}

export function updateDataFeed(dataFeed : Object){

  return {
    type: UPDATE_DATA_FEED,
    payload: {
      dataFeed,
    }
  };
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  dataFeedsById : {}
};

export default function(state : Object = initialState, action : Object) {

  switch (action.type) {

    case ADD_DATA_FEED: {

      let newState = Object.assign({}, state);

      const dataFeed : ARLiveDataFeed = action.payload.dataFeed;
      newState.dataFeedsById[dataFeed.bsdmDataFeed.id] = dataFeed;

      console.log(newState);

      return newState;
    }

    case UPDATE_DATA_FEED: {

      let newState = Object.assign({}, state);

      const dataFeed : ARLiveDataFeed = action.payload.dataFeed;

      // deepClone required for redux to note that change occurred?
      // or does redux catch it?
      newState.dataFeedsById[dataFeed.bsdmDataFeed.id] = dataFeed;

      console.log(newState);

      return newState;
    }
  }

  return state;
}


