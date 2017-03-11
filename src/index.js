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

// FIXME - platform
// const targetFolder = '/Users/tedshaffer/Desktop/baconLWSTest';
const targetFolder = 'storage/sd';
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/SpecifyCardSizeLimits', (_, res) => {
  // const limitStorageSpace = req.query.limitStorageSpace;
  console.log('SpecifyCardSizeLimits invoked');
  res.send('SpecifyCardSizeLimits');
});

// FIXME - platform
const upload = multer({ dest: 'storage/sd/uploads/' });
// const upload = multer({ dest: 'uploads/' });

app.post('/PrepareForTransfer', upload.array('files', 1), function (req, res) {

  console.log(req.body);
  console.log(req.files);

  const file = req.files[0];

  // let { destination, encoding, fieldname, filename, mimetype, originalname, path, size } = file;
  let path = file.path;

  // read xml file
  const filesToPublishXML = fs.readFileSync(path);

  parseFileToPublish(filesToPublishXML).then( (filesToPublish : Array<Object>) => {

    freeSpaceOnDrive(filesToPublish).then( (missingFiles : Object) => {

      let requiredFiles = {};
      requiredFiles.file = [];

      for (let fileProperty in missingFiles) {

        if (missingFiles.hasOwnProperty(fileProperty)) {

          const missingFile = missingFiles[fileProperty];
          let requiredFile = {
            filePath: missingFile.filePath,
            fileName: missingFile.fileName,
            hashValue: missingFile.hashValue,
            fileSize: missingFile.fileSize
          };
          requiredFiles.file.push(requiredFile);
        }
      }

      // convert to xml
      const filesToPublishXml = js2xmlparser('filesToCopy', requiredFiles);

      res.send(filesToPublishXml);
      res.end('File is uploaded');
    });
  }).catch( (err) => {
    console.log(err);
    debugger;
  });
});


function getFiles(dir: string) {

  return new Promise( (resolve, reject) => {

    readDir(dir, (err, files) => {

      if (err) {
        reject(err);
        return;
      }

      resolve(files);
    });
  });
}


function freeSpaceOnDrive(filesToPublish : Array<Object>) {

  return new Promise( (resolve, reject) => {

    // files that need to be copied by BrightAuthor
    let filesToCopy = {};

    // files that can be deleted to make room for more content
    let deletionCandidates = {};

    // create list of files already on the card in the pool folder
    const poolPath = path.join(targetFolder, 'pool');
    getFiles(poolPath).then( (arrayOfPoolFiles : Array<string>) => {

      let listOfPoolFiles = {};
      arrayOfPoolFiles.forEach( (filePath) => {
        const fileName = path.basename(filePath);
        listOfPoolFiles[fileName] = filePath;
        deletionCandidates[fileName] = filePath;
      });

      // create the list of files that need to be copied.
      // this is the list of files in filesToPublish that are not in listOfPoolFiles
      let totalSpaceRequired = 0;
      filesToPublish.forEach( (fileToPublish : Object) => {
        const fullFileName = fileToPublish.fullFileName;
        if (!deletionCandidates[fullFileName]) {
          let fileItem = {};
          fileItem.fileName = fileToPublish.fileName[0];
          fileItem.filePath = fileToPublish.filePath[0];
          fileItem.hashValue = fileToPublish.hashValue[0];
          fileItem.fileSize = fileToPublish.fileSize[0];

          filesToCopy[fullFileName] = fileItem;

          totalSpaceRequired += Number(fileItem.fileSize);
        }
      });

/*
 https://www.npmjs.com/package/nodejs-disks
 ' determine if additional space is required
  du = CreateObject("roStorageInfo", "./")
  freeInMegabytes! = du.GetFreeInMegabytes()
  totalFreeSpace! = freeInMegabytes! * 1048576

  if m.limitStorageSpace.....


  deleteUnneededFiles = false
  if totalFreeSpace! < totalSpaceRequired! then
    deleteUnneededFiles = true
  endif
  if m.limitStorageSpace then
    if totalSizeOfPoolAfterCopy! > budgetedMaximumPoolSize then
      deleteUnneededFiles = true
    endif
  endif

 */

      resolve(filesToCopy);
    }).catch ( (err) => {
      reject(err);
    });
  });
}

// TODO - uploads limited to 50 MBytes
// FIXME - platform
// const uploadLarge = multer({ dest: 'uploads/', limits: { fieldSize : 50000000 } });
const uploadLarge = multer({ dest: 'storage/sd/uploads/', limits: { fieldSize : 50000000 } });
app.post('/UploadFile', uploadLarge.array('files', 1), function (req, res) {

  console.log(req.body);
  console.log(req.files);

  const file = req.files[0];

  // fields available in req.files from multer
  // let { destination, encoding, fieldname, filename, mimetype, originalname, path, size } = file;
  const uploadedFilePath = file.path;

  const destinationFilePath = req.headers['destination-filename'];
  const targetFilePath = getTargetPathFromDestinationFilePath(destinationFilePath, targetFolder);
  // const fileName = req.headers['friendly-filename'];
  const filePath = path.join(targetFolder, targetFilePath);

  // move file from path to filePath
  var source = fs.createReadStream(uploadedFilePath);
  var dest = fs.createWriteStream(filePath);

  console.log('targetFilePath: ', targetFilePath);
  console.log('file[filename]: ', file.filename);
  console.log('file[originalname]: ', file.originalname);

  const parts = targetFilePath.split('/');
  if (parts.length === 4 && parts[0] === 'pool' && parts[3].startsWith('sha1')) {

    let dirName = '';

    dirName = 'storage/sd/pool/' + parts[1];
    console.log('create pool directory: ' + dirName);

    try {
      fs.mkdirSync(dirName);
    }
    catch (e) {
      console.log(e);
    }

    dirName = dirName + '/' + parts[2];
    console.log('create pool directory: ' + dirName);
    try {
      fs.mkdirSync(dirName);
    }
    catch (e) {
      console.log(e);
    }
  }

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

// function str2ab(str) {
//   console.log('create arrayBuffer with size: ', str.length);
//   var buf = new ArrayBuffer(str.length);
//   var bufView = new Uint8Array(buf);
//   for (var i=0, strLen=str.length; i<strLen; i++) {
//     bufView[i] = str.charCodeAt(i);
//   }
//   return buf;
// }

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
  const fileName = 'new-sync.xml';
  let filePath = path.join(targetFolder, fileName);

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
  console.log('Do not mkdir in case running on a BrightSign');
  // if (!fs.existsSync(dir)){
  //   fs.mkdirSync(dir);
  // }
}