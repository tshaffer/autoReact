/* @flow */

import { HSM, HState, STTopEventHandler } from './HSM';

import {
  restartBSP, startBSPPlayback
} from '../store/stateMachine';

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

    // from autorunClassic

    // activeScheduledPresentation = m.bsp.schedule.activeScheduledEvent
    // if type(activeScheduledPresentation) = "roAssociativeArray" then
    //   return m.stPlaying
    // else
    //   return m.stWaiting
    // endif

    return this.stPlaying;
  }

  STPlayerEventHandler(event:  Object, stateData: Object) : string {

    stateData.nextState = null;

    if (event.EventType && event.EventType === 'ENTRY_SIGNAL') {

      console.log(this.id + ": entry signal");

      // TODO
      // set a timer for when the current presentation should end

      // TODO
      // assume presentation is active

      // TODO
      //check for live data feeds that include content (either MRSS or content for Media Lists / PlayFiles).
      // for each of them, check to see if the feed and/or content already exists.

      // load live data feeds

      // queue live data feeds for downloading

      // launch playback
      startBSPPlayback();

      return 'HANDLED';
    }

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