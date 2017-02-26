// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import path from 'path';

// import { openPresentationFile } from '../store/presentations';
import { openAndUpdatePresentationFile } from '../store/presentations';

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

  shouldComponentUpdate(nextProps, nextState) {

    const existingSignName = this.props.bsdm.sign.properties.name;
    const nextSignName = nextProps.bsdm.sign.properties.name;
    if (existingSignName !== nextSignName) {
      return true;
    }
    return false;
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
  presentations: state.presentations
});


const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    openAndUpdatePresentationFile,
  }, dispatch);
};

App.propTypes = {
  presentations: React.PropTypes.object.isRequired,
  // openPresentationFile: React.PropTypes.func.isRequired
  openAndUpdatePresentationFile: React.PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
