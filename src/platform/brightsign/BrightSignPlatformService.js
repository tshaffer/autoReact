import APlatformService from '../APlatformService';

import path from 'path';

class BrightSignPlatformService extends APlatformService {

  static getRootDirectory() {
    return 'storage/sd';
  }

  static getDataPath() {
    return '/storage/sd';
  }

  static getPathToPool() {
    return '/sd:/';
  }

  static getUploadDirectory() {
    return 'storage/sd/uploads/';
  }

  static getMediaSrc(poolFilePath) {
    // poolFilePath starts with /storage/sd
    // return poolFilePath.substr(12);
    // const relativePath = poolFilePath.substr(12);
    // const mediaSrc = "file:///sd:/" + relativePath;
    // console.log('mediaSrc: ', mediaSrc);
    // return mediaSrc;
    return path.join('file://', poolFilePath);
  }

  static isTickerSupported() {
    return true;
  }

  // TODO - FIXME
  getHtmlSiteUrl(site) {
    return 'pool/test.html';
  }
}

export default BrightSignPlatformService;
