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

// LWS code

// FIXME - platform
// const targetFolder = 'storage/sd';
// const upload = multer({ dest: 'storage/sd/uploads/' });
// const uploadLarge = multer({ dest: 'storage/sd/uploads/', limits: { fieldSize : 50000000 } });
const targetFolder = '/Users/tedshaffer/Desktop/baconTestCard';
const upload = multer({ dest: 'uploads/' });
const uploadLarge = multer({ dest: 'uploads/', limits: { fieldSize : 50000000 } });

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

  const newSyncSpecBuffer = fs.readFileSync(file.path);
  const newSyncSpecXML = decoder.write(newSyncSpecBuffer);

  const localSyncFilePath = path.join(targetFolder, 'local-sync.json');
  const localSyncSpecBuffer = fs.readFileSync(localSyncFilePath);
  const localSyncSpecStr = decoder.write(localSyncSpecBuffer);
  const localSyncSpec = JSON.parse(localSyncSpecStr);

  let parser = new xml2js.Parser();
  try {
    // parser.parseString(newSyncSpecXML, (err, bogusFormatNewSyncSpec) => {
    parser.parseString(newSyncSpecXML, (err, syncSpec) => {
      if (err) {
        console.log(err);
        debugger;
      }

      let newSyncSpec = {};

      newSyncSpec.meta = {};
      newSyncSpec.meta.client = {};

      let client = newSyncSpec.meta.client;
      let bogusClient = syncSpec.sync.meta[0].client[0];

      client.diagnosticLoggingEnabled = bogusClient.diagnosticLoggingEnabled[0];
      client.enableSerialDebugging = bogusClient.enableSerialDebugging[0];
      client.enableSystemDebugging = bogusClient.enableSystemDebugging[0];
      client.eventLoggingEnabled = bogusClient.eventLoggingEnabled[0];
      client.limitStorageSpace = bogusClient.limitStorageSpace[0];
      client.playbackLoggingEnabled = bogusClient.playbackLoggingEnabled[0];
      client.stateLoggingEnabled = bogusClient.stateLoggingEnabled[0];
      client.uploadLogFilesAtBoot = bogusClient.uploadLogFilesAtBoot[0];
      client.uploadLogFilesAtSpecificTime = bogusClient.uploadLogFilesAtSpecificTime[0];
      client.uploadLogFilesTime = bogusClient.uploadLogFilesTime[0];
      client.variableLoggingEnabled = bogusClient.variableLoggingEnabled[0];

      newSyncSpec.files = [];
      let bogusFiles = syncSpec.sync.files[0];

      let bogusDelete = bogusFiles.delete;
      let bogusDownload = bogusFiles.download;
      let bogusIgnore = bogusFiles.ignore;

      // TODO - newSyncSpec.delete
      // TODO - newSyncSpec.ignore

      bogusDownload.forEach( (download) => {

        let hash = {};
        hash['#'] =  download.hash[0]._;
        hash['@'] = {};
        hash['@'].method = download.hash[0].$.method;

        newSyncSpec.files.push( {
          group : download.group,
          hash,
          link : download.link[0],
          name : download.name[0],
          size : Number(download.size[0])
        });
      });


      let scriptFilesByName = {};

      localSyncSpec.files.forEach( (downloadFile) => {
        if (downloadFile.group && downloadFile.group === 'script') {
          scriptFilesByName[downloadFile.name] = downloadFile;
        }
      });

      newSyncSpec.files.forEach( (downloadFile) => {
        if (downloadFile.group && downloadFile.group === 'script') {
          const fileName = downloadFile.name;
          if (scriptFilesByName[fileName]) {
            const localSyncScriptFile = scriptFilesByName[fileName];
            // see if downloadFile is the same as localSyncScriptFile
            let { link, name } = localSyncScriptFile;
            if (downloadFile.link != link) {
              console.log('copy file to root folder: ', name);
            }
          }
        }
      });

      // as a final step, overwrite the current sync spec with the new sync spec
      fs.writeFileSync(localSyncFilePath, JSON.stringify(newSyncSpec, null, 2));
    });
  }
  catch (e) {
    console.log(e);
    debugger;
  }

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

