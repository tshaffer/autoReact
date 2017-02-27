// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import path from 'path';

import {
  // StringParameterType,
  // DataFeedTypeName,
  // dmGetDataFeedById,
  // dmGetMediaStateStateById,
  // ContentItemTypeName,
  // dmOpenSign,
  // dmAddHtmlSite,
  // dmCreateMediaContentItem,
  // dmCreateHtmlContentItem,
  // dmPlaylistAppendMediaState,
  // dmGetZoneMediaStateContainer,
  // dmGetHtmlSiteById,
  // dmCreateAbsoluteRect,
  // dmNewSign,
  // VideoMode,
  // PlayerModel,
  // dmAddZone,
  // ZoneType,
  // dmGetSignMetaData,
  // dmGetZonesForSign,
  dmGetZoneById,
  // dmMediaState,
  // dmGetMediaStateById,
  // dmGetZoneSimplePlaylist,
  // dmGetEventIdsForMediaState,
  // dmGetTransitionIdsForEvent,
  // dmGetTransitionById,
  // MediaType,
  // VideoModeName,
  // TransitionTypeName,
  // EventTypeName,
  // dmGetEventById,
  // GraphicsZOrderTypeName,
  // TouchCursorDisplayModeTypeName,
  // UdpAddressTypeName,
  // ZoneTypeCompactName,
  // ViewModeTypeName,
  // ImageModeTypeName,
  // AudioOutputSelectionTypeName,
  // AudioOutputSelectionSpecName,
  // AudioModeTypeName,
  // AudioModeSpecName,
  // AudioMappingTypeName,
  // AudioOutputNameString,
  // AudioOutputTypeName,
  // AudioMixModeTypeName,
  // DeviceWebPageDisplayName,
  // PlayerModelName,
  // MonitorOrientationTypeName,
  // VideoConnectorTypeName,
  // LiveVideoInputTypeName,
  // LiveVideoStandardTypeName,
  // ZoneTypeCompactName,
  // dmGetParameterizedStringFromString,
  // dmAddDataFeed,
  // DataFeedUsageType,
  // dmCreateDataFeedContentItem,
} from '@brightsign/bsdatamodel';



// import { openPresentationFile } from '../store/presentations';
import { openAndUpdatePresentationFile } from '../store/presentations';

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

    let currentDoneLoading = false;
    let nextDoneLoading = false;

    nextProps.bsdm.zones.allZones.forEach( zoneId => {
      let zone = dmGetZoneById(nextProps.bsdm, { id: zoneId });
      if (zone.type === 5) {
        if (zone.initialMediaStateId && zone.initialMediaStateId !== '0')
        {
          nextDoneLoading = true;
        }
      }
    });

    this.props.bsdm.zones.allZones.forEach( zoneId => {
      let zone = dmGetZoneById(this.props.bsdm, { id: zoneId });
      if (zone.type === 5) {
        if (zone.initialMediaStateId && zone.initialMediaStateId !== '0')
        {
          currentDoneLoading = true;
        }
      }
    });

    if (nextDoneLoading && !currentDoneLoading) {
      return true;
    }

    return false;

    // const existingSignName = this.props.bsdm.sign.properties.name;
    // const nextSignName = nextProps.bsdm.sign.properties.name;
    // // if (existingSignName !== nextSignName) {
    // //   return true;
    // // }
    //
    // if (nextProps.bsdm.zones.allZones.length === 3 && this.props.bsdm.zones.allZones.length === 2) {
    //   nextProps.bsdm.zones.allZones.forEach( zoneId => {
    //     let zone = dmGetZoneById(nextProps.bsdm, { id: zoneId });
    //     if (zone.type === 5) {
    //       tickerTypeZone = true;
    //     }
    //   });
    //   console.log('App.js::shouldComponentUpdate, existingSignName: ', this.props.bsdm.sign.properties.name);
    //   return true;
    // }
    //
    // return false;
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
