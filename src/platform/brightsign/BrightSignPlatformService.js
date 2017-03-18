import APlatformService from '../APlatformService';

class BrightSignPlatformService extends APlatformService {

  static getRootDirectory() {
    return 'storage/SD';
  }
}

export default BrightSignPlatformService;
