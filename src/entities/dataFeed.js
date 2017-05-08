/* @flow */

import fs from 'fs';
import path from 'path';
const crypto = require('crypto');

const xml2js = require('xml2js');

import { MRSSFeed } from './mrssFeed';

import {
  DataFeedType,
  DataFeedUsageType,
} from '@brightsign/bscore';

import {
  DmDataFeed,
  dmGetSimpleStringFromParameterizedString,
} from '@brightsign/bsdatamodel';

import PlatformService from '../platform';

export class DataFeed {

  id : string;
  type : string;
  usage : string;
  url : string;
  updateInterval : number;
  name : string;
  rssItems: Array<Object>;
  feed : MRSSFeed;
  assetsToDownload : Array<Object>;

  constructor(bsdmDataFeed: DmDataFeed) {

    Object.assign(this, bsdmDataFeed);
    this.rssItems = [];
  }

  parseSimpleRSSFeed(rssData: Object) {

    const rssChannel = rssData.rss.channel[0];
    const rssItemSpecs = rssChannel.item;

    // check for change in feed
    if (rssItemSpecs.length !== this.rssItems.length) {
      console.log('parseSimpleRSSFeed - length changed');
    }
    rssItemSpecs.forEach( (rssItemSpec, index ) => {
      if (this.rssItems.length > index && rssItemSpec.title[0] !== this.rssItems[index].title) {
        console.log('parseSimpleRSSFeed - content changed');
      }
    });

    this.rssItems = rssItemSpecs.map(rssItemSpec => {
      return {
        description: rssItemSpec.description[0],
        title: rssItemSpec.title[0],
      };
    });

    // this.populateTicker(rssItems);
  }

  restartDownloadTimer(bsp : Object) {

    const updateInterval = this.updateInterval * 1000;

    setTimeout(() => {
      console.log('restartDownloadTimer: timeout occurred');
      bsp.queueRetrieveLiveDataFeed(this);
    }
      ,updateInterval
    );
  }

  retrieveFeed(bsp : Object) {

    const url = dmGetSimpleStringFromParameterizedString(this.url);

    console.log('retrieveFeed: ' + url);

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

    if (this.usage === DataFeedUsageType.Content &&
      (this.type === DataFeedType.BSNDynamicPlaylist) ||
      (this.type === DataFeedType.BSNMediaFeed)) {
      this.downloadMRSSContent(feedData);
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
    this.restartDownloadTimer(bsp);
  }

  downloadMRSSContent(feedData : Object) {

    const rootPath: string = PlatformService.default.getRootDirectory();
    let filePath = path.join(rootPath, 'feed_cache', this.name);
    filePath = filePath + '.json';

    const feedStr = JSON.stringify(feedData, null, '\t');
    fs.writeFileSync(filePath, feedStr);

    this.parseMRSSFeed(filePath);

    // get files to download
    this.assetsToDownload = [];
    this.feed.items.forEach( (item) => {
      // Do not download content of type 'text/html' - they are accessed directly
      // console.log('link: ', item.link[0]);
      // console.log('name: ', item.link[0]);
      // if (item.guid && item.guid[0]) {
      //   console.log('changeHint: ', item.guid[0]);
      // }

      let change_hint = '';
      if (item.guid && item.guid[0]) {
        change_hint = item.guid[0];
      }

      this.assetsToDownload.push( {
        link: item.link[0],
        name: item.link[0],
        change_hint
      });
    });

    this.fetchAsset(this.assetsToDownload[0].link).then( () => {
      debugger;
    });

    // download content - simulate assetFetcher
    // do the following?
    //    download each file
    //    get sha1
    //    based on sha1, move it to the correct place
    //    update pool asset files?
  }

  parseMRSSFeed(filePath : string) {

    this.feed = new MRSSFeed(this);
    this.feed.populateFeedItems(filePath);

    if (this.feed.ttlSeconds > 0 && this.feed.ttlSeconds < this.updateInterval) {
      this.updateInterval = this.feed.ttlSeconds;
    }
  }

  fetchAsset(url : string) {

    console.log('retrieve asset from: ' + url);

    return new Promise( (resolve, reject) => {
      fetch(url)
        .then( (response) => {
          let responsePromise = response.arrayBuffer();
          responsePromise.then( (contents) => {
            const buf = toBuffer(contents);
            fs.writeFile('flibbet', buf, (err) => {
              if (err) {
                reject(err);
              }
              this.getSHA1('flibbet').then( (sha1) => {

                debugger;

                // move file to correct pool location
                const targetPath: string = path.join(PlatformService.default.getRootDirectory(), 'pool');
                this.getPoolFilePath(targetPath, sha1, true).then((relativeFilePath) => {
                  const absolutePoolPath = path.join(targetPath, relativeFilePath, 'sha1-' + sha1);
                  fs.rename('flibbet', absolutePoolPath, (err) => {
                    if (err) {
                      debugger;
                      reject(err);
                    }
                  });
                  console.log('moved flibbet to: ', absolutePoolPath);
                  resolve();
                });
              });
            });
          });
        }).catch( (err) => {
          console.log(err);
          debugger;
        });
    });
  }

  getSHA1(filePath: string) {

    return new Promise((resolve, _) => {
      const hash = crypto.createHash('sha1');
      const input = fs.createReadStream(filePath);
      input.on('readable', () => {
        const data = input.read();
        if (data) {
          hash.update(data);
        }
        else {
          const sha1 = hash.digest('hex');
          resolve(sha1);
        }
      });
      // TODO - check for error
    });
  }

  getPoolFilePath(startDir: string, sha1: string, createDirectories: boolean) {

    return new Promise( (resolve, reject) => {

      let relativeFilePath = '';

      if (sha1.length >= 2) {

        let folders = [];
        folders.push(sha1.substring(sha1.length - 2, sha1.length - 2 + 1));
        folders.push(sha1.substring(sha1.length - 1, sha1.length - 1 + 1));

        if (createDirectories) {
          let currentDir = path.join(startDir, folders[0]);
          mkdir(currentDir).then(() => {
            currentDir = path.join(currentDir, folders[1]);
            mkdir(currentDir).then(() => {
              folders.forEach(folderName => {
                relativeFilePath = relativeFilePath + folderName + '/';
              });
              resolve(relativeFilePath);
            });
          }).catch( (err) => {
            debugger;
            reject(err);
          });
        }
        else {
          folders.forEach(folderName => {
            relativeFilePath = relativeFilePath + folderName + '/';
          });
          resolve(relativeFilePath);
        }
      }
      else {
        // not sure if this case can occur
        debugger;
      }
    });
  }


}

// From ArrayBuffer to Buffer
function toBuffer(ab : ArrayBuffer) : Buffer {
  let buf = new Buffer(ab.byteLength);
  let view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}

function mkdir(dirPath: string, ignoreAlreadyExists: boolean = true) {
  return new Promise( (resolve, reject) => {
    fs.mkdir(dirPath, (err) => {
      if (!err || (err.code === 'EEXIST' && ignoreAlreadyExists)) {
        resolve();
      }
      else {
        reject(err);
      }
    });
  });
}


