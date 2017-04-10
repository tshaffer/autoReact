/* @flow */

import { HState } from './HSM';

export default class VideoState extends HState {

  bsdmVideoState : Object;
  state : Object;

  constructor(zoneHSM : Object, bsdmVideoState : Object) {

    super(zoneHSM, bsdmVideoState.id);
    this.bsdmVideoState = bsdmVideoState;

    this.superState = zoneHSM.stTop

    this.HStateEventHandler = this.STDisplayingVideoEventHandler;
  }

  STDisplayingVideoEventHandler(event : Object, stateData : Object) : string {

    stateData.nextState = null;

    console.log(event);
    console.log(stateData);

    stateData.nextState = this.superState;
    return 'SUPER';
  }
}
