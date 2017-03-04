// @flow

import { connect } from 'react-redux';

import Video from '../components/video';

import { getPoolFilePath } from '../store/stateMachine';

function mapStateToProps (state, ownProps) {
  return {
    ...ownProps,
    poolFilePath: getPoolFilePath(state, ownProps.resourceIdentifier),
  };
}

const VideoContainer = connect(
  mapStateToProps,
)(Video);

export default VideoContainer;

