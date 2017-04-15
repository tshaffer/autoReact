/* @flow */

import { HState } from './HSM';

// import {
//   dmGetEventIdsForMediaState,
//   // dmGetTransitionIdsForEvent,
//   // dmGetTransitionById,
//   // dmGetMediaStateById,
// } from '@brightsign/bsdatamodel';

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
      console.log('entry signal');
      return 'HANDLED';
    }
    else if (event.EventType && event.EventType === 'EXIT_SIGNAL') {
      console.log('exit signal');
    }

    else if (event.EventType && event.EventType === 'timeoutEvent') {
      console.log('timeoutEvent');

      // const eventIds = dmGetEventIdsForMediaState( this.bsdm, { id : this.bsdmImageState.id });
      // const bsdmEvent = dmGetEventById( this.bsdm, { id : eventIds[0] } );
      if (event.EventType === 'timeoutEvent') {
        // const transitionIds = dmGetTransitionIdsForEvent( this.bsdm, { id : eventIds[0] });
        // const transition = dmGetTransitionById(this.bsdm, { id : transitionIds[0] } );
        // const targetMediaStateId = transition.targetMediaStateId;
        // const targetMediaState = dmGetMediaStateById(this.bsdm, { id : targetMediaStateId});

        stateData.nextState = this.nextState;
        return "TRANSITION";
      }
    }


    stateData.nextState = this.superState;
    return 'SUPER';
  }
}
