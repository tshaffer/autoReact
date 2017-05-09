/* @flow */

import { HState } from './HSM';

import {
  setActiveMediaState
} from '../store/activeMediaStates';

export default class MRSSDataFeedState extends HState {

  bsp : Object;
  bsdmState: Object;
  state: Object;
  currentFeed : Object;
  pendingFeed : Object;
  displayIndex : number;

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
        this.advanceToNextMRSSItem();
      }
      else {
        // this situation will occur when the feed itself has not downloaded yet - send a message to self to trigger
        // exit from state (like video playback failure)
        debugger;
      }

      // m.LaunchTimer()

      return 'HANDLED';
    }
    else if (event.EventType && event.EventType === 'EXIT_SIGNAL') {
      console.log('exit signal');
    }
    stateData.nextState = this.superState;
    return 'SUPER';
  }

  advanceToNextMRSSItem() {

    let displayedItem = false;

    while (!displayedItem) {
      if (this.displayIndex >= this.currentFeed.items.length) {
        this.displayIndex = 0;
        /*
        more stuff
         */

      }

      const displayItem = this.currentFeed.items[this.displayIndex];
      const url = displayItem.link[0];
      const filePath = this.dataFeed.getFeedPoolFilePath(url);
      this.displayMRSSItem( displayItem, filePath );
      displayedItem = true;

      this.displayIndex = this.displayIndex + 1;
    }
  }

  displayMRSSItem(displayItem : Object, filePath : string) {

    this.stateMachine.dispatch(setActiveMediaState(this.stateMachine.id, this.id));

    // if isImage(displayItem) {

    // dispatch something to redux store!!
    // }

  }
}
