// @flow

'use strict';

const path = require('path');
const fs = require('fs');
const readDir = require('recursive-readdir');

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



// LWS handlers

const targetFolder = '/Users/tedshaffer/Desktop/baconLWSTest';
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/SpecifyCardSizeLimits', (req, res) => {
  const limitStorageSpace = req.query.limitStorageSpace;
  console.log('SpecifyCardSizeLimits invoked');
  res.send('SpecifyCardSizeLimits');
});

const upload = multer({ dest: 'uploads/' });

app.post('/PrepareForTransfer', upload.array('files', 1), function (req, res) {

  console.log(req.body);
  console.log(req.files);

  const file = req.files[0];

  // let { destination, encoding, fieldname, filename, mimetype, originalname, path, size } = file;
  let path = file.path;

  // read xml file
  const filesToPublishXML = fs.readFileSync(path);

  // parseFileToPublish(req.body['nameParam1']).then( (filesToPublish : Array<Object>) => {
  //
  //   // let filesToCopy = freeSpaceOnDrive(filesToPublish);
  //   freeSpaceOnDrive(filesToPublish).then( (filesToCopy) => {
  //
  //     debugger;
  //     // let filesToCopy = {};
  //     filesToCopy.file = [];
  //
  //     filesToPublish.forEach( (fileToPublish) => {
  //       let fileToCopy = {};
  //       const filePath = fileToPublish.filePath[0];
  //       const fileName = fileToPublish.fileName[0];
  //       const hashValue = fileToPublish.hashValue[0];
  //       const fileSize = fileToPublish.fileSize[0];
  //
  //       fileToCopy = {
  //         filePath,
  //         fileName,
  //         hashValue,
  //         fileSize
  //       };
  //       filesToCopy.file.push(fileToCopy);
  //     });
  //
  //
  //     // convert to xml
  //     const filesToPublishXml = js2xmlparser('filesToCopy', filesToCopy);
  //
  //     res.send(filesToPublishXml);
  //     res.end("File is uploaded");
  //
  //   }).catch( (err) => {
  //     console.log(err);
  //     debugger;
  //   });
  // });

  // parseFileToPublish(req.body['nameParam1']).then( (filesToPublish) => {
  parseFileToPublish(filesToPublishXML).then( (filesToPublish) => {

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


// function getFiles(dir: string) : Array<string> {
//
//   return new Promise( (resolve, reject) => {
//
//     readDir(dir, (err, files) => {
//
//       if (err) {
//         reject(err);
//         return;
//       }
//
//       resolve(files);
//     });
//   });
// }


// function freeSpaceOnDrive(filesToPublish : Array<Object>) {
//
//   return new Promise( (resolve, reject) => {
//
//     // files that need to be copied by BrightAuthor
//     let filesToCopy = {};
//
//     // files that can be deleted to make room for more content
//     let deletionCandidates = {}
//
//   // ******** CHECK WHAT'S ACTUALLY GOING ON WITH A CURRENT AUTORUN
//     // create list of files already on the card in the pool folder
//     const poolPath = path.join(targetFolder, 'pool');
//     getFiles(poolPath).then( (listOfPoolFiles : Array<string>) => {
//
//       listOfPoolFiles.forEach( (file) => {
//         deletionCandidates[file] = file;  // TODO - maybe should be fileName (property), filePath (value)
//       });
//
//
//
//       // create the list of files that need to be copied.
//       // this is the list of files in filesToPublish that are not in listOfPoolFiles
//
// /*
//        ' determine total space required
//        totalSpaceRequired! = 0
//        for each fileXML in filesToPublish.file
//        fullFileName$ = fileXML.fullFileName.GetText()
//        o = deletionCandidates.Lookup(fullFileName$)
//        if not IsString(o) then		' file is not already on the card
//
//          fileItem = CreateObject("roAssociativeArray")
//          fileItem.fileName$ = fileXML.fileName.GetText()
//          fileItem.filePath$ = fileXML.filePath.GetText()
//          fileItem.hashValue$ = fileXML.hashValue.GetText()
//          fileItem.fileSize$ = fileXML.fileSize.GetText()
//
//          filesToCopy.AddReplace(fullFileName$, fileItem)		' files that need to be copied to the card
//
//          fileSize% = val(fileItem.fileSize$)
//          totalSpaceRequired! = totalSpaceRequired! + fileSize%
//
//        endif
//        next
//  */
//       let totalSpaceRequired = 0;
//       filesToPublish.forEach( (fileToPublish : Object) => {
//         // get full file name - what does that mean?
//         // see if this file is in deletionCandidates
//         // if not
//         //    create fileItem
//         //    add to filesToCopy
//         //    get fileSize and add to totalSpaceRequired.
//       });
//
//       debugger;
//
//     }).catch ( (err) => {
//       console.log(err);
//       debugger;
//     });
//   });
// }








// TODO - uploads limited to 50 MBytes
const uploadLarge = multer({ dest: 'uploads/', limits: { fieldSize : 50000000 } });
app.post('/UploadFile', uploadLarge.array('files', 1), function (req, res) {

  console.log(req.body);
  console.log(req.files);

  const file = req.files[0];

  // fields available in req.files from multer
  // let { destination, encoding, fieldname, filename, mimetype, originalname, path, size } = file;
  const uploadedFilePath = file.path;

  const destinationFilePath = req.headers['destination-filename'];
  const targetFilePath = getTargetPathFromDestinationFilePath(destinationFilePath, targetFolder);
  const fileName = req.headers['friendly-filename'];
  const filePath = path.join(targetFolder, targetFilePath);

  // move file from path to filePath
  var source = fs.createReadStream(uploadedFilePath);
  var dest = fs.createWriteStream(filePath);

  console.log('copying file from: ', uploadedFilePath, ' to: ', filePath);
  source.pipe(dest);
  source.on('end', () => {
    console.log('copy complete');
    // TODO - delete source?
  });

  source.on('error', function(err) {
    console.log('copy failed: ', err);
  });

  res.send('ok');
});

function str2ab(str) {
  console.log('create arrayBuffer with size: ', str.length);
  var buf = new ArrayBuffer(str.length);
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

export function writeFile(filePath: string, data: string) {
  return new Promise( (resolve, reject) => {
    fs.writeFile( filePath, data, (err) => {
      if (err) {
        reject(err);
      }
      else {
        resolve();
      }
    });
  });
}

app.post('/UploadSyncSpec', upload.array('files', 1), function (req, res) {
  
  console.log(req.body);
  console.log(req.files);

  const file = req.files[0];

  // let { destination, encoding, fieldname, filename, mimetype, originalname, path, size } = file;

  const newSyncSpec = fs.readFileSync(file.path);

  // convert to xml
  const newSyncSpecXml = js2xmlparser('sync', newSyncSpec);

  // get targetPath
  // TODO - where / how to save this. autoxml.brs saves in tmp
  const fileName = 'new-local-sync.xml';
  let filePath = path.join(targetFolder, fileName);

  fs.writeFileSync(filePath, newSyncSpecXml);

  res.send('ok');
});

const port = process.env.PORT || 8080;
app.listen(port);


function toBuffer(ab) {
  let buf = new Buffer(ab.byteLength);
  let view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}

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