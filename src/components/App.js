// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import fs from 'fs';
import path from 'path';

import { openPresentationFile } from '../store/presentations';

class App extends Component {

  componentDidMount() {

    let self = this;
    ''
    console.log("app.js::componentDidMount invoked");

    console.log(__dirname);

    const dataPath = "/Users/tedshaffer/Documents/Projects/autoReact/data/";
    const autoplayPath = path.join(dataPath, "NT-Two.json");

    this.props.openPresentationFile(autoplayPath);


    // const localSyncPath = path.join(dataPath, "local-sync.json");
    //
    // fs.readFile(autoplayPath, { encoding: 'utf8' }, (err, data) => {
    //   const autoplay = JSON.parse(data);
    //
    //   fs.readFile(localSyncPath,  { encoding: 'utf8' }, (err, data) => {
    //     const localSync = JSON.parse(data)
    //
    //     self.props.openPresentationFile(autoplayPath);
    //   })
    // });

  }

  render() {

    console.log("app.js::render invoked");

    if (this.props.bsdm) {
      debugger;
    }

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

const mapStateToProps = (state) => ({
  bsdm: state.bsdm,
});


const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    openPresentationFile,
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
