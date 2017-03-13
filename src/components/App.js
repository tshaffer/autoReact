// @flow

import { ipcRenderer } from 'electron';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { initStateMachine } from '../store/stateMachine';
import { restartPresentation } from '../store/stateMachine';

import Sign from './sign';

// HACK
let myApp = null;

class App extends Component {

  constructor(props: Object) {
    super(props);

    myApp = this;

    this.state = {
      // platform: 'brightsign'
      platform: 'desktop'
    };

    ipcRenderer.on('prepareForTransfer', (event, arg) => {
      console.log('ipcRender - event: ' + event);
      console.log('ipcRender - arg: ' + arg);
    });

    ipcRenderer.on('restartPresentation', (event, arg) => {

      console.log('ipcRender - restartPresentation received');

      let dataPath: string = '';
      if (myApp.state.platform === 'desktop') {
        dataPath = '/Users/tedshaffer/Desktop/baconTestCard';
      }
      else {
        dataPath = "/storage/sd";
      }

      myApp.props.restartPresentation(dataPath);
    });
  }

  state: Object;

  componentDidMount() {

    console.log("app.js::componentDidMount invoked");

    console.log('__dirname = ' + __dirname);

    let dataPath: string = '';
    if (this.state.platform === 'desktop') {
      dataPath = '/Users/tedshaffer/Desktop/baconTestCard';
    }
    else {
      dataPath = "/storage/sd";
    }

    this.props.initStateMachine(dataPath);
  }

  render() {

    if (this.props.bsdm.zones.allZones.length === 0) {
      return (
        <div>
          Waiting for for presentation to be loaded...
        </div>
      );
    }

    return (
      <Sign
        platform={this.state.platform}
        bsdm={this.props.bsdm}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  bsdm: state.bsdm,
});


const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    initStateMachine,
    restartPresentation,
  }, dispatch);
};

App.propTypes = {
  initStateMachine: React.PropTypes.func.isRequired,
  restartPresentation: React.PropTypes.func.isRequired,
  bsdm: React.PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
