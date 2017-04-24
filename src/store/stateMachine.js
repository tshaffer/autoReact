// @flow

// ------------------------------------
// Constants
// ------------------------------------
export const SET_PLAYBACK_STATE = 'SET_PLAYBACK_STATE';

// ------------------------------------
// Actions
// ------------------------------------
export function setPlaybackState(playbackState : string){

  return {
    type: SET_PLAYBACK_STATE,
    payload: playbackState
  };
}

// ------------------------------------
// Action Creators
// ------------------------------------
// export function restartPresentation(rootPath : string, pathToPool : string) {
//   return (dispatch : Function, getState : Function) => {
//     runBSP(rootPath, pathToPool, dispatch, getState);
//   };
// }

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  playbackState: 'active',
};

export default function(state : Object = initialState, action : Object) {

  switch (action.type) {

    case SET_PLAYBACK_STATE: {

      let newState = {
        ...state,
        playbackState: action.payload
      };

      console.log(newState);
      return newState;
    }
  }

  return state;
}


