import fs from 'fs';

import {
  dmGetSignState,
  // StringParameterType,
  // DataFeedTypeName,
  // dmGetDataFeedById,
  // dmGetMediaStateStateById,
  // ContentItemTypeName,
  // dmOpenSign,
  // dmAddHtmlSite,
  dmCreateMediaContentItem,
  // dmCreateHtmlContentItem,
  dmPlaylistAppendMediaState,
  dmGetZoneMediaStateContainer,
  // dmGetHtmlSiteById,
  dmCreateAbsoluteRect,
  dmNewSign,
  VideoMode,
  PlayerModel,
  dmAddZone,
  ZoneType,
  // dmGetSignMetaData,
  // dmGetZonesForSign,
  // dmGetZoneById,
  // dmGetMediaStateById,
  // dmGetZoneSimplePlaylist,
  // dmGetEventIdsForMediaState,
  // dmGetTransitionIdsForEvent,
  // dmGetTransitionById,
  MediaType,
  // VideoModeName,
  // TransitionTypeName,
  // EventTypeName,
  // dmGetEventById,
  // GraphicsZOrderTypeName,
  // TouchCursorDisplayModeTypeName,
  // UdpAddressTypeName,
  // ZoneTypeCompactName,
  // ViewModeTypeName,
  // ImageModeTypeName,
  // AudioOutputSelectionTypeName,
  // AudioOutputSelectionSpecName,
  // AudioModeTypeName,
  // AudioModeSpecName,
  // AudioMappingTypeName,
  // AudioOutputNameString,
  // AudioOutputTypeName,
  // AudioMixModeTypeName,
  // DeviceWebPageDisplayName,
  // PlayerModelName,
  // MonitorOrientationTypeName,
  // VideoConnectorTypeName,
  // LiveVideoInputTypeName,
  // LiveVideoStandardTypeName,
  // ZoneTypeCompactName,
  dmGetParameterizedStringFromString,
  dmAddDataFeed,
  DataFeedUsageType,
  dmCreateDataFeedContentItem,
} from '@brightsign/bsdatamodel';


export function buildPresentationOG(filePath) {

  let zoneRect;
  let action;
  let contentItem;

  return (dispatch, getState) => {

    dispatch(dmNewSign('TestSign', VideoMode.v1920x1080x60p, PlayerModel.XT1143));

    // create first zone
    zoneRect = dmCreateAbsoluteRect(0,0,1920,440);
    action = dispatch(dmAddZone('VideoOrImages1', ZoneType.Video_Or_Images, 'zone1', zoneRect));
    let zone1Container = dmGetZoneMediaStateContainer(action.payload.id);

    // create second zone
    zoneRect = dmCreateAbsoluteRect(0,440,1920,440);
    action = dispatch(dmAddZone('VideoOrImages2', ZoneType.Images, 'zone2', zoneRect));
    let zone2Container = dmGetZoneMediaStateContainer(action.payload.id);

    // create ticker zone
    zoneRect = dmCreateAbsoluteRect(0,880,1920,200);
    action = dispatch(dmAddZone('Ticker', ZoneType.Ticker, 'ticker', zoneRect));
    let tickerZoneContainer = dmGetZoneMediaStateContainer(action.payload.id);

// example code for adding an HTML site
    /*
     let addHtmlSiteAction = dispatch(dmAddHtmlSite('TestSite',
     'file:///Users/tedshaffer/Documents/Projects/autoReact/data/test.html', false));
     let htmlSiteId = addHtmlSiteAction.payload.id;
     let contentItem = dmCreateHtmlContentItem('htmlItem', htmlSiteId);
     dispatch(dmPlaylistAppendMediaState(zone1Container, contentItem));
     */

// Add content
    contentItem = dmCreateMediaContentItem('image7093.jpg',
      '/Users/tedshaffer/Pictures/SanMateoCoast2013/IMG_7093.JPG', MediaType.Image);

    dispatch(dmPlaylistAppendMediaState(zone1Container, contentItem)).then(
      action => {
        contentItem = dmCreateMediaContentItem('BryceCanyonUtah.jpg',
          '/Users/tedshaffer/Pictures/BangPhotos/BryceCanyonUtah.jpg', MediaType.Image);
        return dispatch(dmPlaylistAppendMediaState(zone1Container, contentItem));
      }
    ).then(
      action => {
        contentItem = dmCreateMediaContentItem('GrandTetonWyoming.jpg',
          '/Users/tedshaffer/Pictures/BangPhotos/GrandTetonWyoming.jpg', MediaType.Image);
        return dispatch(dmPlaylistAppendMediaState(zone2Container, contentItem));
      }
    ).then(
      action => {
        contentItem = dmCreateMediaContentItem('ManWithFeet.jpg',
          '/Users/tedshaffer/Pictures/MixedMedia/ManWithFeet.jpg', MediaType.Image);
        return dispatch(dmPlaylistAppendMediaState(zone2Container, contentItem));
      }
    ).then(
      action => {
        let psFeedUrl = dmGetParameterizedStringFromString('http://feeds.reuters.com/Reuters/domesticNews');
        let innerAction = dispatch(dmAddDataFeed('UsNewsFeed', psFeedUrl, DataFeedUsageType.Text));
        let dataFeedId = innerAction.payload.id;
        contentItem = dmCreateDataFeedContentItem('NewsFeed', dataFeedId);
        return dispatch(dmPlaylistAppendMediaState(tickerZoneContainer, contentItem));
      }
    ).then(
      action => {
        let state = getState();
        savePresentationAs(dmGetSignState(state.bsdm), filePath);
        debugger;
      }
    ).catch( (err) => {
      console.log(err);
      debugger;
    });


  };

  function savePresentationAs(presentation, path) {

    const bpfStr = JSON.stringify(presentation, null, '\t');
    fs.writeFileSync(path, bpfStr);
  }
}

export function buildPresentation(filePath) {

  let zoneRect;
  let action;
  let contentItem;

  return (dispatch, getState) => {

    // create ticker zone
    zoneRect = dmCreateAbsoluteRect(0,880,1920,200);
    action = dispatch(dmAddZone('Ticker', ZoneType.Ticker, 'ticker', zoneRect));
    let tickerZoneContainer = dmGetZoneMediaStateContainer(action.payload.id);

    let psFeedUrl = dmGetParameterizedStringFromString('http://feeds.reuters.com/Reuters/domesticNews');
    let innerAction = dispatch(dmAddDataFeed('UsNewsFeed', psFeedUrl, DataFeedUsageType.Text));
    let dataFeedId = innerAction.payload.id;
    contentItem = dmCreateDataFeedContentItem('NewsFeed', dataFeedId);
    dispatch(dmPlaylistAppendMediaState(tickerZoneContainer, contentItem)).then(
      action => {
        let state = getState();
        savePresentationAs(dmGetSignState(state.bsdm), filePath);
        debugger;
      }
    ).catch( (err) => {
      console.log(err);
      debugger;
    });
  };

  function savePresentationAs(presentation, path) {

    const bpfStr = JSON.stringify(presentation, null, '\t');
    fs.writeFileSync(path, bpfStr);
  }
}
