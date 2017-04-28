/* @flow */

import { HSM, HState, STTopEventHandler } from './HSM';

import {
  dmGetMediaStateById,
  dmGetZoneSimplePlaylist,
  dmGetZonePropertiesById,
  dmGetZoneById,
} from '@brightsign/bsdatamodel';

export class TickerZoneHSM extends HSM {

  constructor(bsdm: Object, zoneId: string) {
    super();

    this.bsdm = bsdm;
    this.zoneId = zoneId;

    this.stTop = new HState(this, "Top");
    this.stTop.HStateEventHandler = STTopEventHandler;
    this.topState = this.stTop;

    this.constructorHandler = this.tickerZoneConstructor;
    this.initialPseudoStateHandler = this.tickerZoneGetInitialState;

    const zoneProperties = dmGetZonePropertiesById(bsdm, {id: zoneId});

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

    // necessary if code must support old format live data feeds
    // zoneHSM.rssDownloadPeriodicValue% = sign.rssDownloadPeriodicValue%
    // zoneHSM.rssDownloadTimer = CreateObject("roTimer")

    this.backgroundTextColor = zoneProperties.widget.backgroundTextColor;
    this.backgroundBitmapAssetId = zoneProperties.backgroundBitmapAssetId;
    this.font = zoneProperties.widget.font;
    this.fontSize = zoneProperties.widget.fontSize;
    this.foregroundTextColor = zoneProperties.widget.foregroundTextColor;
    this.safeTextRegion = zoneProperties.widget.safeTextRegion;
    this.stretchBitmapFile = zoneProperties.widget.stretchBitmapFile;

    this.stRSSDataFeedInitialLoad = new HState(this, 'RSSDataFeedInitialLoad');
    this.stRSSDataFeedInitialLoad.HStateEventHandler = this.STRSSDataFeedInitialLoadEventHandler;
    this.stRSSDataFeedInitialLoad.superState = this.stTop;

    this.stRSSDataFeedPlaying = new HState(this, "RSSDataFeedPlaying");
    this.stRSSDataFeedPlaying.PopulateRSSDataFeedWidget = this.PopulateRSSDataFeedWidget;
    this.stRSSDataFeedPlaying.HStateEventHandler = this.STRSSDataFeedPlayingEventHandler;
    this.stRSSDataFeedPlaying.superState = this.stTop;

    // in autorun classic, this is done in newPlaylist as called from newZoneHSM
    // this.rssDataFeedItems = [];
    this.mediaStateIds = dmGetZoneSimplePlaylist(this.bsdm, { id: zoneId });
    this.mediaStates = [];

    this.mediaStateIds.forEach( (mediaStateId, index) => {
      const bsdmMediaState = dmGetMediaStateById(bsdm, {id: mediaStateId});
      if (bsdmMediaState.contentItem.type === 'DataFeed') {
        // BACONTODO - I think this is sufficient to set 'includesRSSFeeds'
        this.includesRSSFeeds = true

      }
    });
  }

  tickerZoneConstructor() {

    // where to create the BSTicker??

    // InitializeZoneCommon(m.bsp.msgPort)
    this.bsdmZone = dmGetZoneById(this.bsdm, { id: this.zoneId });

    this.id = this.bsdmZone.id;
    this.name = this.bsdmZone.name;

    // ticker rectangle parameters
    this.x = this.bsdmZone.absolutePosition.x;
    this.y = this.bsdmZone.absolutePosition.y;
    this.width = this.bsdmZone.absolutePosition.width;
    this.height = this.bsdmZone.absolutePosition.height;

// $FlowBrightSignExternalObject
//     const bsTicker = new BSTicker(this.x, this.y, this.width, this.height, this.rotation);
//     bsTicker.SetForegroundColor(this.foregroundTextColor);
//     bsTicker.SetBackroundColor(this.backgroundTextColor);
//     bsTicker.SetPixelsPerSecond(this.scrollSpeed);
//
//     if (this.font != "" && this.font != "System") {
//       const fontPath = GetPoolFilePath(m.bsp.assetPoolFiles, zoneHSM.font$)
//       bsTicker.SetFont(fontPath$)
//     }

    // the following are not on BSTicker - alternate ways of implementing them?
    // scrollingMethod
    // backgroundBitmapAssetId
    // fontSize
    // safeTextRegion
    // stretchBitmapFile

  }

  tickerGetInitialState() {
    if (this.includesRSSFeeds) {
      return this.stRSSDataFeedInitialLoad;
    }
    else {
      return this.stRSSDataFeedPlaying;
    }
  }

  STRSSDataFeedInitialLoadEventHandler(event: Object, stateData: Object): string {

    stateData.nextState = null;

    if (event.EventType && event.EventType === 'ENTRY_SIGNAL') {

      console.log(this.id + ": entry signal");

      // for each rssDataFeedItem in m.stateMachine.rssDataFeedItems
      // rssDataFeedItem.loadAttemptComplete = not rssDataFeedItem.isRSSFeed
      // next

      return "HANDLED";
    }

    stateData.nextState = this.superState;
    return "SUPER";

  }

}