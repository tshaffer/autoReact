// @flow

// ------------------------------------
// Constants
// ------------------------------------
export const SET_MRSS_DATA_FEED_ITEM = 'SET_FEED_DISPLAY_ITEM';

// ------------------------------------
// Actions
// ------------------------------------
export function setMrssDataFeedItem(mrssDataFeedItemId : string, mrssDataFeedItem : Object){

  return {
    type: SET_MRSS_DATA_FEED_ITEM,
    payload: {
      mrssDataFeedItemId,
      mrssDataFeedItem
    }
  };
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  mrssDataFeedItemsByFeedId : {}
};

export default function(state : Object = initialState, action : Object) {

  switch (action.type) {

    case SET_MRSS_DATA_FEED_ITEM: {

      let newState = Object.assign({}, state);

      let { mrssDataFeedItemId, mrssDataFeedItem } = action.payload;
      newState.mrssDataFeedItemsByFeedId[mrssDataFeedItemId] = mrssDataFeedItem;

      console.log(newState);

      return newState;
    }
  }

  return state;
}

// ------------------------------------
// Selectors
// ------------------------------------
export function getMrssDataFeedItem(state : Object, mrssDataFeedItemId : string) {

  const mrssDataFeedItemsByFeedId = state.mrssDataFeedItems.mrssDataFeedItemsByFeedId;
  const mrssDataFeedItem = mrssDataFeedItemsByFeedId[mrssDataFeedItemId];
  return mrssDataFeedItem;
}

export function getMrssDataFeedItemPath(state : Object, mrssDataFeedItemId : string) {

  debugger;

  const mrssDataFeedItemsByFeedId = state.mrssDataFeedItems.mrssDataFeedItemsByFeedId;
  const mrssDataFeedItem = mrssDataFeedItemsByFeedId[mrssDataFeedItemId];

  console.log(mrssDataFeedItem);
  const url = mrssDataFeedItem.url;
  const dataFeedId = mrssDataFeedItemId;
  const dataFeed = state.dataFeeds.dataFeedsById[dataFeedId];
  const feedPoolAssetFiles = dataFeed.feedPoolAssetFiles;
  const filePath = feedPoolAssetFiles[url];
  return filePath;
}


