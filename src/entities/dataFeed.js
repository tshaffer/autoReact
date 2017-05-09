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
  feedPoolAssetFiles : Object = {};

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
      this.downloadMRSSContent(bsp, feedData);
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

  parseMRSSFeed(filePath : string) {

    this.feed = new MRSSFeed(this);
    this.feed.populateFeedItems(filePath);

    if (this.feed.ttlSeconds > 0 && this.feed.ttlSeconds < this.updateInterval) {
      this.updateInterval = this.feed.ttlSeconds;
    }
  }

  downloadMRSSContent(bsp : Object, feedData : Object) {

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

    // see bacon::src/platform/desktop//services/mediaThumbs.js::buildImageThumbs
    // http://stackoverflow.com/questions/24586110/resolve-promises-one-after-another-i-e-in-sequence

    let self = this;

    let fileCount = this.assetsToDownload.length;
    let sequence = Promise.resolve();
    this.assetsToDownload.forEach(function(assetToDownload) {
      sequence = sequence.then( () => {
        return self.fetchTheAsset(assetToDownload.link);
      }).then(() => {
        console.log('fetchTheAsset resolved');
        fileCount--;
        if (fileCount === 0) {

          // tell the states to switch over to the new spec immediately
          let event = {
            'EventType' : 'MRSS_SPEC_UPDATED',
            'EventData' : this
          };
          bsp.dispatch(bsp.postMessage(event));

        }
      });
    });
  }

  writeFileGetSha1(buf : Buffer, filePath : string) {

    return new Promise( (resolve, reject) => {
      fs.writeFile(filePath, buf, (err) => {
        if (err) {
          reject(err);
        }
        this.getSHA1(filePath).then((sha1) => {
          resolve(sha1);
        });
      });
    });
  }

  fetchTheAsset(url : string) {

    let targetPath : string = '';
    let absolutePoolPath : string = '';
    let fileSha1 : string = '';

    console.log('retrieve asset from: ' + url);

    return new Promise( (resolve, reject) => {

      fetch(url).then((response) => {
        return response.arrayBuffer();
      }).then((contents) => {

        // write file to temporary location
        const buf = toBuffer(contents);
        return this.writeFileGetSha1(buf, 'flibbet');

      }).then( (sha1) => {

        fileSha1 = sha1;

        // use the sha1 to get the target file path
        targetPath = path.join(PlatformService.default.getRootDirectory(), 'pool');
        return this.getPoolFilePath(targetPath, sha1, true);

      }).then((relativeFilePath : string) => {

        // move file to the pool
        absolutePoolPath = path.join(targetPath, relativeFilePath, 'sha1-' + fileSha1);
        fs.rename('flibbet', absolutePoolPath, (err) => {
          if (err) {
            debugger;
            reject(err);
          }
        });

        // add file to pool asset files
        console.log('moved flibbet to: ', absolutePoolPath);
        this.addFeedPoolAssetFile(url, absolutePoolPath);
        resolve();
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
          const sha1 : string = hash.digest('hex');
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

  setFeedPoolAssetFiles(poolAssetFilesIn : Object) {
    this.feedPoolAssetFiles = poolAssetFilesIn;
  }

  addFeedPoolAssetFile(fileName : string, filePath : string) {
    this.feedPoolAssetFiles[fileName] = filePath;
  }

  getFeedPoolFilePath(resourceIdentifier : string) {

    const filePath =  this.feedPoolAssetFiles[resourceIdentifier];
    console.log('resourceIdentifier: ' + resourceIdentifier + ', filePath: ' +  filePath);
    return filePath;
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
    fs.mkdir(dirPath, 0o777, (err) => {
      if (!err || (err.code === 'EEXIST' && ignoreAlreadyExists)) {
        resolve();
      }
      else {
        reject(err);
      }
    });
  });
}


