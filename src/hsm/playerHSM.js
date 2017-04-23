/* @flow */

import { HSM, HState, STTopEventHandler } from './HSM';

import { restartBSP } from '../store/stateMachine';

export class PlayerHSM extends HSM {

  constructor(dispatch: Function, bsdm: Object) {

    super();

    this.bsdm = bsdm;

    this.stTop = new HState(this, "Top");
    this.stTop.HStateEventHandler = STTopEventHandler;

    this.initialPseudoStateHandler = this.initializePlayerStateMachine;

    this.stPlayer = new HState(this, "Player");
    this.stPlayer.HStateEventHandler = this.STPlayerEventHandler;
    this.stPlayer.superState = this.stTop;

    this.stPlaying = new HState(this, "Playing");
    this.stPlaying.HStateEventHandler = this.STPlayingEventHandler;
    this.stPlaying.superState = this.stPlayer;

    this.stWaiting = new HState(this, "Waiting");
    this.stWaiting.HStateEventHandler = this.STWaitingEventHandler;
    this.stWaiting.superState = this.stPlayer;

    this.topState = this.stTop;
  }

  initializePlayerStateMachine(dispatch : Function, getState : Function) {

    console.log("initializePlayerStateMachine invoked");

    restartBSP('', dispatch, getState);

    // activeScheduledPresentation = m.bsp.schedule.activeScheduledEvent
    // if type(activeScheduledPresentation) = "roAssociativeArray" then
    //   return m.stPlaying
    // else
    //   return m.stWaiting
    // endif

    return this.playing;
  }

  STPlayerEventHandler(event:  Object, stateData: Object) : string {

    stateData.nextState = null;

    // TBD

    stateData.nextState = this.superState;
    return "SUPER";
  }

  STWaitingEventHandler(event:  Object, stateData: Object) : string {

    stateData.nextState = null;

    stateData.nextState = this.superState;
    return "SUPER";
  }

  STPlayingEventHandler(event:  Object, stateData: Object) : string {

    stateData.nextState = null;

    if (event.EventType && event.EventType === 'ENTRY_SIGNAL') {
      debugger;
      console.log('entry signal');
      return 'HANDLED';
    }

    // QueueRetrieveLiveDataFeed

    stateData.nextState = this.superState;
    return "SUPER";
  }


}