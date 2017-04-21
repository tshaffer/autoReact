// @flow

import {combineReducers} from 'redux';
import { bsDmReducer } from '@brightsign/bsdatamodel';
import stateMachineReducer from './stateMachine';
import zoneReducer from './zone';
import zoneHSMsReducer from './zoneHSMs';
import activeMediaStatesReducer from './activeMediaStates';

const rootReducer = combineReducers({
  bsdm: bsDmReducer,
  stateMachine: stateMachineReducer,
  zone : zoneReducer,
  zoneHSMs : zoneHSMsReducer,
  activeMediaStates : activeMediaStatesReducer
});

export default rootReducer;
