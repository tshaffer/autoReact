import fs from 'fs';

import {
  dmOpenSign,
} from '@brightsign/bsdatamodel';

// ------------------------------------
// Constants
// ------------------------------------
export const ADD_PRESENTATION = 'ADD_PRESENTATION';
export const ADD_PRESENTATIONS = 'ADD_PRESENTATIONS';
const UPDATE_PRESENTATION = 'ADD_PRESENTATION';
export const SET_CURRENT_PRESENTATION = 'SET_CURRENT_PRESENTATION';

// ------------------------------------
// Action Creators
// ------------------------------------
function getPresentationFile(resourceIdentifier = '') {
  return new Promise( (resolve, reject) => {
    fs.readFile(resourceIdentifier, (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch(parseErr) {
          reject(parseErr);
        }
      }
    });
  });
}

export function openPresentationFile(filePath) {
  return (dispatch, getState) => {
    getPresentationFile(filePath).then( (presentationData) => {
      dispatch(dmOpenSign(presentationData));
    }).catch( (err) => {
      console.log(err);
      debugger;
    });
  };
}

// ------------------------------------
// Actions
// ------------------------------------
export function addPresentation(presentation) {

  return {
    type: ADD_PRESENTATION,
    payload: presentation
  };
}

export function addPresentations(presentations) {

  return {
    type: ADD_PRESENTATIONS,
    payload: presentations
  };
}

function updatePresentation(presentation) {

  return {
    type: UPDATE_PRESENTATION,
    payload: presentation
  };

}
export function setCurrentPresentation(presentation) {

  return {
    type: SET_CURRENT_PRESENTATION,
    payload: presentation
  };
}


// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  presentationsByPath: {},
  currentPresentation: {}
};

export default function(state = initialState, action) {

  switch (action.type) {
    // currently these looks to be the same wrt to redux store
    case ADD_PRESENTATION:
    case UPDATE_PRESENTATION: {
      let newPresentationsByPath = Object.assign({}, state.presentationsByPath);
      newPresentationsByPath[action.payload.path] = action.payload;

      let newState = {
        presentationsByPath: newPresentationsByPath,
        currentPresentation: state.currentPresentation
      };

      return newState;
    }

    case ADD_PRESENTATIONS: {
      let newPresentationsByPath = Object.assign({}, state.presentationsByPath);

      action.payload.forEach( (presentation) => {
        newPresentationsByPath[presentation.path] = presentation;
      });

      let newState = {
        presentationsByPath: newPresentationsByPath,
        currentPresentation: state.currentPresentation
      };

      return newState;
    }

    case SET_CURRENT_PRESENTATION: {

      let newState = {
        presentationsByPath: state.presentationsByPath,
        currentPresentation: action.payload
      };

      return newState;
    }
  }

  return state;
}


