import fs from 'fs';

import {
  dmOpenSign,
  dmAddHtmlSite,
  dmCreateHtmlContentItem,
  dmPlaylistAppendMediaState,
  dmGetZoneMediaStateContainer,
  dmGetHtmlSiteById,
  dmCreateAbsoluteRect,
  dmNewSign,
  VideoMode,
  PlayerModel,
  dmAddZone,
  ZoneType,
  dmGetSignMetaData,
  dmGetZonesForSign,
  dmGetZoneById,
  dmGetMediaStateById,
  dmGetZoneSimplePlaylist,
  dmGetEventIdsForMediaState,
  dmGetTransitionIdsForEvent,
  dmGetTransitionById,
  MediaType,
  VideoModeName,
  TransitionTypeName,
  EventTypeName,
  dmGetEventById,
  GraphicsZOrderTypeName,
  TouchCursorDisplayModeTypeName,
  UdpAddressTypeName,
  ZoneTypeCompactName,
  ViewModeTypeName,
  ImageModeTypeName,
  AudioOutputSelectionTypeName,
  AudioOutputSelectionSpecName,
  AudioModeTypeName,
  AudioModeSpecName,
  AudioMappingTypeName,
  AudioOutputNameString,
  AudioOutputTypeName,
  AudioMixModeTypeName,
  DeviceWebPageDisplayName,
  PlayerModelName,
  MonitorOrientationTypeName,
  VideoConnectorTypeName,
  LiveVideoInputTypeName,
  LiveVideoStandardTypeName
} from '@brightsign/bsdatamodel';

const deepcopy = require("deepcopy");

// ------------------------------------
// Constants
// ------------------------------------
export const SET_AUTOPLAY = 'SET_AUTOPLAY';
export const ADD_PRESENTATION = 'ADD_PRESENTATION';
export const ADD_PRESENTATIONS = 'ADD_PRESENTATIONS';
const UPDATE_PRESENTATION = 'ADD_PRESENTATION';
export const SET_CURRENT_PRESENTATION = 'SET_CURRENT_PRESENTATION';

// ------------------------------------
// Action Creators
// ------------------------------------
function getPresentationFile(resourceIdentifier = '') {
  return new Promise( (resolve, reject) => {
    fs.readFile(resourceIdentifier, (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch(parseErr) {
          reject(parseErr);
        }
      }
    });
  });
}

// export function writePresentationFile(data, path) {
//
//   const bpfStr = JSON.stringify(data, null, '\t');
//   fs.writeFileSync(path, bpfStr);
//
//   // return getFileName(path, '.bpf');
// }

// function writeBPF(getState, path) {
//
//   let {badm} = getState();
//
//   let bpf = badm;
//   const bpfStr = JSON.stringify(bpf, null, '\t');
//
//   fs.writeFileSync(path, bpfStr);
// }
//
// export function savePresentationAs(filePath) {
//
//   return function(dispatch, getState) {
//
//     writeBPF(getState, filePath);
//
//     const now = new Date().getTime();
//
//     // TODO - get actual name instead of deriving from path?
//     const presentationName = getFileName(filePath, '.bpf');
//     const presentation = new Presentation(
//       filePath,
//       presentationName,
//       'presentation',
//       '',
//       now,
//       now,
//       now);
//     dispatch(updatePresentationPersistToDB(presentation));
//     dispatch(setRecentFilePersistToDB(presentation));
//     dispatch(updateFileMenuItems());
//     dispatch(setCurrentPresentation(presentation));
//   };
// }


// export function savePresentation() {
//
//   return function(dispatch, getState) {
//
//     // get current presentation from the store
//     let {app} = getState();
//     let presentation = app.presentations.currentPresentation;
//     // let path = presentation.path;
//     // writeBPF(getState, path);
//     writePresentationFile(getState().bsdm, presentation.path);
//
//     // update last modified in redux state, db
//     const now = new Date().getTime();
//     presentation.lastModified = now;
//     presentation.lastAccessed = now;
//     dispatch(updatePresentationPersistToDB(presentation));
//     dispatch(setRecentFilePersistToDB(presentation));
//     dispatch(updateFileMenuItems());
//   };
// }
//
export function savePresentationAs(bsdm, path) {

  const bpfStr = JSON.stringify(bsdm, null, '\t');
  fs.writeFileSync(path, bpfStr);

  // return function(_, getState) {
  //   const bpfStr = JSON.stringify(getState().bsdm, null, '\t');
  //   fs.writeFileSync(path, bpfStr);
  // };

  // return function(dispatch, getState) {
  //
  //   writePresentationFile(getState().bsdm, filePath);

    // TODO - any better way to get presentation name?
    // const presentationName = writePresentationFile(getState().bsdm, filePath);

    // const now = new Date().getTime();
    // const presentation = new Presentation(
    //   filePath,
    //   presentationName,
    //   'presentation',
    //   '',
    //   now,
    //   now,
    //   now);
    // dispatch(updatePresentationPersistToDB(presentation));
    // dispatch(setRecentFilePersistToDB(presentation));
    // dispatch(updateFileMenuItems());
    // dispatch(setCurrentPresentation(presentation));
  // };
}


export function openPresentationFile(filePath) {
  return (dispatch, getState) => {
    getPresentationFile(filePath).then( (presentationData) => {

      console.log('eat poo');
      dispatch(dmOpenSign(presentationData));

      let state = getState();
      let { bsdm } = state;
      let autoplay = getAutorunAutoplay(bsdm);
      console.log(autoplay);

      dispatch(setAutoplay(autoplay));
      state = getState();

    }).catch( (err) => {
      console.log(err);
      debugger;
    });
  };
}

export function openAndUpdatePresentationFile(filePath) {

  return (dispatch, getState) => {

    // getPresentationFile(filePath).then((presentationData) => {
    //
    //   console.log('eat poo');
    //   dispatch(dmOpenSign(presentationData));
    //
    //   let state = getState();
    //   let {bsdm} = state;
    // });


// code to create a new sign
//     dispatch(dmNewSign('TestSign', VideoMode.v1920x1080x60p, PlayerModel.XT1143));
//     let zoneRect = dmCreateAbsoluteRect(0,0,960,540);
//     let action = dispatch(dmAddZone('VideoOrImages1', ZoneType.Video_Or_Images, 'z1', zoneRect));
//
//     debugger;
//     let state = getState();
//
//     savePresentationAs(state.bsdm, filePath);
//     console.log('poo successfully saved');

    getPresentationFile(filePath).then((presentationData) => {

      console.log('eat poo');
      dispatch(dmOpenSign(presentationData));

      let state = getState();
      let {bsdm} = state;

// code to append an html site
//       //   'https://www.hdwallpapers.net/previews/lake-prags-italy-1053.jpg', false));
//       let addHtmlSiteAction = dispatch(dmAddHtmlSite('TestSite',
//         'file:///Users/tedshaffer/Documents/Projects/autoReact/data/test.html', false));
//
//       let htmlSiteId = addHtmlSiteAction.payload.id;
//       let contentItem = dmCreateHtmlContentItem('htmlItem', htmlSiteId);
//
//       const zoneIds = dmGetZonesForSign(bsdm);
//       let zoneContainer = dmGetZoneMediaStateContainer(zoneIds[0]);
//
//       dispatch(dmPlaylistAppendMediaState(zoneContainer, contentItem));

      // let zoneRect = dmCreateAbsoluteRect(0,0,80,80);

      state = getState();
      bsdm = state.bsdm;

      let autoplay = getAutorunAutoplay(bsdm);
      console.log(autoplay);

      dispatch(setAutoplay(autoplay));
      state = getState();

      // savePresentationAs(state.bsdm, filePath);
      // console.log('poo successfully saved');
    });

  };
}
// ------------------------------------
// Actions
// ------------------------------------
export function setAutoplay(autoplay) {

  return {
    type: SET_AUTOPLAY,
    payload: autoplay
  };
}

export function addPresentation(presentation) {

  return {
    type: ADD_PRESENTATION,
    payload: presentation
  };
}

export function addPresentations(presentations) {

  return {
    type: ADD_PRESENTATIONS,
    payload: presentations
  };
}

// function updatePresentation(presentation) {
//
//   return {
//     type: UPDATE_PRESENTATION,
//     payload: presentation
//   };
//
// }

export function setCurrentPresentation(presentation) {

  return {
    type: SET_CURRENT_PRESENTATION,
    payload: presentation
  };
}


// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  presentationsByPath: {},
  currentPresentation: {},
  autoplay: {}
};

export default function(state = initialState, action) {

  switch (action.type) {
    // currently these looks to be the same wrt to redux store
    case ADD_PRESENTATION:
    case UPDATE_PRESENTATION: {
      let newPresentationsByPath = Object.assign({}, state.presentationsByPath);
      newPresentationsByPath[action.payload.path] = action.payload;

      let newState = {
        presentationsByPath: newPresentationsByPath,
        currentPresentation: state.currentPresentation,
        autoplay: state.autoplay
      };

      return newState;
    }

    case ADD_PRESENTATIONS: {
      let newPresentationsByPath = Object.assign({}, state.presentationsByPath);

      action.payload.forEach( (presentation) => {
        newPresentationsByPath[presentation.path] = presentation;
      });

      let newState = {
        presentationsByPath: newPresentationsByPath,
        currentPresentation: state.currentPresentation,
        autoplay: state.autoplay
      };

      return newState;
    }

    case SET_CURRENT_PRESENTATION: {

      let newState = {
        presentationsByPath: state.presentationsByPath,
        currentPresentation: action.payload,
        autoplay: state.autoplay
      };

      return newState;
    }

    case SET_AUTOPLAY: {

      let newState = {
        presentationsByPath: state.presentationsByPath,
        currentPresentation: state.currentPresentation,
        autoplay: action.payload
      };

      return newState;
    }
  }

  return state;
}


// ------------------------------------------------------------------------
// Helper functions for publishing - parking here for now
// ------------------------------------------------------------------------
export function getAutorunAutoplay(bsdm): Object {

  let autorunAutoplay = {};
  autorunAutoplay.BrightAuthor = getBrightAuthorMetadata();

  let autorunSign = autorunAutoplay.BrightAuthor;
  autorunSign.meta = getSignMetadata(bsdm); // autorunSign.meta object is of type 'Sign'
  autorunSign.zones = [];

  const zoneIds = dmGetZonesForSign(bsdm);
  zoneIds.forEach( (zoneId) => {

    let autorunZone = getZoneMetadata(bsdm, zoneId);

    // TODO - do we still need to have the playlist as an object, or should its parameters move to zone?
    let autorunPlaylist = getPlaylistMetadata(bsdm, autorunZone);

    getMediaStates(bsdm, zoneId, autorunPlaylist);

    autorunZone.playlist = autorunPlaylist;

    autorunSign.zones.push(autorunZone);
  });

  return autorunAutoplay;
}

function getBrightAuthorMetadata() {

  let BrightAuthor = {};
  BrightAuthor.version = 6;
  BrightAuthor.BrightAuthorVersion = '5.0.0.0';
  BrightAuthor.type = 'publish';

  return BrightAuthor;
}

function getSignMetadata(bsdm) {

  const bsdmSignMetadata = dmGetSignMetaData(bsdm);

  let appSignMetadata = bsdmSignMetadata;
  appSignMetadata.videoMode = VideoModeName(bsdmSignMetadata.videoMode);

  // TODO - eliminate any of the following that the autorun does not actually use / need

  // TODO - implement the following in one of bsdm or app
  appSignMetadata.model = 'XT1143';
  appSignMetadata.monitorOrientation = 'Landscape';
  appSignMetadata.videoConnector = 'HDMI';
  appSignMetadata.deviceWebPageDisplay = 'Standard';
  appSignMetadata.alphabetizeVariableNames = true;
  appSignMetadata.delayScheduleChangeUntilMediaEndEvent = false;
  appSignMetadata.htmlEnableJavascriptConsole = true;
  appSignMetadata.backgroundScreenColor = {};
  appSignMetadata.backgroundScreenColor.a = 255;
  appSignMetadata.backgroundScreenColor.r = 0;
  appSignMetadata.backgroundScreenColor.g = 0;
  appSignMetadata.backgroundScreenColor.b = 0;
  appSignMetadata.forceResolution = false;
  appSignMetadata.tenBitColorEnabled = false;
  appSignMetadata.monitorOverscan = 'noOverscan';

  appSignMetadata.gpio = [];
  for (let i = 0; i < 8; i++) {
    appSignMetadata.gpio.push('input');
  }

  // TODO - an array of BP900 / BP200?
  appSignMetadata.BP900AConfigureAutomatically = true;
  appSignMetadata.BP900BConfigureAutomatically = true;
  appSignMetadata.BP900CConfigureAutomatically = true;
  appSignMetadata.BP200AConfigureAutomatically = true;
  appSignMetadata.BP200BConfigureAutomatically = true;
  appSignMetadata.BP200CConfigureAutomatically = true;
  appSignMetadata.BP900AConfiguration = 0;
  appSignMetadata.BP900BConfiguration = 0;
  appSignMetadata.BP900CConfiguration = 0;
  appSignMetadata.BP200AConfiguration = 0;
  appSignMetadata.BP200BConfiguration = 0;
  appSignMetadata.BP200CConfiguration = 0;


  appSignMetadata.serialPortConfigurations = [];
  for (let i = 0; i < 8; i++) {
    let serialPortConfiguration = {};
    serialPortConfiguration.port = i;
    serialPortConfiguration.baudRate = 115200;
    serialPortConfiguration.dataBits = '8';
    serialPortConfiguration.parity = 'N';
    serialPortConfiguration.stopBits = '1';
    serialPortConfiguration.protocol = 'ASCII';
    serialPortConfiguration.sendEol = 'CR';
    serialPortConfiguration.receiveEol = 'CR';
    serialPortConfiguration.invertSignals = false;
    serialPortConfiguration.connectedDevice = 'None';

    appSignMetadata.serialPortConfigurations.push(serialPortConfiguration);
  }

  appSignMetadata.udpDestinationAddressType = 'IPAddress';
  appSignMetadata.udpDestinationAddress = '255.255.255.255';
  appSignMetadata.udpDestinationPort = 5000;
  appSignMetadata.udpReceiverPort = 5000;
  appSignMetadata.flipCoordinates = false;
  appSignMetadata.touchCursorDisplayMode = 'auto';
  appSignMetadata.language = 'English';
  appSignMetadata.languageKey = 'eng';
  appSignMetadata.audio1MinVolume = 0;
  appSignMetadata.audio1MaxVolume = 100;
  appSignMetadata.audio2MinVolume = 0;
  appSignMetadata.audio2MaxVolume = 100;
  appSignMetadata.audio3MinVolume = 0;
  appSignMetadata.audio3MaxVolume = 100;
  appSignMetadata.usbAMinVolume = 0;
  appSignMetadata.usbAMaxVolume = 100;
  appSignMetadata.usbBMinVolume = 0;
  appSignMetadata.usbBMaxVolume = 100;
  appSignMetadata.usbCMinVolume = 0;
  appSignMetadata.usbCMaxVolume = 100;
  appSignMetadata.usbDMinVolume = 0;
  appSignMetadata.usbDMaxVolume = 100;
  appSignMetadata.hdmiMinVolume = 0;
  appSignMetadata.hdmiMaxVolume = 100;
  appSignMetadata.spdifMinVolume = 0;
  appSignMetadata.spdifMaxVolume = 100;
  appSignMetadata.inactivityTimeout = false;
  appSignMetadata.inactivityTime = 30;
  appSignMetadata.autoCreateMediaCounterVariables = false;
  appSignMetadata.resetVariablesOnPresentationStart = false;
  appSignMetadata.networkedVariablesUpdateInterval = 300;
  appSignMetadata.graphicsZOrder = 'Back';
  appSignMetadata.isMosaic = false;

  // TODO - correct defaults?
  appSignMetadata.userDefinedEvents = [];
  appSignMetadata.userVariables = [];
  appSignMetadata.liveDataFeeds = [];
  appSignMetadata.scriptPlugins = [];
  appSignMetadata.parserPlugins = [];
  appSignMetadata.htmlSites = [];
  appSignMetadata.presentationIdentifiers = [];
  appSignMetadata.beacons = [];

  return appSignMetadata;
}

function getZoneMetadata(bsdm, zoneId) {

  const zone = dmGetZoneById(bsdm, { id: zoneId });
  const zoneProperties = zone.properties;

  let appZoneMetadata = {};
  appZoneMetadata.properties = deepcopy(zoneProperties);

  appZoneMetadata.type = ZoneTypeCompactName(zone.type);
  appZoneMetadata.position = zone.position;
  appZoneMetadata.id = zone.id;
  appZoneMetadata.initialMediaStateId = zone.initialMediaStateId;
  appZoneMetadata.name = zone.name;
  appZoneMetadata.nonInteractive = zone.nonInteractive;

  appZoneMetadata.properties.viewMode = ViewModeTypeName(zoneProperties.viewMode);
  appZoneMetadata.properties.imageMode = ImageModeTypeName(zoneProperties.imageMode);

  appZoneMetadata.properties.audioOutput = AudioOutputSelectionSpecName(zoneProperties.audioOutput);
  appZoneMetadata.properties.audioMode = AudioModeSpecName(zoneProperties.audioMode);
  appZoneMetadata.properties.audioMapping = AudioMappingTypeName(zoneProperties.audioMapping);
  appZoneMetadata.properties.audioMixMode = AudioMixModeTypeName(zoneProperties.audioMixMode);

  appZoneMetadata.properties.liveVideoInput = LiveVideoInputTypeName(zoneProperties.liveVideoInput);
  appZoneMetadata.properties.liveVideoStandard = LiveVideoStandardTypeName(zoneProperties.liveVideoStandard);

  console.log(AudioOutputTypeName(zoneProperties.audioOutputAssignments.analog1));
  appZoneMetadata.properties.analogOutput = 'Pcm';
  appZoneMetadata.properties.analog2Output = 'None';
  appZoneMetadata.properties.analog3Output = 'None';
  appZoneMetadata.properties.hdmiOutput = 'Pcm';
  appZoneMetadata.properties.spdifOutput = 'None';
  appZoneMetadata.properties.usbOutputA = 'None';
  appZoneMetadata.properties.usbOutputB = 'None';
  appZoneMetadata.properties.usbOutputC = 'None';
  appZoneMetadata.properties.usbOutputD = 'None';

  appZoneMetadata.properties.analogOutput = AudioOutputTypeName(zoneProperties.audioOutputAssignments.analog1);
  appZoneMetadata.properties.analog2Output = AudioOutputTypeName(zoneProperties.audioOutputAssignments.analog2);
  appZoneMetadata.properties.analog3Output = AudioOutputTypeName(zoneProperties.audioOutputAssignments.analog3);
  appZoneMetadata.properties.hdmiOutput = AudioOutputTypeName(zoneProperties.audioOutputAssignments.hdmi);
  appZoneMetadata.properties.spdifOutput = AudioOutputTypeName(zoneProperties.audioOutputAssignments.spdif);
  appZoneMetadata.properties.usbOutputA = AudioOutputTypeName(zoneProperties.audioOutputAssignments.usbA);
  appZoneMetadata.properties.usbOutputB = AudioOutputTypeName(zoneProperties.audioOutputAssignments.usbB);
  appZoneMetadata.properties.usbOutputC = AudioOutputTypeName(zoneProperties.audioOutputAssignments.usbC);
  appZoneMetadata.properties.usbOutputD = AudioOutputTypeName(zoneProperties.audioOutputAssignments.usbD);


  // the following don't exist
  //    mosaicDecoderName
  //    videoVolume

  return appZoneMetadata;
}

function getPlaylistMetadata(bsdm, zone) {

  let playlist = {};

  playlist.name = 'Playlist 0'; // TODO
  // TODO - note the following two parameters are duplicated in autorun due to the fact that bsdm stores them there
  playlist.type = zone.nonInteractive ? 'non-interactive' : 'interactive';
  playlist.initialMediaStateId = zone.initialMediaStateId;
  const mediaState = dmGetMediaStateById(bsdm, { id: zone.initialMediaStateId});
  playlist.initialMediaStateName = mediaState.name;
  return playlist;
}

function getPlaylistStates(bsdm, mediaStates, eventsById) {

  let states = [];

  mediaStates.forEach( (mediaState) => {
    let autorunState = {};
    autorunState.name = mediaState.name;

    const mediaStateEvent = eventsById[mediaState.eventList[0].id];

    const mediaStateType = mediaState.contentItem.type;

    if (mediaStateType === 0) {

      const mediaType = mediaState.contentItem.media.mediaType;

      switch (mediaType) {
        case MediaType.Image: {
          autorunState.imageItem = {};
          autorunState.imageItem.fileName = mediaState.name;
          autorunState.imageItem.filePath = mediaState.contentItem.media.assetId;

          // TODO - fileIsLocal unused in current autorun - conceivable that it would be used?
          // autorunState.imageItem.fileIsLocal = true;

          autorunState.imageItem.slideDelayInterval = mediaStateEvent.data.interval;
          autorunState.imageItem.slideTransition = TransitionTypeName(mediaStateEvent.transitionList[0].type);
          autorunState.imageItem.transitionDuration = 1000;   // TODO - bsdm
          autorunState.imageItem.videoPlayerRequired = false; // TODO - bsdm
          autorunState.imageItem.useImageBuffer = false; // TODO - bsdm
          break;
        }
        case MediaType.Video: {
          autorunState.videoItem = {};
          autorunState.videoItem.fileName = mediaState.name;
          autorunState.videoItem.filePath = mediaState.contentItem.media.assetId;
          autorunState.videoItem.videoDisplayMode = '2D';
          autorunState.videoItem.automaticallyLoop = true;
          break;
        }
        default:
          break;
      }
    }

    else if (mediaStateType === 1) {

      let htmlItem = {};
      htmlItem.displayCursor = mediaState.contentItem.displayCursor;
      htmlItem.enableExternalData = mediaState.contentItem.enableExternalData;
      htmlItem.enableMouseEvents = mediaState.contentItem.enableMouseEvents;
      htmlItem.hwzOn = mediaState.contentItem.hwzOn;
      htmlItem.siteId = mediaState.contentItem.siteId;
      htmlItem.slideDelayInterval = mediaStateEvent.data.interval;

      htmlItem.site = dmGetHtmlSiteById(bsdm, { id: htmlItem.siteId });

      autorunState.htmlItem = htmlItem;
    }
    states.push(autorunState);
  });

  return states;
}

function getPlaylistTransitions(transitions, mediaStatesById, eventsById) {

  let autorunTransitions = [];

  transitions.forEach( (transition) => {
    let autorunTransition = {};

    const event = eventsById[transition.eventId];
    const sourceMediaStateId = event.mediaStateId;
    const sourceMediaState = mediaStatesById[sourceMediaStateId];

    const targetMediaStateId = event.transitionList[0].targetMediaStateId;
    const targetMediaState = mediaStatesById[targetMediaStateId].name;

    autorunTransition.sourceMediaState = sourceMediaState.name;
    autorunTransition.userEvent = {};

    const bsdmEventName = EventTypeName(event.type);
    autorunTransition.userEvent.parameters = [];
    if (bsdmEventName === 'Timer') {
      autorunTransition.userEvent.name = 'timeout';
      autorunTransition.userEvent.parameters.push(event.data.interval);
    }
    else {
      autorunTransition.userEvent.name = 'mediaEnd';
      autorunTransition.userEvent.parameters.push(null);
    }

    autorunTransition.targetMediaState = targetMediaState;
    autorunTransition.targetMediaStateIsPreviousState = false;
    autorunTransition.assignInputToUserVariable = false;
    autorunTransition.assignWildcardToUserVariable = false;
    autorunTransitions.push(autorunTransition);
  });

  return autorunTransitions;
}

function getMediaStates(bsdm, zoneId, autorunPlaylist) {

  let mediaStates = [];
  let mediaStatesById = {};

  let events = [];
  let eventsById = {};
  let transitions = [];

  const mediaStateIds = dmGetZoneSimplePlaylist(bsdm, { id: zoneId});
  mediaStateIds.forEach( (mediaStateId) => {
    const mediaState = dmGetMediaStateById(bsdm, { id: mediaStateId});
    mediaStates.push(mediaState);
    mediaStatesById[mediaStateId] = mediaState;

    const eventIdsForMediaState = dmGetEventIdsForMediaState(bsdm, { id: mediaStateId});
    const eventId = eventIdsForMediaState[0];
    const event = dmGetEventById(bsdm, { id: eventId});
    events.push(event);
    eventsById[eventId] = event;

    const transitionIdsForEvent = dmGetTransitionIdsForEvent(bsdm, { id: eventIdsForMediaState[0]});
    const transition = dmGetTransitionById(bsdm, { id: transitionIdsForEvent[0]});
    transitions.push(transition);
  });


  autorunPlaylist.states = getPlaylistStates(bsdm, mediaStates, eventsById);
  autorunPlaylist.transitions = getPlaylistTransitions(transitions, mediaStatesById, eventsById);
}
