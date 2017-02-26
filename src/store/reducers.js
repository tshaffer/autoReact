// @flow

import {combineReducers} from 'redux';
import { bsDmReducer } from '@brightsign/bsdatamodel';
import presentationsReducer from './presentations';

const rootReducer = combineReducers({
  bsdm: bsDmReducer,
  presentations: presentationsReducer,
});

export default rootReducer;
