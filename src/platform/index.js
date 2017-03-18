const __POOFORM__ = 'desktop';
let loadedModule = null;
if(__POOFORM__ === 'brightsign'){
  loadedModule = require('./brightsign/index.js');
}else{
  loadedModule = require('./desktop/index.js');
}
export default loadedModule;
