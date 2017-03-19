import APlatformService from '../APlatformService';

class DesktopPlatformService extends APlatformService {

  static getRootDirectory() {
    return '/Users/tedshaffer/Desktop/baconTestCard';
  }

  static getPathToPool() {
    return '/Users/tedshaffer/Desktop/baconTestCard';
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
