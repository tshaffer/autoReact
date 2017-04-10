/* @flow */

import { HState } from './HSM';

export default class VideoState {

  bsdmVideoState : Object;
  state : Object;

  constructor(bsdmVideoState : Object) {
    this.bsdmVideoState = bsdmVideoState;
    this.state = new HState(this, bsdmVideoState.id);
    this.state.HStateEventHandler = this.STDisplayingVideoEventHandler;
  }

  STDisplayingVideoEventHandler(event : Object, stateData : Object) : string {

    console.log(event);
    console.log(stateData);

    return 'SUPER';
  }
}
