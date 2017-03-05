// @flow

'use strict';

const path = require('path');
const fs = require('fs');

import thunkMiddleware from 'redux-thunk';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { Router, hashHistory } from 'react-router';
import { Route } from 'react-router';
import injectTapEventPlugin from 'react-tap-event-plugin';

const xml2js = require('xml2js');
const js2xmlparser = require('js2xmlparser2');

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

let app = express();
app.use(bodyParser.json());

import reducers from './store/reducers';

import App from './components/App';

const store = createStore(
  reducers,
  applyMiddleware(
    thunkMiddleware
  )
);

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

ReactDOM.render(
  <Provider store={store}>
    <Router history={hashHistory}>
      <Route path="/" component={App} />
    </Router>
  </Provider>
  , document.getElementById('content'));

app.use(bodyParser.urlencoded({ extended: false }));

// app.get('/getEncoders', function(req, res) {
//   console.log("getEncoders invoked");
//   res.set('Access-Control-Allow-Origin', '*');
//   res.send(brightSignEncoders);
// });
app.get('/getPizza', (_, res) => {
  console.log('getPizza invoked');
  res.send('ok');
});

app.get('/SpecifyCardSizeLimits', (req, res) => {
  const limitStorageSpace = req.query.limitStorageSpace;
  console.log('SpecifyCardSizeLimits invoked');
  res.send('SpecifyCardSizeLimits');
});

// app.post('/PrepareForTransfer', (_, res) => {
//   debugger;
//   console.log('PrepareForTransfer invoked');
//   res.send('ok');
// });

app.post('/UploadSyncSpec', (_, res) => {
  debugger;
  console.log('UploadSyncSpec invoked');
  res.send('ok');
});

const port = process.env.PORT || 8080;
app.listen(port);


//     console.log(req.body); //form fields
//     /* example output:
//      { title: 'abc' }
//      */
//     console.log(req.file); //form files
//     /* example output:
//      { fieldname: 'upl',
//      originalname: 'grumpy.png',
//      encoding: '7bit',
//      mimetype: 'image/png',
//      destination: './uploads/',
//      filename: '436ec561793aa4dc475a88e84776b1b9',
//      path: 'uploads/436ec561793aa4dc475a88e84776b1b9',
//      size: 277056 }
//      */
//     res.status(204).end();

// app.post('/PrepareForTransfer',function(req,res){
//   upload(req,res,function(err) {
//     console.log(req.body);
//     console.log(req.files);
//     if(err) {
//       return res.end("Error uploading file.");
//     }
//     res.end("File is uploaded");
//   });
// });
// const upload = multer({ dest: 'uploads/' }).single('nameParam1');
const upload = multer({ dest: 'uploads/' });

app.post('/PrepareForTransfer', upload.single('nameParam1'), function (req, res) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  console.log(req.body);
  console.log(req.files);
  // if(err) {
  //   return res.end("Error uploading file.");
  // }
  // res.end("File is uploaded");

  // data is in req.body['nameParam1']

  parseFileToPublish(req.body['nameParam1']).then( (filesToPublish) => {

    let filesToCopy = {};
    filesToCopy.file = [];

    filesToPublish.forEach( (fileToPublish) => {
      let fileToCopy = {};
      const filePath = fileToPublish.filePath[0];
      const fileName = fileToPublish.fileName[0];
      const hashValue = fileToPublish.hashValue[0];
      const fileSize = fileToPublish.fileSize[0];

      fileToCopy = {
        filePath,
        fileName,
        hashValue,
        fileSize
      };
      filesToCopy.file.push(fileToCopy);
    });

    // convert to xml
    const filesToPublishXml = js2xmlparser('filesToCopy', filesToCopy);

    res.send(filesToPublishXml);
    res.end("File is uploaded");

  }).catch( (err) => {
    console.log(err);
    debugger;
  });
});

/*
https://www.npmjs.com/package/multer
multer
limits
fieldSize	Max field value size	1MB

https://github.com/mscdex/busboy#busboy-methods
  limits - object - Various limits on incoming data. Valid properties are:
  fieldSize - integer - Max field value size (in bytes) (Default: 1MB).
*/
// TODO - uploads limited to 50 MBytes
const uploadLarge = multer({ dest: 'uploads/', limits: { fieldSize : 50000000 } });
app.post('/UploadFile', uploadLarge.single('nameParam1'), function (req, res) {

  console.log(req.headers);

  const destinationFilePath = req.headers['destination-filename'];
  const fileName = req.headers['friendly-filename'];

  console.log('save file: ', fileName, ' to: ', destinationFilePath);

  const dataPath = '/Users/tedshaffer/Desktop/baconLWSTest';

  // TODO - convert destinationFilePath to proper target path.
  // TODO - see FilePosted in autoxml.brs

  const filePath = path.join(dataPath, destinationFilePath);
  const fileContents = req.body['nameParam1'];
  fs.writeFileSync(filePath, fileContents);

  res.send('ok');
});


function parseFileToPublish(filesToPublishXML : string) {

  return new Promise( (resolve, reject) => {

    let parser = new xml2js.Parser();
    try {
      parser.parseString(filesToPublishXML, (err, filesToPublish) => {
        if (err) {
          console.log(err);
          debugger;
        }
        console.log(filesToPublish.files.file);
        resolve(filesToPublish.files.file);
      });
    }
    catch (e) {
      console.log(e);
      reject();
    }
  });
}

