// @flow

import {combineReducers} from 'redux';
import { bsDmReducer } from '@brightsign/bsdatamodel';

const rootReducer = combineReducers({
  bsdm: bsDmReducer,
});

export default rootReducer;
