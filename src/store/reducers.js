// @flow

import {combineReducers} from 'redux';
import { bsDmReducer } from '@brightsign/bsdatamodel';
import stateMachineReducer from './stateMachine';
import zoneHSMsReducer from './zoneHSMs';
import activeMediaStatesReducer from './activeMediaStates';

const rootReducer = combineReducers({
  bsdm: bsDmReducer,
  stateMachine: stateMachineReducer,
  zoneHSMs : zoneHSMsReducer,
  activeMediaStates : activeMediaStatesReducer
});

export default rootReducer;
