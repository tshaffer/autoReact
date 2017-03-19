// import fs from 'fs';

import {
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
  // dmGetParameterizedStringFromString,
  // dmAddDataFeed,
  // DataFeedUsageType,
  // dmCreateDataFeedContentItem,
} from '@brightsign/bsdatamodel';

export function buildPresentation(filePath) {

  let zoneRect;
  let action;
  let contentItem;

  return (dispatch, getState) => {

    dispatch(dmNewSign('TestSign', VideoMode.v1920x1080x60p, PlayerModel.XT1143));
    
    // create first zone
    zoneRect = dmCreateAbsoluteRect(0,0,960,440);
    action = dispatch(dmAddZone('VideoOrImages1', ZoneType.Video_Or_Images, 'zone1', zoneRect));
    let zone1Container = dmGetZoneMediaStateContainer(action.payload.id);

    // create second zone
    zoneRect = dmCreateAbsoluteRect(0,440,960,440);
    action = dispatch(dmAddZone('VideoOrImages2', ZoneType.Images, 'zone2', zoneRect));
    let zone2Container = dmGetZoneMediaStateContainer(action.payload.id);

    // add content to first zone
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
        let state = getState();
        debugger;
      }
    ).catch( (err) => {
      console.log(err);
      debugger;
    });


  };
}
