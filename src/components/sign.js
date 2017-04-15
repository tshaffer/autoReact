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

  //         key={zoneIndex}

  getMediaZoneHSM(zone : Object, activeState : Object) {

    // return (
    //   <div
    //     key={zone.id}
    //   >
    //     poo
    //   </div>
    // );

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
        <MediaZone
          playbackState={this.props.playbackState}
          bsdm={this.props.bsdm}
          zone={zone}
          width={Number(zone.absolutePosition.width)}
          height={Number(zone.absolutePosition.height)}
          activeState={activeState}
          postMessage={this.props.postMessage}
        />
      </div>
    );
  }

  // getMediaZone(bsdm: Object, zone : Object, zoneIndex : number) {
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
  //       <MediaZone
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

  // getZoneJSX(bsdm: Object, zoneId: string, zoneIndex: number) {
  //
  //   const zone = dmGetZoneById(bsdm, { id: zoneId });
  //
  //   switch (ZoneTypeCompactName(zone.type)) {
  //     case 'VideoOrImages': {
  //       return this.getMediaZone(bsdm, zone, zoneIndex);
  //     }
  //     case 'Ticker': {
  //       return this.getTickerZone(bsdm, zone, zoneIndex);
  //     }
  //     default: {
  //       debugger;
  //     }
  //   }
  // }

  getZoneHSMJSX(zoneHSM : Object) {

    const zone = dmGetZoneById(this.props.bsdm, { id: zoneHSM.id });

    const activeState = this.props.activeState;

    switch (ZoneTypeCompactName(zone.type)) {
      case 'VideoOrImages': {
        // return this.getMediaZoneHSM(zone, activeState);
        const mediaZoneJSX = this.getMediaZoneHSM(zone, activeState);
        return mediaZoneJSX;
      }
      // case 'Ticker': {
      //   return this.getTickerZoneHSM(bsdm, zone, activeState);
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

    // const bsdm = this.props.bsdm;
    //
    // const zoneIds = dmGetZonesForSign(bsdm);
    //
    //
    // return (
    //   <div>
    //     {
    //       zoneIds.map((zoneId, index) =>
    //         this.getZoneJSX(bsdm, zoneId, index)
    //       )
    //     }
    //   </div>
    // );
  }
}

Sign.propTypes = {
  bsdm: React.PropTypes.object.isRequired,
  playbackState: React.PropTypes.string.isRequired,
  zoneHSMs : React.PropTypes.object,
  postMessage: React.PropTypes.func.isRequired,
  activeState: React.PropTypes.object,
};
