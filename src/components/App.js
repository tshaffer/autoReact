// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import path from 'path';

import { openPresentationFile } from '../store/presentations';

import Sign from './sign';

class App extends Component {

  componentDidMount() {

    console.log("app.js::componentDidMount invoked");

    // const dataPath = "";
    // const dataPath = "/storage/sd";
    const dataPath = "/Users/tedshaffer/Documents/Projects/autoReact/data/";

    // const autoplayPath = path.join(dataPath, "NT-Two.json");
    // const autoplayPath = path.join(dataPath, "VideoPlusImage.bpf");
    // const autoplayPath = path.join(dataPath, "f0.bpf");
    const autoplayPath = path.join(dataPath, "VideoPlusImage.bpf");

    this.props.openPresentationFile(autoplayPath);
  }

  render() {

    if (this.props.presentations && this.props.presentations.autoplay.BrightAuthor) {

      const brightAuthor = this.props.presentations.autoplay.BrightAuthor;

      return (
        <Sign
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
    openPresentationFile,
  }, dispatch);
};

App.propTypes = {
  presentations: React.PropTypes.object.isRequired,
  openPresentationFile: React.PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
