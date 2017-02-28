// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import path from 'path';

// import {
//   dmGetZoneById,
// } from '@brightsign/bsdatamodel';


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

  // shouldComponentUpdate(nextProps, _) {
  //
  //   let currentDoneLoading = false;
  //   let nextDoneLoading = false;
  //
  //   nextProps.bsdm.zones.allZones.forEach( zoneId => {
  //     let zone = dmGetZoneById(nextProps.bsdm, { id: zoneId });
  //     if (zone.type === 5) {
  //       if (zone.initialMediaStateId && zone.initialMediaStateId !== '0')
  //       {
  //         nextDoneLoading = true;
  //       }
  //     }
  //   });
  //
  //   this.props.bsdm.zones.allZones.forEach( zoneId => {
  //     let zone = dmGetZoneById(this.props.bsdm, { id: zoneId });
  //     if (zone.type === 5) {
  //       if (zone.initialMediaStateId && zone.initialMediaStateId !== '0')
  //       {
  //         currentDoneLoading = true;
  //       }
  //     }
  //   });
  //
  //   if (nextDoneLoading && !currentDoneLoading) {
  //     return true;
  //   }
  //
  //   return false;
  // }

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

    if (!this.props.autoplayZones || this.props.autoplayZones.length === 0) {
      return (
        <div>
          Waiting for autoplay parsing...
        </div>
      );
    }

    return (
      <Sign
        platform={this.state.platform}
        bsdm={this.props.bsdm}
        autoplay={this.props.autoplay}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  bsdm: state.bsdm,
  presentations: state.presentations,
  autoplay: state.autoplay,
  autoplayZones: state.autoplay.zones,
});


const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    openAndUpdatePresentationFile,
  }, dispatch);
};

App.propTypes = {
  presentations: React.PropTypes.object.isRequired,
  // openPresentationFile: React.PropTypes.func.isRequired
  openAndUpdatePresentationFile: React.PropTypes.func.isRequired,
  bsdm: React.PropTypes.object.isRequired,
  autoplay: React.PropTypes.object.isRequired,
  autoplayZones: React.PropTypes.array.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
