// @flow

import React, { Component } from 'react';

import MediaZoneContainer from '../containers/mediaZoneContainer';
// import TickerZone from './tickerZone';

import {
  dmGetZoneById,
  ZoneTypeCompactName,
  dmGetZonesForSign,
} from '@brightsign/bsdatamodel';


export default class Sign extends Component {

  //         key={zoneIndex}

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
          playbackState={this.props.playbackState}
          bsdm={this.props.bsdm}
          zone={zone}
          width={Number(zone.absolutePosition.width)}
          height={Number(zone.absolutePosition.height)}
          postMessage={this.props.postMessage}
        />
      </div>
    );
  }


  // getTickerZone(bsdm: Object, zone : Object, zoneIndex : number) {
  //   return (
  //     <div
  //       key={zoneIndex}
  //       style={{
  //         position: 'absolute',
  //         left: zone.absolutePosition.x,
  //         top: zone.absolutePosition.y,
  //         width: zone.absolutePosition.width,
  //         height: zone.absolutePosition.height
  //       }}
  //     >
  //       <TickerZone
  //         playbackState={this.props.playbackState}
  //         bsdm={bsdm}
  //         zone={zone}
  //         width={Number(zone.absolutePosition.width)}
  //         height={Number(zone.absolutePosition.height)}
  //         zoneIndex={zoneIndex}
  //       />
  //     </div>
  //   );
  // }

  getZoneJSX(zoneId : string) {

    const zone = dmGetZoneById(this.props.bsdm, { id: zoneId });

    switch (ZoneTypeCompactName(zone.type)) {
      case 'VideoOrImages': {
        const mediaZoneJSX = this.getMediaZoneJSX(zone);
        return mediaZoneJSX;
      }
      case 'Ticker': {
        return (
          <div>ticker</div>
        )
        // return this.getTickerZoneJSX(bsdm, zone);
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
  postMessage: React.PropTypes.func.isRequired,
};
