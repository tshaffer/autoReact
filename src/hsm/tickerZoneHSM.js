/* @flow */

import { HSM, HState, STTopEventHandler } from './HSM';

import {
  dmGetZonePropertiesById
} from '@brightsign/bsdatamodel';

export class TickerZoneHSM extends HSM {

  constructor(bsdm : Object, zoneId : string) {
    super();

    this.bsdm = bsdm;
    this.zoneId = zoneId;

    this.stTop = new HState(this, "Top");
    this.stTop.HStateEventHandler = STTopEventHandler;
    this.topState = this.stTop;

    this.constructorHandler = this.tickerZoneConstructor;
    this.initialPseudoStateHandler = this.tickerZoneGetInitialState;

    const zoneProperties = dmGetZonePropertiesById(bsdm, { id: zoneId });

    debugger;

    this.numberOfLines = zoneProperties.textWidget.numberOfLines;
    this.delay = zoneProperties.textWidget.delay;

    const rotation = zoneProperties.textWidget.rotation;
    switch (rotation) {
      case"0": {
        this.rotation = 0;
        break;
      }
      case "90": {
        this.rotation = 3;
        break;
      }
      case "180": {
        this.rotation = 2;
        break;
      }
      case "270": {
        this.rotation = 1;
        break;
      }
    }

    const alignment = zoneProperties.textWidget.alignment;
    switch (alignment) {
      case "center": {
        this.alignment = 1;
        break;
      }
      case "right": {
        this.alignment = 2;
        break;
      }
      default: {
        this.alignment = 0;
        break;
      }
    }

    this.scrollingMethod = zoneProperties.textWidget.scrollingMethod;

    this.scrollSpeed = zoneProperties.scrollSpeed;

    // zoneProperties.widget
    //    backgroundBitmapAssetId
    //    backgroundTextColor
    //    font
    //    fontSize
    //    foregroundTextColor
    //    safeTextRegion
    //    stretchBitmapFile

    // necessary if code must support old format live data feeds
    // zoneHSM.rssDownloadPeriodicValue% = sign.rssDownloadPeriodicValue%
    // zoneHSM.rssDownloadTimer = CreateObject("roTimer")

  }

}
