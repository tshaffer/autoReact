/* @flow */

import { HSM, HState, STTopEventHandler } from './HSM';

import {
  dmGetZoneById,
  dmGetZoneSimplePlaylist,
  dmGetMediaStateById,
  ContentItemTypeName,
  ContentItemType
} from '@brightsign/bsdatamodel';

import ImageState from './imageState';
import VideoState from './videoState';

export class ZoneStateMachine extends HSM {

  constructor(bsdm : Object, zoneId : string) {
    super();

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
    this.mediaStateIndex = 0;

    let newState = null;

    this.mediaStateIds.forEach( (mediaStateId) => {
      const bsdmMediaState = dmGetMediaStateById(bsdm, { id : mediaStateId});
      if (bsdmMediaState.contentItem.type === ContentItemType.Image) {
        newState = new ImageState(bsdmMediaState);
      }
      else if (bsdmMediaState.contentItem.type === ContentItemTypeName.Video) {
        newState = new VideoState(bsdmMediaState);
      }
      this.mediaStates.push(newState);
    });

    debugger;

    this.constructorFunction();

    this.initialize();
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

