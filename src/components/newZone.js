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
  // dmGetHtmlSiteById,
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
      mediaStateIndex: 0,
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
  }

  state: Object;


  nextAsset() {

    debugger;
    // let { states } = this.props.playlist;
    //
    // let index: number = this.state.assetIndex;
    // index++;
    // if (index >= states.length) {
    //   index = 0;
    // }
    this.setState( { assetIndex: index });
  }


  render() {

    let assetId;
    let duration;
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

    console.log(this.state.mediaStateIds);
    console.log(this.state.mediaStates);

    const currentMediaState = this.state.mediaStates[this.state.mediaStateIndex];

    const mediaStateContainer = currentMediaState.container;
    const mediaStateContainerType = mediaStateContainer.type;

    const mediaStateContentItem = currentMediaState.contentItem;
    const mediaStateContentItemType = mediaStateContentItem.type;
    const contentItemType = ContentItemTypeName(mediaStateContentItemType).toLowerCase();
    switch (contentItemType) {
      case 'media': {

        const name = mediaStateContentItem.name;
        const mediaObject = mediaStateContentItem.media;

        assetId = mediaObject.assetId;
        const mediaType = mediaObject.mediaType;

        // switch (mediaType) {
        //   case MediaType.Image: {
        //     break;
        //   }
        //   case MediaType.Video: {
        //     break;
        //   }
        //   default: {
        //     debugger;
        //   }
        // }
        break;
      }
      case 'html': {
        debugger;
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

    let eventIds = dmGetEventIdsForMediaState(this.props.bsdm, { id : currentMediaState.id });
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
        debugger;
        break;
      }
      default: {
        debugger;
      }
    }

    switch (contentItemType) {
      case 'media': {

        const name = mediaStateContentItem.name;
        const mediaObject = mediaStateContentItem.media;

        assetId = mediaObject.assetId;
        const mediaType = mediaObject.mediaType;

        switch (mediaType) {
          case MediaType.Image: {

            let resourceIdentifier;
            if (this.props.platform === 'desktop') {
              resourceIdentifier = "file://" + assetId;
            }
            else {
              debugger;
              resourceIdentifier = "pool/" + currentState.imageItem.fileName;
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

            break;
          }
          default: {
            debuggger;
          }
        }
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