import APlatformService from '../APlatformService';

import path from 'path';

class DesktopPlatformService extends APlatformService {

  static getRootDirectory() {
    return '/Users/tedshaffer/Desktop/baconTestCard';
  }

  static getDataPath() {
    return '/Users/tedshaffer/Desktop/baconTestCard';
  }

  static getPathToPool() {
    return '/Users/tedshaffer/Desktop/baconTestCard';
  }

  static getUploadDirectory() {
    return 'uploads/';
  }

  static getMediaSrc(poolFilePath) {
    return path.join('file://', poolFilePath);
  }

  static isTickerSupported() {
    return false;
  }

  // TODO - FIXME
  getHtmlSiteUrl(site) {
    site.url;
  }
}

export default DesktopPlatformService;
