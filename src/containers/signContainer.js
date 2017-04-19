// @flow

import { connect } from 'react-redux';

import Sign from '../components/sign';

function mapStateToProps (state, ownProps) {
  return {
    ...ownProps,
    zones : state.zones
  };
}

const SignContainer = connect(
  mapStateToProps,
)(Sign);

export default SignContainer;

