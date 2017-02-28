// @flow

import React, { Component } from 'react';

import Zone from './zone';

import {
  dmGetZonesForSign,
  dmGetZoneById,
} from '@brightsign/bsdatamodel';


export default class Sign extends Component {

  getZoneJSX(bsdm: Object, zoneId: string, zoneIndex: number) {

    const zone = dmGetZoneById(bsdm, { id: zoneId });

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
        <Zone
          platform={this.props.platform}
          bsdm={bsdm}
          zone={zone}
          width={Number(zone.absolutePosition.width)}
          height={Number(zone.absolutePosition.height)}
          incrementStateIndex={this.props.incrementStateIndex}
          zoneIndex={zoneIndex}
        />
      </div>
    );
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
  incrementStateIndex: React.PropTypes.func.isRequired,
};
