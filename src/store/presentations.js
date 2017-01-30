import fs from 'fs';

import {
  dmOpenSign,
} from '@brightsign/bsdatamodel';

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
