// @flow

// ------------------------------------
// Constants
// ------------------------------------
export const SET_FEED_DISPLAY_ITEM = 'SET_FEED_DISPLAY_ITEM';

// ------------------------------------
// Actions
// ------------------------------------
export function setFeedDisplayItem(dataFeedId : string, displayItem : Object){

  return {
    type: SET_FEED_DISPLAY_ITEM,
    payload: {
      dataFeedId,
      displayItem
    }
  };
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  displayItemsByFeedId : {}
};

export default function(state : Object = initialState, action : Object) {

  switch (action.type) {

    case SET_FEED_DISPLAY_ITEM: {

      let newState = Object.assign({}, state);

      let { dataFeedId, displayItem } = action.payload;
      newState.displayItemsByFeedId[dataFeedId] = displayItem;

      console.log(newState);

      return newState;
    }
  }

  return state;
}

// ------------------------------------
// Selectors
// ------------------------------------
export function getFeedDisplayItem(state : Object, dataFeedId : string) {

  const displayItemsByFeed = state.feedDisplayItems.displayItemsByFeedId;
  const displayFeedItem = displayItemsByFeed[dataFeedId];
  return displayFeedItem;
}


