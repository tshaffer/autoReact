/* @flow */

const xml2js = require('xml2js');

import {
  DataFeedType,
  DataFeedUsageType,
} from '@brightsign/bscore';

import {
  DmDataFeed,
  dmGetSimpleStringFromParameterizedString,
} from '@brightsign/bsdatamodel';

export class ARLiveDataFeed {

  bsdmDataFeed: DmDataFeed;
  rssItems: Array<Object>;

  constructor(bsdmDataFeed: DmDataFeed) {

    this.bsdmDataFeed = bsdmDataFeed;
    this.rssItems = [];
  }

  parseSimpleRSSFeed(rssData: Object) {

    const rssChannel = rssData.rss.channel[0];
    const rssItemSpecs = rssChannel.item;
    this.rssItems = rssItemSpecs.map(rssItemSpec => {
      return {
        description: rssItemSpec.description[0],
        title: rssItemSpec.title[0],
      };
    });

    // this.populateTicker(rssItems);
  }

  restartDownloadTimer() {

    let self = this;

    setTimeout(() => {
      console.log('restartDownloadTimer: timeout occurred');
    }
      , self.bsdmDataFeed.updateInterval * 1000);
  }

  retrieveFeed(bsp : Object) {

    const liveDataFeed : Object = this.bsdmDataFeed;

    const url = dmGetSimpleStringFromParameterizedString(liveDataFeed.url);

    fetch(url)
      .then( (response) => {
        let blobPromise = response.text();
        blobPromise.then( (content) => {
          let parser = new xml2js.Parser();
          try {
            parser.parseString(content, (err, jsonResponse) => {
              if (err) {
                console.log(err);
                debugger;
              }
              console.log(jsonResponse);
              this.processFeedContents(bsp, jsonResponse);
            });
          }
          catch (err) {
            debugger;
          }
        });
      }).catch( (err) => {
        console.log(err);
        debugger;
      });
  }

  processFeedContents(bsp : Object, feedData : Object) {

    const liveDataFeed = this.bsdmDataFeed;

    if (liveDataFeed.usage === DataFeedUsageType.Content &&
      (liveDataFeed.DataFeedType === DataFeedType.BSNDynamicPlaylist) ||
      (liveDataFeed.DataFeedType === DataFeedType.BSNMediaFeed)) {
      console.log(liveDataFeed,' not supported yet');
      debugger;
    }
    else {
      this.parseSimpleRSSFeed(feedData);
    }

    // send internal message indicating that the data feed has been updated
    let event = {
      'EventType' : 'LIVE_DATA_FEED_UPDATE',
      'EventData' : this
    };
    bsp.dispatch(bsp.postMessage(event));

    // ' set a timer to update this live data feed
    this.restartDownloadTimer();
  }
}
