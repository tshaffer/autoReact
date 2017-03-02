// @flow

// ------------------------------------
// Constants
// ------------------------------------

// ------------------------------------
// Actions
// ------------------------------------

// ------------------------------------
// Action Creators
// ------------------------------------
export function initStateMachine(rootPath : string) {
  return (dispatch : Function, getState : Function) => {

    const state : Object = getState();
    console.log(state);
    console.log(rootPath);
    console.log(dispatch);
  };
}


// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
};

export default function(state : Object = initialState, action : string) {

  // switch (action.type) {
  //
  // }

  console.log('stateMachine reducer: ', state);
  console.log(action);

  return state;
}


// ------------------------------------
// Utilities
// ------------------------------------


// ------------------------------------
// Selectors
// ------------------------------------

