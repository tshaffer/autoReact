// @flow

import { connect } from 'react-redux';

import Image from '../components/image';

import { getPoolFilePath } from '../store/stateMachine';

function mapStateToProps (state, ownProps) {
  return {
    ...ownProps,
    poolFilePath: getPoolFilePath(state, ownProps.resourceIdentifier),
  };
}

const ImageContainer = connect(
  mapStateToProps,
)(Image);

export default ImageContainer;

