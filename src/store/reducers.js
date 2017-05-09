// @flow

import {combineReducers} from 'redux';
import { bsDmReducer } from '@brightsign/bsdatamodel';
import stateMachineReducer from './stateMachine';
import activeMediaStatesReducer from './activeMediaStates';
import dataFeedsReducer from './dataFeeds';
import feedDisplayItemsReducer from './feedDisplayItems';

const rootReducer = combineReducers({
  bsdm: bsDmReducer,
  stateMachine: stateMachineReducer,
  activeMediaStates : activeMediaStatesReducer,
  dataFeeds : dataFeedsReducer,
  feedDisplayItems : feedDisplayItemsReducer
});

export default rootReducer;
