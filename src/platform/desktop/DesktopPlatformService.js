import APlatformService from '../APlatformService';

class DesktopPlatformService extends APlatformService {

  static getRootDirectory() {
    // return '/Users/tedshaffer/Desktop/baconTestCard';
    return '/Users/tedshaffer/Desktop/baconMZPublish';
  }

  static getPathToPool() {
    // return '/Users/tedshaffer/Desktop/baconTestCard';
    return '/Users/tedshaffer/Desktop/baconMZPublish';
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
