// @flow

import React, { Component } from 'react';

import MediaZoneContainer from '../containers/mediaZoneContainer';
import TickerZone from './tickerZone';

import {
  dmGetZonesForSign,
  dmGetZoneById,
  ZoneTypeCompactName,
} from '@brightsign/bsdatamodel';


export default class Sign extends Component {

  //         key={zoneIndex}

  getMediaZoneHSM(zone : Object) {

    return (
      <div
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

  getZoneHSMJSX(zoneHSM : Object) {

    const zone = dmGetZoneById(this.props.bsdm, { id: zoneHSM.id });

    switch (ZoneTypeCompactName(zone.type)) {
      case 'VideoOrImages': {
        const mediaZoneJSX = this.getMediaZoneHSM(zone);
        return mediaZoneJSX;
      }
      // case 'Ticker': {
      //   return this.getTickerZoneHSM(bsdm, zone);
      // }
      default: {
        debugger;
      }
    }

  }

  render() {

    const zoneHSMs = this.props.zoneHSMs.zoneHSMs;

    return (
      <div>
        {
          zoneHSMs.map( (zoneHSM, index) =>
            this.getZoneHSMJSX(zoneHSM)
          )
        }
      </div>
    );
  }
}

Sign.propTypes = {
  bsdm: React.PropTypes.object.isRequired,
  playbackState: React.PropTypes.string.isRequired,
  zoneHSMs : React.PropTypes.object,
  postMessage: React.PropTypes.func.isRequired,
};
