// @flow

import {combineReducers} from 'redux';
import { bsDmReducer } from '@brightsign/bsdatamodel';
import stateMachineReducer from './stateMachine';
import activeMediaStatesReducer from './activeMediaStates';
import dataFeedsReducer from './dataFeeds';

const rootReducer = combineReducers({
  bsdm: bsDmReducer,
  stateMachine: stateMachineReducer,
  activeMediaStates : activeMediaStatesReducer,
  dataFeeds : dataFeedsReducer,
});

export default rootReducer;
