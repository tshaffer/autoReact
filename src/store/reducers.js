// @flow

import {combineReducers} from 'redux';
import { bsDmReducer } from '@brightsign/bsdatamodel';
// import SignReducer from './sign';
import presentationsReducer from './presentations';

const rootReducer = combineReducers({
  bsdm: bsDmReducer,
  // sign: SignReducer,
  presentations: presentationsReducer,
});

export default rootReducer;
