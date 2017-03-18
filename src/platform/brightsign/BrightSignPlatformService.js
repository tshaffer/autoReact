import APlatformService from '../APlatformService';

class BrightSignPlatformService extends APlatformService {

  static getRootDirectory() {
    return 'storage/sd';
  }

  static getDataPath() {
    return '/storage/sd';
  }

  static getUploadDirectory() {
    return 'storage/sd/uploads/';
  }

  static getMediaSrc(poolFilePath) {
    return poolFilePath.substr(12);
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
