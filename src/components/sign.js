// @flow

import React, { Component } from 'react';

import MediaZone from './mediaZone';
import TickerZone from './tickerZone';

import {
  dmGetZonesForSign,
  dmGetZoneById,
  ZoneTypeCompactName,
} from '@brightsign/bsdatamodel';


export default class Sign extends Component {

  getMediaZone(bsdm: Object, zone : Object, zoneIndex : number) {
    return (
      <div
        key={zoneIndex}
        style={{
          position: 'absolute',
          left: zone.absolutePosition.x,
          top: zone.absolutePosition.y,
          width: zone.absolutePosition.width,
          height: zone.absolutePosition.height
        }}
      >
        <MediaZone
          platform={this.props.platform}
          bsdm={bsdm}
          zone={zone}
          width={Number(zone.absolutePosition.width)}
          height={Number(zone.absolutePosition.height)}
          zoneIndex={zoneIndex}
        />
      </div>
    );
  }

  getTickerZone(bsdm: Object, zone : Object, zoneIndex : number) {
    return (
      <div
        key={zoneIndex}
        style={{
          position: 'absolute',
          left: zone.absolutePosition.x,
          top: zone.absolutePosition.y,
          width: zone.absolutePosition.width,
          height: zone.absolutePosition.height
        }}
      >
        <TickerZone
          platform={this.props.platform}
          bsdm={bsdm}
          zone={zone}
          width={Number(zone.absolutePosition.width)}
          height={Number(zone.absolutePosition.height)}
          zoneIndex={zoneIndex}
        />
      </div>
    );
  }

  getZoneJSX(bsdm: Object, zoneId: string, zoneIndex: number) {

    const zone = dmGetZoneById(bsdm, { id: zoneId });

    switch (ZoneTypeCompactName(zone.type)) {
      case 'VideoOrImages': {
        return this.getMediaZone(bsdm, zone, zoneIndex);
      }
      case 'Ticker': {
        return this.getTickerZone(bsdm, zone, zoneIndex);
      }
      default: {
        debugger;
      }
    }
  }

  render() {

    const bsdm = this.props.bsdm;

    const zoneIds = dmGetZonesForSign(bsdm);

    return (
      <div>
        {
          zoneIds.map((zoneId, index) =>
            this.getZoneJSX(bsdm, zoneId, index)
          )
        }
      </div>
    );
  }
}

Sign.propTypes = {
  bsdm: React.PropTypes.object.isRequired,
  platform: React.PropTypes.string.isRequired,
};
