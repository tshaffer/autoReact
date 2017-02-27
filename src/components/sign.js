// @flow

import React, { Component } from 'react';

import Zone from './zone';

import {
  dmGetZonesForSign,
  dmGetZoneById,
} from '@brightsign/bsdatamodel';


export default class Sign extends Component {

  render() {

    const bsdm = this.props.bsdm;
    const zoneIds = dmGetZonesForSign(bsdm);

    let zones = zoneIds.map( zoneId => {
      return dmGetZoneById(bsdm, { id: zoneId });
    });

    return (
      <div>
        {
          zones.map( (zone, index) =>
            <div
              key={index}
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
                bsdm={this.props.bsdm}
                zone={zone}
                width={Number(zone.absolutePosition.width)}
                height={Number(zone.absolutePosition.height)}
                autoplayZone={this.props.autoplay.zones[index]}
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
  platform: React.PropTypes.string.isRequired,
  autoplay: React.PropTypes.object.isRequired,
};
