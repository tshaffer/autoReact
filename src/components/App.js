// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

// import path from 'path';
import { initStateMachine } from '../store/stateMachine';

// import { openPresentationFile } from '../store/presentations';

import Sign from './sign';

class App extends Component {

  constructor(props: Object) {
    super(props);

    this.state = {
      platform: 'brightsign'
      // platform: 'desktop'
    };
  }

  state: Object;

  componentDidMount() {

    console.log("app.js::componentDidMount invoked");

    console.log('__dirname = ' + __dirname);

    let dataPath: string = '';
    if (this.state.platform === 'desktop') {
      // dataPath = "/Users/tedshaffer/Documents/Projects/autoReact/data/";
      dataPath = '/Users/tedshaffer/Desktop/baconSD';
    }
    else {
      dataPath = "/storage/sd";
    }

    // const presentationFile: string = "VideoPlusImage-v3.bpf";
    // const autoplayPath: string = path.join(dataPath, presentationFile);
    //
    // this.props.openPresentationFile(autoplayPath);

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
    // openPresentationFile,
    initStateMachine,
  }, dispatch);
};

App.propTypes = {
  // openPresentationFile: React.PropTypes.func.isRequired,
  initStateMachine: React.PropTypes.func.isRequired,
  bsdm: React.PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
