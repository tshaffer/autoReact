/* @flow */

import fs from 'fs';
import path from 'path';
const crypto = require('crypto');

import {
  DmDataFeed,
} from '@brightsign/bsdatamodel';

import PlatformService from '../platform';

import {
  DataFeed
} from './dataFeed';

import { MRSSFeed } from './mrssFeed';

export class MrssDataFeed extends DataFeed {

  id : string;
  type : string;
  usage : string;
  url : string;
  updateInterval : number;
  name : string;
  feed : MRSSFeed;
  assetsToDownload : Array<Object>;
  feedPoolAssetFiles : Object = {};

  constructor(bsdmDataFeed: DmDataFeed) {
    super(bsdmDataFeed);
  }

  processFeedContents(bsp : Object, feedData : Object) {
    this.downloadMRSSContent(bsp, feedData);
    this.postLiveDataFeedUpdateMessage(bsp);
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
        name: item.url,
        url: item.url,
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
        return self.fetchTheAsset(assetToDownload.url);
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
