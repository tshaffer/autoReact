/* @flow */

import { HSM, HState, STTopEventHandler } from './HSM';

import {
  dmGetZoneById,
  dmGetZoneSimplePlaylist,
  dmGetMediaStateById,
} from '@brightsign/bsdatamodel';

import ImageState from './imageState';
import VideoState from './videoState';
import RSSDataFeedState from './rssDataFeedState';
import MRSSDataFeedState from './mrssDataFeedState';

export class ZoneHSM extends HSM {

  constructor(bsp : Object, dispatch: Function, bsdm : Object, zoneId : string) {
    super();

    this.type = 'media';

    this.bsp = bsp;
    this.dispatch = dispatch;
    this.bsdm = bsdm;
    this.zoneId = zoneId;

    this.stTop = new HState(this, "Top");
    this.stTop.HStateEventHandler = STTopEventHandler;
    this.topState = this.stTop;

    this.constructorHandler = this.videoOrImagesZoneConstructor;
    this.initialPseudoStateHandler = this.videoOrImagesZoneGetInitialState;

    // build playlist
    this.bsdmZone = dmGetZoneById(bsdm, { id: zoneId });

    this.id = this.bsdmZone.id;
    this.name = this.bsdmZone.name;

    this.x = this.bsdmZone.absolutePosition.x;
    this.y = this.bsdmZone.absolutePosition.y;
    this.width = this.bsdmZone.absolutePosition.width;
    this.height = this.bsdmZone.absolutePosition.height;

    this.initialMediaStateId = this.bsdmZone.initialMediaStateId;
    this.mediaStateIds = dmGetZoneSimplePlaylist(this.bsdm, { id: zoneId });
    this.mediaStates = [];

    let newState = null;

    this.mediaStateIds.forEach( (mediaStateId, index) => {
      const bsdmMediaState = dmGetMediaStateById(bsdm, { id : mediaStateId});
      if (bsdmMediaState.contentItem.type === 'Image') {
        newState = new ImageState(this, bsdmMediaState);
      }
      else if (bsdmMediaState.contentItem.type === 'Video') {
        newState = new VideoState(this, bsdmMediaState);
      }
      else if (bsdmMediaState.contentItem.type === 'DataFeed') {
        newState = new RSSDataFeedState(this, bsdmMediaState);
      }
      else if (bsdmMediaState.contentItem.type === 'MrssFeed') {
        newState = new MRSSDataFeedState(this.bsp, this, bsdmMediaState);
      }
      else {
        debugger;
      }

      this.mediaStates.push(newState);

      if (index > 0) {
        this.mediaStates[index - 1].setNextState(newState);
      }
    });
    this.mediaStates[this.mediaStates.length - 1].setNextState(this.mediaStates[0]);
  }

  videoOrImagesZoneConstructor() {
    console.log("VideoOrImagesZoneConstructor invoked");

    // const mediaStateIds = dmGetZoneSimplePlaylist(this.bsdm, { id: this.zoneId });
    // should really look at initialMediaStateId, but the following should work for non interactive playlists
    this.activeState = this.mediaStates[0];
  }

  videoOrImagesZoneGetInitialState() {
    console.log("videoOrImagesZoneGetInitialState invoked");

    return this.activeState;
  }
}

