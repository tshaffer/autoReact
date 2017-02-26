// @flow

import React, { Component } from 'react';

import Image from './image';
import Video from './video';
import RSSTicker from './rssTicker';

import {
  // StringParameterType,
  // DataFeedTypeName,
  // dmGetDataFeedById,
  // dmGetMediaStateStateById,
  ContentItemTypeName,
  // dmOpenSign,
  // dmAddHtmlSite,
  // dmCreateMediaContentItem,
  // dmCreateHtmlContentItem,
  // dmPlaylistAppendMediaState,
  // dmGetZoneMediaStateContainer,
  dmGetHtmlSiteById,
  // dmCreateAbsoluteRect,
  // dmNewSign,
  // VideoMode,
  // PlayerModel,
  // dmAddZone,
  ZoneType,
  // dmGetSignMetaData,
  // dmGetZonesForSign,
  // dmGetZoneById,
  dmMediaState,
  dmGetMediaStateById,
  dmGetZoneSimplePlaylist,
  dmGetEventIdsForMediaState,
  // dmGetTransitionIdsForEvent,
  // dmGetTransitionById,
  MediaType,
  // VideoModeName,
  // TransitionTypeName,
  EventTypeName,
  dmGetEventById,
  // GraphicsZOrderTypeName,
  // TouchCursorDisplayModeTypeName,
  // UdpAddressTypeName,
  ZoneTypeCompactName,
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



export default class NewZone extends Component {

  constructor(props: Object) {
    super(props);

    this.state = {
      zoneType: '',
      mediaStateIds: [],
      mediaStates: [],
      autorunStates: [],
      stateIndex: 0,
    };
  }

  componentWillMount() {

    let zoneType = ZoneTypeCompactName(this.props.zone.type);
    this.setState( { zoneType });

    switch (zoneType) {
      case 'Ticker': {
        return;
      }
      case 'VideoOrImages': {
        break;
      }
      default: {
        debugger;
      }
    }
    const mediaStateIds = dmGetZoneSimplePlaylist(this.props.bsdm, { id: this.props.zone.id });
    let mediaStates = mediaStateIds.map( mediaStateId => {
      return dmGetMediaStateById(this.props.bsdm, { id : mediaStateId })
    });

    this.setState( { mediaStateIds });
    this.setState( { mediaStates });

    let autorunStates = [];

    mediaStates.forEach( mediaState => {

      let assetId;
      let mediaType;
      let duration;

      let autorunState = {};

      const mediaStateContainer = mediaState.container;
      const mediaStateContainerType = mediaStateContainer.type;

      const mediaStateContentItem = mediaState.contentItem;
      const mediaStateContentItemType = mediaStateContentItem.type;
      const contentItemType = ContentItemTypeName(mediaStateContentItemType).toLowerCase();
      switch (contentItemType) {
        case 'media': {

          const name = mediaStateContentItem.name;
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
          const site = dmGetHtmlSiteById(this.props.bsdm, { id: htmlSiteId });
          autorunState.url = site.url;
          break;
        }
        case 'mrssfeed': {
          debugger;
          break;
        }
        case 'datafeed': {
          debugger;
          break;
        }
        default: {
          break;
        }
      }

      let eventIds = dmGetEventIdsForMediaState(this.props.bsdm, { id : mediaState.id });
      if (eventIds.length !== 1) {
        debugger;
      }

      let event = dmGetEventById(this.props.bsdm, { id : eventIds[0] });
      if (!event) {
        debugger;
      }

      const eventName = EventTypeName(event.type);
      console.log('eventName: ', eventName, ' assetId: ', assetId);
      switch(eventName) {
        case 'Timer': {
          duration = event.data.interval;
          break;
        }
        case 'MediaEnd': {
          duration = 10 * 1000;
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

          autorunState.assetId = mediaObject.assetId;
          autorunState.mediaType = mediaObject.mediaType;

          switch (mediaType) {
            case MediaType.Image: {

              let resourceIdentifier;
              if (this.props.platform === 'desktop') {
                autorunState.resourceIdentifier = "file://" + assetId;
              }
              else {
                debugger;
                // autorunState.resourceIdentifier = "pool/" + currentState.imageItem.fileName;
              }
              break;
            }
            case MediaType.Video: {

              let resourceIdentifier;
              if (this.props.platform === 'desktop') {
                autorunState.resourceIdentifier = "file://" + assetId;
              }
              else {
                debugger;
                // autorunState.resourceIdentifier = "pool/" + currentState.imageItem.fileName;
              }
              break;
            }
            default: {
              debugger;
            }
          }
        }
      }

      // TODO
      autorunState.duration = duration;

      autorunStates.push(autorunState);
    });

    this.setState( { autorunStates });
  }

  state: Object;


  nextAsset() {

    let nextStateIndex = this.state.stateIndex + 1;
    if (nextStateIndex >= this.state.autorunStates.length) {
      nextStateIndex = 0;
    }
    this.setState( { stateIndex: nextStateIndex });
  }

  setHtmlTimeout() {

    let self = this;

    setTimeout(
      () => {
        self.nextAsset();
      },
      4 * 1000);
  }


  render() {

    let self = this;

    if (!this.state.mediaStateIds && this.state.mediaStateIds.length === 0) {
      return (
        <div>Loading</div>
      );
    }

    if (this.state.zoneType === 'Ticker') {
      return (
        <div>Ticker support pending</div>
      );
    }

    let autorunState = this.state.autorunStates[this.state.stateIndex];

    console.log('newZone.js::render(), zoneId: ', this.props.zone.id, ' autorunState; ', autorunState);

    let { contentItemType } = autorunState;

    switch (contentItemType) {

      case 'media': {

        let { assetId, mediaType, duration } = autorunState;

        switch (mediaType) {
          case MediaType.Image: {

            let resourceIdentifier;
            if (this.props.platform === 'desktop') {
              resourceIdentifier = "file://" + assetId;
            }
            else {
              debugger;
              // resourceIdentifier = "pool/" + currentState.imageItem.fileName;
            }

            return (
              <Image
                resourceIdentifier={resourceIdentifier}
                width={this.props.width}
                height={this.props.height}
                duration={duration * 1000}
                onTimeout={self.nextAsset.bind(this)}
              />
            );
          }
          case MediaType.Video: {

            let resourceIdentifier;
            if (this.props.platform === 'desktop') {
              resourceIdentifier = "file://" + assetId;
            }
            else {
              debugger;
              // resourceIdentifier = "pool/" + currentState.imageItem.fileName;
            }

            return (
              <Video
                resourceIdentifier={resourceIdentifier}
                width={this.props.width}
                height={this.props.height}
                onVideoEnd={self.nextAsset.bind(this)}
              />
            );
          }
          default: {
            debugger;
          }
        }
        break;
      }
      case 'html': {

        this.setHtmlTimeout();

        // let resourceIdentifier;
        // if (this.props.platform === 'desktop') {
        //   resourceIdentifier = currentState.htmlItem.site.url;
        // }
        // else {
        //   resourceIdentifier = 'pool/test.html';
        // }
        //
        return (
          <iframe
            width={this.props.width}
            height={this.props.height}
            src={autorunState.url}
          />
        );
      }

      default: {
        debugger;
      }
    }

    return (
      <div>poo</div>
    );
  }
}

NewZone.propTypes = {
  platform: React.PropTypes.string.isRequired,
  bsdm: React.PropTypes.object.isRequired,
  zone: React.PropTypes.object.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
};
