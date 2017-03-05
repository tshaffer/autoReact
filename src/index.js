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

  console.log(req.body);
  console.log(req.files);

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

// TODO - uploads limited to 50 MBytes
const uploadLarge = multer({ dest: 'uploads/', limits: { fieldSize : 50000000 } });
app.post('/UploadFile', uploadLarge.single('nameParam1'), function (req, res) {

  console.log(req.headers);

  const dataPath = '/Users/tedshaffer/Desktop/baconLWSTest';

  const destinationFilePath = req.headers['destination-filename'];
  const targetFilePath = getTargetPathFromDestinationFilePath(destinationFilePath, dataPath);
  const fileName = req.headers['friendly-filename'];

  console.log('save file: ', fileName, ' to: ', targetFilePath);

  const filePath = path.join(dataPath, targetFilePath);
  const fileContents = req.body['nameParam1'];

  fs.writeFileSync(filePath, fileContents);
  res.send('ok');

// BACon
// firmwareService.js::getFWManifestData, but it retrieves the data as a blob using fetch
//   if (fileName === 'IMG_7093.JPG') {
//
// /*
//
//  https://developer.mozilla.org/en-US/docs/Web/API/FileReader#readAsArrayBuffer()
//
//  */
//     // debugger;
//     //
//     // let bytes = new Uint8Array(fileContents.length);
//     // for (let i=0; i<fileContents.length; i++) {
//     //   bytes[i] = fileContents.charCodeAt(i);
//     // }
//     //
//     // debugger;
//     // let reader = new FileReader();
//     // reader.addEventListener('loadend', function () {
//     //   const buf = toBuffer(reader.result);
//     //   debugger;
//     // });
//     // reader.readAsArrayBuffer(fileContents);
//     //
//     // return;
//
//     // let wstream = fs.createWriteStream(filePath);
//     // wstream.on('finish', function () {
//     //   console.log('file has been written');
//     //   res.send('ok');
//     //
//     //
//     //
//     // });
//     // wstream.write(fileContents);
//     // wstream.end();
//     //
//     // const buf = toBuffer(fileContents);
//     // console.log(buf);
//     // console.log(typeof buf);
//
//
//
//
//   }
//   else if (fileName === 'IMG_7094.JPG') {
//     console.log('skip other jpeg file');
//     res.send('ok');
//   }
//   else if (fileName.toLowerCase() === '0arc.mp4') {
//     console.log('skip other jpeg file');
//     res.send('ok');
//   }
//   else {
//     fs.writeFileSync(filePath, fileContents);
//     res.send('ok');
//   }

});

app.post('/UploadSyncSpec', upload.single('syncSpecPosted'), (req, res) => {

  const dataPath = '/Users/tedshaffer/Desktop/baconLWSTest';

  console.log(req.body);
  console.log(req.files);

  // retrieve sync spec from request body
  const newSyncSpec : string = req.body['nameParam1'];

  // convert to xml
  const newSyncSpecXml = js2xmlparser('sync', newSyncSpec);

  // get targetPath
  // TODO - where / how to save this. autoxml.brs saves in tmp
  const fileName = 'new-local-sync.xml';
  let filePath = path.join(dataPath, fileName);

  fs.writeFileSync(filePath, newSyncSpecXml);

  res.send('ok');
});

const port = process.env.PORT || 8080;
app.listen(port);


// function toBuffer(ab) {
//   let buf = new Buffer(ab.byteLength);
//   let view = new Uint8Array(ab);
//   for (let i = 0; i < buf.length; ++i) {
//     buf[i] = view[i];
//   }
//   return buf;
// }

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

function getTargetPathFromDestinationFilePath(destinationFileName : string, rootDir : string) {

  const dir0 = destinationFileName.charAt(destinationFileName.length - 2);
  const dir1 = destinationFileName.charAt(destinationFileName.length - 1);

  const parts = destinationFileName.split("/");

  // create directories if they do not exist
  // TODO - don't use synchronous calls
  let dirName = path.join(rootDir, parts[0]);
  createDir(dirName);
  dirName = path.join(dirName, dir0);
  createDir(dirName);
  dirName = path.join(dirName, dir1);
  createDir(dirName);

  const fileName = parts[1];

  return path.join('pool/', dir0, dir1, fileName);
}

function createDir(dir : string) {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
}