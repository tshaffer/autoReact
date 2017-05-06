// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import PlatformService from '../platform';

import { setPlaybackState } from '../store/stateMachine';
// import { postMessage } from '../store/stateMachine';

// import Sign from '../components/sign';

// HACK
export let myApp = {};

class App extends Component {

  constructor(props: Object) {
    super(props);

    myApp = this;
  }

  state: Object;

  componentDidMount() {

    console.log("app.js::componentDidMount invoked, PlatformService: ");
    console.log(PlatformService);
  }

  // restartPresentation() {
  //
  //   console.log('ipcRender - restartPresentation received');
  //
  //   this.props.setPlaybackState('inactive');
  //
  //   console.log('start restartPresentation timeout');
  //   setTimeout( () => {
  //     console.log('timeout occurred');
  //     this.props.setPlaybackState('active');
  //   }, 100);
  //
  //   const rootPath: string = PlatformService.default.getRootDirectory();
  //   const pathToPool: string = PlatformService.default.getPathToPool();
  //
  //   this.props.restartPresentation(rootPath, pathToPool);
  // }
  //
  render() {

    return (
      <div>
        Building presentation ...
      </div>
    );

    // if (this.props.bsdm.zones.allZones.length === 0 ||
    //   Object.keys(this.props.activeMediaStates.activeMediaStateByZone).length === 0) {
    //   return (
    //     <div>
    //       Waiting for for presentation to be loaded...
    //     </div>
    //   );
    // }
    //
    // // postMessage={this.props.postMessage}
    // return (
    //   <Sign
    //     bsdm={this.props.bsdm}
    //     playbackState={this.props.playbackState}
    //   />
    // );
  }
}

const mapStateToProps = (state) => ({
  bsdm: state.bsdm,
  playbackState: state.stateMachine.playbackState,
  activeMediaStates : state.activeMediaStates
});


const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    // initBSP,
    // restartPresentation,
    setPlaybackState,
    // postMessage,
  }, dispatch);
};

App.propTypes = {
  playbackState: React.PropTypes.string.isRequired,
  // initBSP: React.PropTypes.func.isRequired,
  setPlaybackState: React.PropTypes.func.isRequired,
  // restartPresentation: React.PropTypes.func.isRequired,
  // postMessage: React.PropTypes.func.isRequired,
  bsdm: React.PropTypes.object.isRequired,
  activeMediaStates: React.PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
