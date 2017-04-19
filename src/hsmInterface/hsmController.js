
import { ZoneHSM } from './zoneHSM';

import { setActiveState } from '../store/zone';

let hsmList = [];

export function buildZoneHSM(dispatch : Function, bsdm : Object, zoneId : string) {
  const zoneHSM = new ZoneHSM(dispatch, bsdm, zoneId);
  registerHSM(zoneHSM);
}

function registerHSM(hsm) {
  hsmList.push(hsm);
}

export function postMessage(event : Object) {
  return (dispatch: Function, getState: Function) => {
    dispatchEvent(dispatch, getState, event);
  };
}

function dispatchEvent(dispatch : Function, getState : Function, event : Object) {

  hsmList.forEach( (hsm) => {
    console.log('before: ', hsm.activeState);
    hsm.Dispatch(event);
    console.log('after: ', hsm.activeState);

    // update activeEvent
    dispatch(setActiveState(hsm.activeState));
  });
}
