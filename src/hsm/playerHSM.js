/* @flow */

import { HSM, HState, STTopEventHandler } from './HSM';

export class PlayerHSM extends HSM {

  constructor(bsp : Object, dispatch: Function, getState : Function, bsdm: Object) {

    super();

    this.bsp = bsp;
    this.dispatch = dispatch;
    this.getState = getState;
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


    // ISSUE
    // would like restartBSP to return a promise, then transition to the stPlaying state once that is done.
    // however, this function requires an immediate response
    // the problem is that entering stPlaying state invokes startBSPPlayback before the zones are even created
    this.bsp.restartPlayback('', dispatch, getState).then( () => {
      // send event to cause transition to stPlaying
      let event = {
        'EventType' : 'TRANSITION_TO_PLAYING'
      };
      dispatch(this.bsp.postMessage(event));
    });

    // from autorunClassic

    // activeScheduledPresentation = m.bsp.schedule.activeScheduledEvent
    // if type(activeScheduledPresentation) = "roAssociativeArray" then
    //   return m.stPlaying
    // else
    //   return m.stWaiting
    // endif

    // because of issue above
    return this.stWaiting;
  }

  STPlayerEventHandler(event:  Object, stateData: Object) : string {

    stateData.nextState = null;

    if (event.EventType && event.EventType === 'ENTRY_SIGNAL') {
      console.log(this.id + ": entry signal");
      return 'HANDLED';
    }

    stateData.nextState = this.superState;
    return "SUPER";
  }

  STPlayingEventHandler(event:  Object, stateData: Object) : string {

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
      const state = this.stateMachine.getState();
      this.stateMachine.bsdm = state.bsdm;
      this.stateMachine.bsp.startPlayback(this.stateMachine.dispatch, this.stateMachine.bsdm);

      return 'HANDLED';
    }

    stateData.nextState = this.superState;
    return "SUPER";
  }


  STWaitingEventHandler(event:  Object, stateData: Object) : string {

    stateData.nextState = null;

    if (event.EventType && event.EventType === 'ENTRY_SIGNAL') {
      console.log(this.id + ": entry signal");
      return "HANDLED";
    }
    else if (event.EventType && event.EventType === 'TRANSITION_TO_PLAYING') {
      console.log(this.id + ": TRANSITION_TO_PLAYING event received");
      stateData.nextState = this.stateMachine.stPlaying;
      return "TRANSITION";
    }

    stateData.nextState = this.superState;
    return "SUPER";
  }



}