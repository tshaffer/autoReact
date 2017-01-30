// @flow

import fs from 'fs';
import path from 'path';

import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

export default class App extends Component {

  componentDidMount() {
    console.log("app.js::componentDidMount invoked");

    console.log(__dirname);

    const dataPath = "/Users/tedshaffer/Documents/Projects/autoReact/data/";
    const autoplayPath = path.join(dataPath, "autoplay.json");
    const localSyncPath = path.join(dataPath, "local-sync.json");

    fs.readFile(autoplayPath, { encoding: 'utf8' }, (err, data) => {
      const autoplay = JSON.parse(data);

      fs.readFile(localSyncPath,  { encoding: 'utf8' }, (err, data) => {
        const localSync = JSON.parse(data);
      })
    });

  }

  render() {

    console.log("app.js::render invoked");

    return (
      <MuiThemeProvider>
        <div>
          <p className="autorunText">Pizza</p>
          <p className="autorunText">Line 2</p>
          <p className="autorunText">Line 3</p>
        </div>
      </MuiThemeProvider>
    );
  }
}
