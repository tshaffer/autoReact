// @flow

import path from 'path';

import {
  dmGetZonesForSign,
  dmGetZoneById,
  StringParameterType,
  dmGetDataFeedById,
  ContentItemTypeName,
  dmGetHtmlSiteById,
  dmGetMediaStateById,
  dmGetZoneSimplePlaylist,
  dmGetEventIdsForMediaState,
  MediaType,
  EventTypeName,
  dmGetEventById,
  ZoneTypeCompactName,
} from '@brightsign/bsdatamodel';


// ------------------------------------
// Constants
// ------------------------------------
export const SET_AUTOPLAY_ZONES = 'SET_AUTOPLAY_ZONES';

// ------------------------------------
// Action Creators
// ------------------------------------
export function parseAutoplay() {

  return (dispatch: Function, getState: Function) => {

    let state = getState();
    const bsdm = state.bsdm;
    // const sign = bsdm.sign;

    const zoneIds = dmGetZonesForSign(bsdm);
    let zones = zoneIds.map( zoneId => {
      return dmGetZoneById(bsdm, { id: zoneId });
    });

    zones.forEach( zone => {
      parseZone(bsdm, zone);
    });
    dispatch(setAutoplayZones(zones));
    state = getState();
  };
}

function parseZone(bsdm : Object, zone : Object) {

  // TODO
  const platform = 'desktop';

  let mediaStateIds = [];
  let mediaStates = [];

  let zoneType = ZoneTypeCompactName(zone.type);

  switch (zoneType) {
    case 'VideoOrImages': {
      mediaStateIds = dmGetZoneSimplePlaylist(bsdm, { id: zone.id });
      mediaStates = mediaStateIds.map( mediaStateId => {
        return dmGetMediaStateById(bsdm, { id : mediaStateId });
      });
      break;
    }
    case 'Ticker': {
      const mediaStateId = zone.initialMediaStateId;
      mediaStateIds.push(mediaStateId);
      const mediaState = dmGetMediaStateById(bsdm, { id : mediaStateId });
      mediaStates.push(mediaState);
      break;
    }
    default: {
      debugger;
    }
  }

  zone.mediaStateIds = mediaStateIds;
  zone.mediaStates = mediaStates;

  let autorunStates = [];

  mediaStates.forEach( mediaState => {

    let assetId = '';
    let mediaType;

    let autorunState = {};

    const mediaStateContentItem = mediaState.contentItem;
    const mediaStateContentItemType = mediaStateContentItem.type;
    const contentItemType = ContentItemTypeName(mediaStateContentItemType).toLowerCase();
    switch (contentItemType) {
      case 'media': {

        const mediaObject = mediaStateContentItem.media;

        assetId = mediaObject.assetId;
        mediaType = mediaObject.mediaType;
        break;
      }
      case 'html': {
        autorunState.displayCursor = mediaStateContentItem.displayCursor;
        autorunState.enableExternalData = mediaStateContentItem.enableExternalData;
        autorunState.enableMouseEvents = mediaStateContentItem.enableMouseEvents;
        autorunState.hwzOn = mediaStateContentItem.hwzOn;
        const htmlSiteId = mediaStateContentItem.siteId;
        const site = dmGetHtmlSiteById(bsdm, { id: htmlSiteId });

        // HACK
        if (platform === 'brightsign') {
          autorunState.url = 'pool/test.html';
        }
        else {
          autorunState.url = site.url;
        }
        break;
      }
      case 'mrssfeed': {
        debugger;
        break;
      }
      case 'datafeed': {

        let rssItem = {};

        let dataFeedId = mediaStateContentItem.dataFeedId;
        let dataFeed = dmGetDataFeedById(bsdm, { id: dataFeedId });
        const feedUrl = dmGetSimpleStringFromParameterizedString(dataFeed.url);
        rssItem.feedUrl = feedUrl;

        autorunState.rssItem = rssItem;

        break;
      }
      default: {
        break;
      }
    }

    let eventIds = dmGetEventIdsForMediaState(bsdm, { id : mediaState.id });
    if (eventIds.length !== 1) {
      debugger;
    }

    let event = dmGetEventById(bsdm, { id : eventIds[0] });
    if (!event) {
      debugger;
    }

    const eventName = EventTypeName(event.type);
    switch(eventName) {
      case 'Timer': {
        autorunState.duration = event.data.interval;
        break;
      }
      case 'MediaEnd': {
        break;
      }
      default: {
        debugger;
      }
    }

    autorunState.contentItemType = contentItemType;
    switch (contentItemType) {
      case 'media': {

        const mediaObject = mediaStateContentItem.media;

        autorunState.mediaType = mediaObject.mediaType;

        switch (mediaType) {
          case MediaType.Image: {

            if (platform === 'desktop') {
              autorunState.resourceIdentifier = "file://" + assetId;
            }
            else {
              autorunState.resourceIdentifier = "pool/" + path.basename(assetId);
            }
            break;
          }
          case MediaType.Video: {

            if (platform === 'desktop') {
              autorunState.resourceIdentifier = "file://" + assetId;
            }
            else {
              autorunState.resourceIdentifier = "pool/" + path.basename(assetId);
            }
            break;
          }
          default: {
            debugger;
          }
        }
        break;
      }
      case 'datafeed': {
        console.log('datafeed in rss, anything to do here?');
        break;
      }
    }

    autorunStates.push(autorunState);
  });

  zone.autorunStates = autorunStates;
  zone.stateIndex = 0;
}

const dmGetSimpleStringFromParameterizedString = (ps) => {
  let returnString = undefined;
  if (typeof ps === "object" && ps.params && ps.params.length) {
    ps.params.every(param => {
      if (param.type === StringParameterType.UserVariable) {
        returnString = undefined;
        return false;
      }
      if (returnString) {
        returnString = returnString + param.value;
      } else {
        returnString = param.value;
      }
      return true;
    });
  }
  return returnString;
};


// ------------------------------------
// Actions
// ------------------------------------
export function setAutoplayZones(autoplayZones: Array<Object>) {

  return {
    type: SET_AUTOPLAY_ZONES,
    payload: autoplayZones
  };
}


// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  zones: [],
};

export default function(state : Object = initialState, action: Object) {

  switch (action.type) {

    case SET_AUTOPLAY_ZONES: {
      let newState = Object.assign({}, state);
      newState.zones = action.payload;

      return newState;
    }
  }

  return state;
}

// ------------------------------------
// Utilities
// ------------------------------------

// ------------------------------------
// Selectors
// ------------------------------------
