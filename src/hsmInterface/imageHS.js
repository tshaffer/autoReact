/* @flow */

import { HState } from '../hsm/HSM';

export default class ImageHS extends HState {

  state : Object;

  constructor(zoneHSM : Object, id : string) {

    super(zoneHSM, id);

    this.superState = zoneHSM.stTop;

    this.HStateEventHandler = this.STDisplayingImageEventHandler;
  }

  setNextState( nextState : Object ) {
    this.nextState = nextState;
  }

  STDisplayingImageEventHandler(event : Object, stateData : Object) : string {

    stateData.nextState = null;

    if (event.EventType && event.EventType === 'ENTRY_SIGNAL') {
      console.log('entry signal');
      return 'HANDLED';
    }
    else if (event.EventType && event.EventType === 'EXIT_SIGNAL') {
      console.log('exit signal');
    }

    else if (event.EventType && event.EventType === 'timeoutEvent') {
      console.log('timeoutEvent');

      if (event.EventType === 'timeoutEvent') {
        stateData.nextState = this.nextState;
        return "TRANSITION";
      }
    }

    stateData.nextState = this.superState;
    return 'SUPER';
  }
}
