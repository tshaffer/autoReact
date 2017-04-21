// @flow

import { connect } from 'react-redux';

import Sign from '../components/sign';

function mapStateToProps (_, ownProps) {
  return {
    ...ownProps,
  };
}

const SignContainer = connect(
  mapStateToProps,
)(Sign);

export default SignContainer;

