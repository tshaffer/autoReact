/* @flow */

import { HState } from '../hsm/HSM';

export default class VideoHS extends HState {

  state : Object;

  constructor(zoneHSM : Object, id : string) {

    super(zoneHSM, id);

    this.superState = zoneHSM.stTop;

    this.HStateEventHandler = this.STDisplayingVideoEventHandler;
  }

  setNextState( nextState : Object ) {
    this.nextState = nextState;
  }

  STDisplayingVideoEventHandler(event : Object, stateData : Object) : string {

    stateData.nextState = null;

    if (event.EventType && event.EventType === 'ENTRY_SIGNAL') {
      console.log('entry signal');
      return 'HANDLED';
    }
    else if (event.EventType && event.EventType === 'EXIT_SIGNAL') {
      console.log('exit signal');
    }

    // mediaEndEvent

    stateData.nextState = this.superState;
    return 'SUPER';
  }
}
