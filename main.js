const path = require('path');
const fs = require('fs-extra');

const xml2js = require('xml2js');
const js2xmlparser = require('js2xmlparser2');

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

let appServer = express();
appServer.use(bodyParser.json());

console.log("hello autoReact");
const electron = require('electron');

// Module to control application life.
const {app} = electron;

// Module to create native browser window.
const {BrowserWindow} = electron;

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
  // Create the browser window.
  // win = new BrowserWindow({width: 1400, height: 800});
  win = new BrowserWindow({width: 1400, height: 1100});

  console.log("__dirname=", __dirname);

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
  app.quit();
}
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
  createWindow();
}
});

// LWS handlers

// FIXME - platform
// const targetFolder = '/Users/tedshaffer/Desktop/baconLWSTest';
const targetFolder = 'storage/sd';
appServer.use(bodyParser.urlencoded({ extended: false }));

appServer.get('/SpecifyCardSizeLimits', (_, res) => {
  // const limitStorageSpace = req.query.limitStorageSpace;
  console.log('SpecifyCardSizeLimits invoked');
  res.send('SpecifyCardSizeLimits');
});

// FIXME - platform
const upload = multer({ dest: 'storage/sd/uploads/' });
// const upload = multer({ dest: 'uploads/' });

appServer.post('/PrepareForTransfer', upload.array('files', 1), function (req, res) {

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
// FIXME - platform
// const uploadLarge = multer({ dest: 'uploads/', limits: { fieldSize : 50000000 } });
const uploadLarge = multer({ dest: 'storage/sd/uploads/', limits: { fieldSize : 50000000 } });
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

appServer.post('/UploadSyncSpec', upload.array('files', 1), function (req, res) {

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

