// @flow

import {combineReducers} from 'redux';
import { bsDmReducer } from '@brightsign/bsdatamodel';
import stateMachineReducer from './stateMachine';
import activeMediaStatesReducer from './activeMediaStates';
import dataFeedsReducer from './dataFeeds';
import mrssDataFeedItemReducer from './mrssDataFeedItems';

const rootReducer = combineReducers({
  bsdm: bsDmReducer,
  stateMachine: stateMachineReducer,
  activeMediaStates : activeMediaStatesReducer,
  dataFeeds : dataFeedsReducer,
  mrssDataFeedItems : mrssDataFeedItemReducer
});

export default rootReducer;
