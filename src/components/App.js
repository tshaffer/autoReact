// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import path from 'path';

// import { openPresentationFile } from '../store/presentations';
import { openAndUpdatePresentationFile } from '../store/presentations';

import { incrementStateIndex } from '../store/autoplay';

import Sign from './sign';

class App extends Component {

  constructor(props: Object) {
    super(props);

    this.state = {
      // platform: 'brightsign'
      platform: 'desktop'
    };
  }

  state: Object;

  componentDidMount() {

    console.log("app.js::componentDidMount invoked");

    console.log('__dirname = ' + __dirname);

    let dataPath: string = '';
    if (this.state.platform === 'desktop') {
      dataPath = "/Users/tedshaffer/Documents/Projects/autoReact/data/";
    }
    else {
      dataPath = "/storage/sd";
    }

    const presentationFile: string = "VideoPlusImage-v3.bpf";
    const autoplayPath: string = path.join(dataPath, presentationFile);

    // this.props.openPresentationFile(autoplayPath);
    this.props.openAndUpdatePresentationFile(autoplayPath);
  }

  render() {

    // TODO - what else needs to be checked to ensure that a sign is loaded?
    if (!this.props.bsdm || this.props.bsdm.sign.properties.name === 'Untitled') {
      return (
        <div>
          Sign Pizza
        </div>
      );
    }

    // check to make sure the third zone has been added
    if (this.props.bsdm.zones.allZones.length < 3) {
      return (
        <div>
          Waiting for ticker zone...
        </div>
      );
    }

    if (this.props.bsdm.zones.zonesById[this.props.bsdm.zones.allZones[2]].initialMediaStateId === '0') {
      return (
        <div>
          Waiting for ticker zone initialMediaStateId...
        </div>
      );
    }

    return (
      <Sign
        platform={this.state.platform}
        bsdm={this.props.bsdm}
        incrementStateIndex={this.props.incrementStateIndex}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  bsdm: state.bsdm,
  presentations: state.presentations,
});


const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    openAndUpdatePresentationFile,
    incrementStateIndex,
  }, dispatch);
};

App.propTypes = {
  presentations: React.PropTypes.object.isRequired,
  // openPresentationFile: React.PropTypes.func.isRequired
  openAndUpdatePresentationFile: React.PropTypes.func.isRequired,
  bsdm: React.PropTypes.object.isRequired,
  incrementStateIndex: React.PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
