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

    let dataPath: string = '';
    if (this.state.platform === 'desktop') {
      dataPath = "/Users/tedshaffer/Documents/Projects/autoReact/data/";
    }
    else {
      dataPath = "/storage/sd";
    }

    const presentationFile: string = "VideoPlusImage-v2.bpf";
    // const presentationFile: string = "VideoPlusImage.bpf";
    // const presentationFile = "f0.bpf";
    const autoplayPath: string = path.join(dataPath, presentationFile);

    // this.props.openPresentationFile(autoplayPath);
    this.props.openAndUpdatePresentationFile(autoplayPath);
  }

  render() {

    console.log("render invoked");

    if (this.props.presentations && this.props.presentations.autoplay.BrightAuthor) {

      const brightAuthor: Object = this.props.presentations.autoplay.BrightAuthor;

      return (
        <Sign
          platform={this.state.platform}
          sign={brightAuthor}
        />
      );
    }
    else {

      return (
        <div>
          Sign Pizza
        </div>
      );
    }
  }
}

const mapStateToProps = (state) => ({
  bsdm: state.bsdm,
  presentations: state.presentations
});


const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    // openPresentationFile,
    openAndUpdatePresentationFile,
  }, dispatch);
};

App.propTypes = {
  presentations: React.PropTypes.object.isRequired,
  // openPresentationFile: React.PropTypes.func.isRequired
  openAndUpdatePresentationFile: React.PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
