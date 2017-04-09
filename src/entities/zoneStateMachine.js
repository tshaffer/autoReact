/* @flow */

import { HSM, HState, STTopEventHandler } from './HSM';

export class ZoneStateMachine extends HSM {

  constructor() {
    debugger;
    super();
    debugger;
    this.stTop = new HState(this, "Top");
    this.stTop.HStateEventHandler = STTopEventHandler;

    this.topState = this.stTop;

    this.ConstructorHandler = this.VideoOrImagesZoneConstructor;
    this.InitialPseudoStateHandler = this.VideoOrImagesZoneGetInitialState;

  }

  VideoOrImagesZoneConstructor() {
    console.log("VideoOrImagesZoneConstructor invoked");

    // 'this' is the zone (HSM)
    this.activeState = this.playlist.firstState;
    //InitializeVideoOrImagesZoneObjects();
  }

  VideoOrImagesZoneGetInitialState() {
    console.log("VideoOrImagesZoneGetInitialState invoked");
    return this.activeState;
  }

}

