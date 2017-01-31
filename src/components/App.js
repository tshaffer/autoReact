// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import fs from 'fs';
import path from 'path';

import { openPresentationFile } from '../store/presentations';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      assetIndex: 0
    };
  }

  componentDidMount() {

    let self = this;

    console.log("app.js::componentDidMount invoked");

    console.log(__dirname);

    const dataPath = "/Users/tedshaffer/Documents/Projects/autoReact/data/";
    const autoplayPath = path.join(dataPath, "NT-Two.json");

    this.props.openPresentationFile(autoplayPath);
  }

  nextAsset() {

    const brightAuthor = this.props.presentations.autoplay.BrightAuthor;
    const zone = brightAuthor.zones[0];
    const playlist = zone.playlist;
    let { states } = playlist;

    let index = this.state.assetIndex;
    index++;
    if (index >= states.length) {
      index = 0;
    }
    this.setState( { assetIndex: index });

  }

  render() {

    console.log("app.js::render invoked");

    if (this.props.presentations && this.props.presentations.autoplay.BrightAuthor) {

      const brightAuthor = this.props.presentations.autoplay.BrightAuthor;
      const zone = brightAuthor.zones[0];

      const zoneX = zone.x;
      const zoneY = zone.y;
      const zoneWidth = zone.width;
      const zoneHeight = zone.height;

      let zoneDivStyle = {
        position: 'absolute',
        left: zoneX,
        top: zoneY,
        width: zoneWidth,
        height: zoneHeight,
        background: 'pink'
      };

      const playlist = zone.playlist;
      let { initialMediaStateId, initialMediaStateName, name, states, transitions } = playlist;

      const currentState = states[this.state.assetIndex];
      const filePath = currentState.imageItem.filePath;
      const imgSrc = "file://" + filePath;

      console.log('render bs screen (again?)');

      setTimeout(
        () => {
          this.nextAsset();
        },
        3000);

      return (
        <div id="zoneDiv" style={zoneDivStyle}>
          <img src={imgSrc} width={zoneWidth} height={zoneHeight} />
        </div>
      );
    }

    else {
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

export default connect(mapStateToProps, mapDispatchToProps)(App);
