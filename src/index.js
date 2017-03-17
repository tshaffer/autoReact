// @flow

'use strict';

import thunkMiddleware from 'redux-thunk';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { Router, hashHistory } from 'react-router';
import { Route } from 'react-router';
import injectTapEventPlugin from 'react-tap-event-plugin';

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


// LWS code
const path = require('path');
const fs = require('fs');
const readDir = require('recursive-readdir');

const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

const xml2js = require('xml2js');
const js2xmlparser = require('js2xmlparser2');

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

let appServer = express();
appServer.use(bodyParser.json());

console.log('Platform is: ', __PLATFORM__);

let targetFolder = '';
let upload;
let uploadLarge;

if (__PLATFORM__ == 'brightsign') {
  targetFolder = 'storage/sd';
  upload = multer({ dest: 'storage/sd/uploads/' });
  uploadLarge = multer({ dest: 'storage/sd/uploads/', limits: { fieldSize : 50000000 } });
}
else {
  targetFolder = '/Users/tedshaffer/Desktop/baconTestCard';
  upload = multer({ dest: 'uploads/' });
  uploadLarge = multer({ dest: 'uploads/', limits: { fieldSize : 50000000 } });
}

appServer.use(bodyParser.urlencoded({ extended: false }));

// LWS HANDLERS
appServer.get('/SpecifyCardSizeLimits', (_, res) => {
  // const limitStorageSpace = req.query.limitStorageSpace;
  console.log('SpecifyCardSizeLimits invoked');
  res.send('SpecifyCardSizeLimits');
});

appServer.post('/PrepareForTransfer', upload.array('files', 1), function (req, res) {

  console.log(req.body);
  console.log(req.files);

  const file = req.files[0];

  console.log('send ipc prepareForTransfer');
  win.webContents.send('prepareForTransfer', file.path);

  // let { destination, encoding, fieldname, filename, mimetype, originalname, path, size } = file;
  let path = file.path;

  // read xml file
  const filesToPublishXML = fs.readFileSync(path);

  parseFileToPublish(filesToPublishXML).then( (filesToPublish) => {

    freeSpaceOnDrive(filesToPublish).then( (missingFiles) => {

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

appServer.post('/UploadFile', uploadLarge.array('files', 1), function (req, res) {

  console.log(req.body);
  console.log(req.files);

  const file = req.files[0];

  // fields available in req.files from multer
  // let { destination, encoding, fieldname, filename, mimetype, originalname, path, size } = file;
  const uploadedFilePath = file.path;

  const destinationFilePath = req.headers['destination-filename'];

  getTargetPathFromDestinationFilePath(destinationFilePath, targetFolder).then( (targetFilePath) => {

    const filePath = path.join(targetFolder, targetFilePath);

    console.log('copying file from: ', uploadedFilePath, ' to: ', filePath);

    // move file from path to filePath
    let source = fs.createReadStream(uploadedFilePath);
    let dest = fs.createWriteStream(filePath);
    source.pipe(dest);
    source.on('end', () => {
      console.log('copy complete');
      // TODO - delete source?
    });

    source.on('error', function(err) {
      console.log('copy failed: ', err);
    });

    res.send('ok');

  }).catch( (err) => {
    console.log(err);
    debugger;
  });
});

appServer.post('/UploadSyncSpec', upload.array('files', 1), function (req, res) {

  console.log(req.body);
  console.log(req.files);

  const file = req.files[0];

  // let { destination, encoding, fieldname, filename, mimetype, originalname, path, size } = file;

  const localSyncFilePath = path.join(targetFolder, 'local-sync.json');
  const localSyncSpecBuffer = fs.readFileSync(localSyncFilePath);
  const localSyncSpecStr = decoder.write(localSyncSpecBuffer);
  const localSyncSpec = JSON.parse(localSyncSpecStr);

  const newSyncSpecBuffer = fs.readFileSync(file.path);
  const newSyncSpecStr = decoder.write(newSyncSpecBuffer);
  const newSyncSpec = JSON.parse(newSyncSpecStr);


  let scriptFilesByName = {};

  localSyncSpec.files.forEach((downloadFile) => {
    if (downloadFile.group && downloadFile.group === 'script') {
      scriptFilesByName[downloadFile.name] = downloadFile;
    }
  });

  newSyncSpec.files.forEach((downloadFile) => {
    if (downloadFile.group && downloadFile.group === 'script') {
      const fileName = downloadFile.name;
      if (scriptFilesByName[fileName]) {
        const localSyncScriptFile = scriptFilesByName[fileName];
        // see if downloadFile is the same as localSyncScriptFile
        let {link, name} = localSyncScriptFile;
        if (downloadFile.link != link) {
          console.log('copy file to root folder: ', name);
        }
      }
    }
  });

  // as a final step, overwrite the current sync spec with the new sync spec
  fs.writeFileSync(localSyncFilePath, JSON.stringify(newSyncSpec, null, 2));

  console.log('send ipc restartPresentation');
  win.webContents.send('restartPresentation');

  res.send('ok');
});

// UTILITIES
function getFiles(dir) {

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

function freeSpaceOnDrive(filesToPublish) {

  return new Promise( (resolve, reject) => {

    // files that need to be copied by BrightAuthor
    let filesToCopy = {};

    // files that can be deleted to make room for more content
    let deletionCandidates = {};

    // create list of files already on the card in the pool folder
    const poolPath = path.join(targetFolder, 'pool');
    getFiles(poolPath).then( (arrayOfPoolFiles) => {

      let listOfPoolFiles = {};
      arrayOfPoolFiles.forEach( (filePath) => {
        const fileName = path.basename(filePath);
        listOfPoolFiles[fileName] = filePath;
        deletionCandidates[fileName] = filePath;
      });

      // create the list of files that need to be copied.
      // this is the list of files in filesToPublish that are not in listOfPoolFiles
      let totalSpaceRequired = 0;
      filesToPublish.forEach( (fileToPublish) => {
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

function mkdirSync(path) {
  console.log('mkdirSync entry: ' + path);
  return new Promise((resolve, reject) => {
    try {
      fs.mkdirSync(path);
    } catch(e) {
      if ( e.code !== 'EEXIST' ) {
        reject(e);
      }
      else {
        console.log(path + ' already exists');
      }
    }
    console.log('mkdirSync exit: ', path);
    resolve();
  });
}

// TODO - uploads limited to 50 MBytes
function writeFile(filePath, data) {
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

function parseFileToPublish(filesToPublishXML) {

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

function getTargetPathFromDestinationFilePath(destinationFileName, rootDir) {

  return new Promise( (resolve, reject) => {

    const dir0 = destinationFileName.charAt(destinationFileName.length - 2);
    const dir1 = destinationFileName.charAt(destinationFileName.length - 1);

    const parts = destinationFileName.split("/");

    let dirName = path.join(rootDir, parts[0]);
    mkdirSync(dirName).then(() => {
      console.log('directory creation complete: ', dirName);
      dirName = path.join(dirName, dir0);
      return mkdirSync(dirName);
    }).then(() => {
      console.log('directory creation complete: ', dirName);
      dirName = path.join(dirName, dir1);
      return mkdirSync(dirName);
    }).then(() => {
      console.log('directory creation complete: ', dirName);
      const fileName = parts[1];
      resolve(path.join('pool/', dir0, dir1, fileName));
    }).catch((err) => {
      reject(err);
    });
  });
}

const port = process.env.PORT || 8080;
appServer.listen(port);

