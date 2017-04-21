// @flow

import {combineReducers} from 'redux';
import { bsDmReducer } from '@brightsign/bsdatamodel';
import stateMachineReducer from './stateMachine';
import activeMediaStatesReducer from './activeMediaStates';

const rootReducer = combineReducers({
  bsdm: bsDmReducer,
  stateMachine: stateMachineReducer,
  activeMediaStates : activeMediaStatesReducer
});

export default rootReducer;
