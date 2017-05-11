/* @flow */

import { HState } from './HSM';

import {
  setActiveMediaState
} from '../store/activeMediaStates';

import {
  setFeedDisplayItem
} from '../store/feedDisplayItems';

export default class MRSSDataFeedState extends HState {

  bsp : Object;
  bsdmState: Object;
  state: Object;
  currentFeed : Object;
  pendingFeed : Object;
  displayIndex : number;
  dataFeed : Object;

  constructor(bsp : Object, zoneHSM: Object, bsdmState: Object) {

    super(zoneHSM, bsdmState.id);
    this.bsp = bsp;
    this.bsdm = zoneHSM.bsdm;
    this.bsdmState = bsdmState;

    this.superState = zoneHSM.stTop;

    this.HStateEventHandler = this.STDisplayingMRSSDataFeedEventHandler;

    console.log(this.bsp.dataFeeds);

    this.dataFeed = this.bsp.dataFeeds[bsdmState.contentItem.dataFeedId];
  }

  setNextState( nextState : Object ) {
    this.nextState = nextState;
  }

  // STPlayingMediaRSSEventHandler in ba classic

  STDisplayingMRSSDataFeedEventHandler(event : Object, stateData : Object) : string {

    stateData.nextState = null;

    if (event.EventType && event.EventType === 'ENTRY_SIGNAL') {
      console.log('entry signal');
      this.currentFeed = {};
      this.pendingFeed = {};

      // get data feed associated with this state
      if (this.dataFeed.feedPoolAssetFiles &&
        Object.keys(this.dataFeed.feedPoolAssetFiles).length === this.dataFeed.assetsToDownload.length) {

        // feed is fully downloaded
        this.currentFeed = this.dataFeed.feed;
        this.displayIndex = 0;
        this.advanceToNextMRSSItem(true);
      }
      else {
        debugger;
      }

      return 'HANDLED';
    }
    else if (event.EventType && event.EventType === 'EXIT_SIGNAL') {
      console.log('exit signal');
    }
    else if (event.EventType && event.EventType === 'timeoutEvent') {
      console.log('timeout event');

      // check to see if it's at the end of the feed
      if (this.atEndOfFeed()) {
        stateData.nextState = this.nextState;
        return "TRANSITION";
      }

      this.advanceToNextMRSSItem(false);
    }

    stateData.nextState = this.superState;
    return 'SUPER';
  }

  atEndOfFeed() {
    return (this.displayIndex >= this.currentFeed.items.length);
  }

  advanceToNextMRSSItem(onEntry : boolean) {

    if (this.displayIndex >= this.currentFeed.items.length) {
      this.displayIndex = 0;
    }

    const displayItem = this.currentFeed.items[this.displayIndex];
    this.stateMachine.dispatch(setFeedDisplayItem(this.dataFeed.id, displayItem));

    // should only do this on entry, but it currently only works if setFeedDisplayItem is called first
    if (onEntry) {
      this.stateMachine.dispatch(setActiveMediaState(this.stateMachine.id, this.id));
    }

    this.displayIndex = this.displayIndex + 1;
  }
}
