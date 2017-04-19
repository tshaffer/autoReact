/* @flow */

import { HSM, HState, STTopEventHandler } from '../hsm/HSM';

import {
  dmGetZoneById,
  dmGetZoneSimplePlaylist,
  dmGetMediaStateById,
  ContentItemTypeName,
  ContentItemType
} from '@brightsign/bsdatamodel';

import ImageHS from './imageHS';
import VideoHS from './videoHS';

import {
  setActiveState
} from '../store/zone';

export class ZoneHSM extends HSM {

  constructor(dispatch : Function, bsdm : Object, zoneId : string) {

    super();

    this.bsdm = bsdm;
    this.zoneId = zoneId;

    this.stTop = new HState(this, "Top");
    this.stTop.HStateEventHandler = STTopEventHandler;
    this.topState = this.stTop;

    this.constructorHandler = this.videoOrImagesZoneConstructor;
    this.initialPseudoStateHandler = this.videoOrImagesZoneGetInitialState;

    this.mediaStateIds = dmGetZoneSimplePlaylist(this.bsdm, { id: zoneId });
    this.mediaHStates = [];

    let newHState = null;

    this.mediaStateIds.forEach( (mediaStateId, index) => {
      const bsdmMediaState = dmGetMediaStateById(bsdm, { id : mediaStateId});
      if (bsdmMediaState.contentItem.type === ContentItemType.Image) {
        newHState = new ImageHS(this, bsdmMediaState.id);
      }
      else if (bsdmMediaState.contentItem.type === ContentItemTypeName.Video) {
        newHState = new VideoHS(this, bsdmMediaState.id);
      }
      this.mediaHStates.push(newHState);

      if (index > 0) {
        this.mediaHStates[index - 1].setNextState(newHState);
      }
    });
    this.mediaHStates[this.mediaHStates.length - 1].setNextState(this.mediaHStates[0]);

    this.constructorFunction();

    this.initialize();

    dispatch(setActiveState(this.activeState));
  }

  videoOrImagesZoneConstructor() {
    console.log("VideoOrImagesZoneConstructor invoked");

    // const mediaStateIds = dmGetZoneSimplePlaylist(this.bsdm, { id: this.zoneId });
    // should really look at initialMediaStateId, but the following should work for non interactive playlists
    this.activeState = this.mediaHStates[0];
  }

  videoOrImagesZoneGetInitialState() {
    console.log("videoOrImagesZoneGetInitialState invoked");

    return this.activeState;
  }

}

