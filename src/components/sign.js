// @flow

import React, { Component } from 'react';

// import MediaZoneHSM from './mediaZone';

import MediaZoneContainer from '../containers/mediaZoneContainer';
// import TickerZone from './tickerZone';

import {
  dmGetZoneById,
  ZoneTypeCompactName,
} from '@brightsign/bsdatamodel';


export default class Sign extends Component {

  //         key={zoneIndex}

  getMediaZoneHSM(zone : Object) {

    return (
      <MediaZoneContainer
        bsdm={this.props.bsdm}
        zoneId={zone.id}
        width={Number(zone.absolutePosition.width)}
        height={Number(zone.absolutePosition.height)}
        playbackState={this.props.playbackState}
        zone={zone}
      />
    );

    // return (
    //   <div
    //     key={zone.id}
    //     style={{
    //       position: 'absolute',
    //       left: zone.absolutePosition.x,
    //       top: zone.absolutePosition.y,
    //       width: zone.absolutePosition.width,
    //       height: zone.absolutePosition.height
    //     }}
    //   >
    //     <MediaZoneContainer
    //       playbackState={this.props.playbackState}
    //       bsdm={this.props.bsdm}
    //       zone={zone}
    //       width={Number(zone.absolutePosition.width)}
    //       height={Number(zone.absolutePosition.height)}
    //       postMessage={this.props.postMessage}
    //     />
    //   </div>
    // );
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

  getZoneHSMJSX(zoneId : string) {

    const zone = dmGetZoneById(this.props.bsdm, { id: zoneId });

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

    const zoneIds = this.props.bsdm.zones.allZones; // zonesById
debugger;

    return (
      <div>
        {
          zoneIds.map( (zoneId) =>
            this.getZoneHSMJSX(zoneId)
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
