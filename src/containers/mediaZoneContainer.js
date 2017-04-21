// @flow

import { connect } from 'react-redux';

import MediaZone from '../components/mediaZone';

import { getActiveMediaStateId } from '../store/activeMediaStates';

function mapStateToProps (state, ownProps) {
  return {
    ...ownProps,
    activeState: state.zone.activeState,
    activeMediaStateId: getActiveMediaStateId(state, ownProps.zone.id),

  };
}

const MediaZoneContainer = connect(
  mapStateToProps,
)(MediaZone);

export default MediaZoneContainer;

