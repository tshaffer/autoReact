// @flow

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import MediaZone from '../components/mediaZone';

import { getActiveMediaStateId } from '../store/activeMediaStates';

import { bsp } from '../app/bsp';

export function postBSPMessage(event : Object) {
  return bsp.postMessage(event);
}

function mapStateToProps (state, ownProps) {
  return {
    ...ownProps,
    activeMediaStateId: getActiveMediaStateId(state, ownProps.zone.id),
  };
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    postBSPMessage,
  }, dispatch);
};


const MediaZoneContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MediaZone);

export default MediaZoneContainer;

