// @flow

import { connect } from 'react-redux';

import MediaZone from '../components/mediaZone';

function mapStateToProps (state, ownProps) {
  return {
    ...ownProps,
    activeState: state.zone.activeState,
  };
}

const MediaZoneContainer = connect(
  mapStateToProps,
)(MediaZone);

export default MediaZoneContainer;

