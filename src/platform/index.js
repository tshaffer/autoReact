// @flow

let platform;
console.log('attempt to create BS javascript object.');
try {
// $FlowBrightSignExternalObject
  const deviceInfo = new BSDeviceInfo();
  console.log('deviceInfo creation succeeded, running on a brightSign');
  console.log(deviceInfo);
  platform = 'brightsign';
}
catch (e) {
  console.log('deviceInfo creation failed, not a brightSign');
  platform = 'desktop';
}

let loadedModule = null;
if(platform === 'brightsign'){
  loadedModule = require('./brightsign/index.js');
}else{
  loadedModule = require('./desktop/index.js');
}
export default loadedModule;
