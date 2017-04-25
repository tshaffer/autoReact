/* @flow */

import { HState } from './HSM';

export default class ImageState extends HState {

  bsdmImageState : Object;
  state : Object;

  constructor(zoneHSM : Object, bsdmImageState : Object) {

    super(zoneHSM, bsdmImageState.id);
    this.bsdm = zoneHSM.bsdm;
    this.bsdmImageState = bsdmImageState;

    this.superState = zoneHSM.stTop;

    this.HStateEventHandler = this.STDisplayingImageEventHandler;
  }

  setNextState( nextState : Object ) {
    this.nextState = nextState;
  }

  STDisplayingImageEventHandler(event : Object, stateData : Object) : string {

    stateData.nextState = null;

    if (event.EventType && event.EventType === 'ENTRY_SIGNAL') {
      console.log(this.id + ": entry signal");
      return 'HANDLED';
    }
    else if (event.EventType && event.EventType === 'EXIT_SIGNAL') {
      console.log(this.id + ": exit signal");
    }

    else if (event.EventType && event.EventType === 'timeoutEvent') {
      console.log(this.id + ": timeoutEvent");

      if (event.EventType === 'timeoutEvent') {
        stateData.nextState = this.nextState;
        return "TRANSITION";
      }
    }

    stateData.nextState = this.superState;
    return 'SUPER';
  }
}
