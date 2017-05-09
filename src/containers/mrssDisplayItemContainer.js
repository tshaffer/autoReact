// @flow

import { connect } from 'react-redux';

import MrssDisplayItem from '../components/mrssDisplayItem';

function mapStateToProps (_, ownProps) {
  return {
    ...ownProps,
  };
}

const MrssDisplayItemContainer = connect(
  mapStateToProps,
)(MrssDisplayItem);

export default MrssDisplayItemContainer;

