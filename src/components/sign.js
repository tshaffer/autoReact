// @flow

import React, { Component } from 'react';

import Zone from './zone';

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
  dmGetZonesForSign,
  dmGetZoneById,
  // dmGetMediaStateById,
  // dmGetZoneSimplePlaylist,
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


export default class Sign extends Component {

  render() {

    const bsdm = this.props.bsdm;
    const zoneIds = dmGetZonesForSign(bsdm);

    let zones = zoneIds.map( zoneId => {
      return dmGetZoneById(bsdm, { id: zoneId });
    })

    return (
      <div>
        {
          zones.map( (zone, index) =>
            <div
              key={index}
              style={
              {
                position: 'absolute',
                left: zone.absolutePosition.x,
                top: zone.absolutePosition.y,
                width: zone.absolutePosition.width,
                height: zone.absolutePosition.height
              }
              }
            >
              <Zone
                platform={this.props.platform}
                bsdm={this.props.bsdm}
                zone={zone}
                width={Number(zone.absolutePosition.width)}
                height={Number(zone.absolutePosition.height)}
              />
            </div>
          )
        }
      </div>
    );
  }
}

Sign.propTypes = {
  bsdm: React.PropTypes.object.isRequired,
  platform: React.PropTypes.string.isRequired
};
