// const __PLATFORM__ = 'brightsign';
const __PLATFORM__ = 'desktop';
let loadedModule = null;
if(__PLATFORM__ === 'brightsign'){
  loadedModule = require('./brightsign/index.js');
}else{
  loadedModule = require('./desktop/index.js');
}
export default loadedModule;
