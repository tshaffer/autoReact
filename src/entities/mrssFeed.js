/* @flow */

import fs from 'fs';

const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

import {
  DataFeed
}
from './dataFeed';

import { MRSSDataFeedItem } from '../entities/mrssDataFeedItem';

export class MRSSFeed {

  constructor(dataFeed : DataFeed) {
    this.dataFeed = dataFeed;
    this.ttlSeconds = -1;
  }

  dataFeed : DataFeed;
  ttlSeconds : number;

  title : string;

  items : Array<Object>;

  populateFeedItems(filePath : string) {

    this.items = [];

    // read file
    const feedFileBuf = fs.readFileSync(filePath);
    const fileStr: string = decoder.write(feedFileBuf);
    const feed: Object = JSON.parse(fileStr);

    const dataFeedBase = feed.rss.channel[0];
    if (dataFeedBase.title && dataFeedBase.title.length > 0) {
      this.title = dataFeedBase.title[0];
    }
    if (dataFeedBase.item) {
      dataFeedBase.item.forEach( (feedItem) => {
        this.items.push(new MRSSDataFeedItem(feedItem));
      });
    }
  }

  parseFeedByPlugin() {

  }

  setTTLMinutes() {

  }

  contentExists() {

  }

  allContentExists() {

  }
}