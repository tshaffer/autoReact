// @flow

import {combineReducers} from 'redux';
import { bsDmReducer } from '@brightsign/bsdatamodel';
import presentationsReducer from './presentations';
import autoplayReducer from './autoplay';

const rootReducer = combineReducers({
  bsdm: bsDmReducer,
  presentations: presentationsReducer,
  autoplay: autoplayReducer,
});

export default rootReducer;
