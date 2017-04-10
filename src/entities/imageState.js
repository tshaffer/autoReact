/* @flow */

import { HState } from './HSM';

export default class ImageState extends HState {

  bsdmImageState : Object;
  state : Object;

  constructor(zoneHSM : Object, bsdmImageState : Object) {

    super(zoneHSM, bsdmImageState.id);
    this.bsdmImageState = bsdmImageState;

    this.superState = zoneHSM.stTop;

    this.HStateEventHandler = this.STDisplayingImageEventHandler;
  }

  STDisplayingImageEventHandler(event : Object, stateData : Object) : string {

    stateData.nextState = null;

    console.log(event);
    console.log(stateData);

    stateData.nextState = this.superState;
    return 'SUPER';
  }
}
