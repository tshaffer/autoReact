/* @flow */

import {
  DmDataFeed,
} from '@brightsign/bsdatamodel';


export class ARLiveDataFeed {

  bsdmDataFeed : DmDataFeed;
  rssItems : Array<Object>;

  constructor(bsdmDataFeed : DmDataFeed) {

    this.bsdmDataFeed = bsdmDataFeed;
    this.rssItems = [];
  }

  parseSimpleRSSFeed(rssData : Object) {

    const rssChannel = rssData.rss.channel[0];
    const rssItemSpecs = rssChannel.item;
    this.rssItems = rssItemSpecs.map( rssItemSpec => {
      return {
        description: rssItemSpec.description[0],
        title: rssItemSpec.title[0],
      };
    });

    // this.populateTicker(rssItems);
  }

}
