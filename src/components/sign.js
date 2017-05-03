// @flow

import React, { Component } from 'react';

import MediaZoneContainer from '../containers/mediaZoneContainer';
import TickerZoneContainer from '../containers/tickerZoneContainer';

import {
  dmGetZoneById,
  dmGetZonesForSign,
} from '@brightsign/bsdatamodel';


export default class Sign extends Component {

  getMediaZoneJSX(zone : Object) {

    return (
      <div
        key={zone.id}
        style={{
          position: 'absolute',
          left: zone.absolutePosition.x,
          top: zone.absolutePosition.y,
          width: zone.absolutePosition.width,
          height: zone.absolutePosition.height
        }}
      >
        <MediaZoneContainer
          key={zone.id}
          playbackState={this.props.playbackState}
          bsdm={this.props.bsdm}
          zone={zone}
          width={Number(zone.absolutePosition.width)}
          height={Number(zone.absolutePosition.height)}
        />
      </div>
    );
  }


  getTickerZoneJSX(zone : Object) {

    return (
      <div
        key={zone.id}
        style={{
          position: 'absolute',
          left: zone.absolutePosition.x,
          top: zone.absolutePosition.y,
          width: zone.absolutePosition.width,
          height: zone.absolutePosition.height
        }}
      >
        <TickerZoneContainer
          key={zone.id}
          playbackState={this.props.playbackState}
          bsdm={this.props.bsdm}
          zone={zone}
          left={Number(zone.absolutePosition.x)}
          top={Number(zone.absolutePosition.y)}
          width={Number(zone.absolutePosition.width)}
          height={Number(zone.absolutePosition.height)}
        />
      </div>
    );
  }

  getZoneJSX(zoneId : string) {

    const zone = dmGetZoneById(this.props.bsdm, { id: zoneId });

    switch (zone.type) {
      case 'VideoOrImages': {
        const mediaZoneJSX = this.getMediaZoneJSX(zone);
        return mediaZoneJSX;
      }
      case 'Ticker': {
        const tickerZoneJSX = this.getTickerZoneJSX(zone);
        return tickerZoneJSX;
      }
      default: {
        debugger;
      }
    }
  }

  render() {

    const zoneIds = dmGetZonesForSign(this.props.bsdm);

    return (
      <div>
        {
          zoneIds.map( (zoneId) =>
            this.getZoneJSX(zoneId)
          )
        }
      </div>
    );
  }
}

Sign.propTypes = {
  bsdm: React.PropTypes.object.isRequired,
  playbackState: React.PropTypes.string.isRequired,
  // postMessage: React.PropTypes.func.isRequired,
};
