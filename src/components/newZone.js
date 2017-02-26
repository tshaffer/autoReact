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
  // ContentItemTypeName,
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
  // ZoneType,
  // dmGetSignMetaData,
  // dmGetZonesForSign,
  // dmGetZoneById,
  dmGetMediaStateById,
  dmGetZoneSimplePlaylist,
  // dmGetEventIdsForMediaState,
  // dmGetTransitionIdsForEvent,
  // dmGetTransitionById,
  // MediaType,
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



export default class NewZone extends Component {

  constructor(props: Object) {
    super(props);

    this.state = {
      assetIndex: 0,
      mediaStateIds: [],
      mediaStates: [],
    };
  }

  componentWillMount() {
    const mediaStateIds = dmGetZoneSimplePlaylist(this.props.bsdm, { id: this.props.zone.id });
    let mediaStates = mediaStateIds.map( mediaStateId => {
      return dmGetMediaStateById(this.props.bsdm, { id : mediaStateId })
    });

    this.setState( { mediaStateIds });
    this.setState( { mediaStates });
  }

  state: Object;

  render() {

    if (!this.state.mediaStateIds && this.state.mediaStateIds.length === 0) {
      return (
        <div>Loading</div>
      );
    }

    console.log(this.state.mediaStateIds);
    console.log(this.state.mediaStates);

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
