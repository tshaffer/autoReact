// @flow

import { connect } from 'react-redux';

import Image from '../components/image';

function mapStateToProps (_, ownProps) {
  return {
    ...ownProps,
  };
}

const ImageContainer = connect(
  mapStateToProps,
)(Image);

export default ImageContainer;

