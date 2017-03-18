import APlatformService from '../APlatformService';

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

  static isTickerSupported() {
    return true;
  }

  // TODO - FIXME
  getHtmlSiteUrl(site) {
    return 'pool/test.html';
  }
}

export default BrightSignPlatformService;
