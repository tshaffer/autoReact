/* @flow */

import { HState } from './HSM';

export default class ImageState {

  bsdmImageState : Object;
  state : Object;

  constructor(bsdmImageState : Object) {
    this.bsdmImageState = bsdmImageState;
    this.state = new HState(this, bsdmImageState.id);
    this.state.HStateEventHandler = this.STDisplayingImageEventHandler;
  }

  STDisplayingImageEventHandler(event : Object, stateData : Object) : string {

    console.log(event);
    console.log(stateData);

    return 'SUPER';
  }
}
