// @flow

import {combineReducers} from 'redux';
import { bsDmReducer } from '@brightsign/bsdatamodel';
import stateMachineReducer from './stateMachine';

const rootReducer = combineReducers({
  bsdm: bsDmReducer,
  stateMachine: stateMachineReducer,
});

export default rootReducer;
