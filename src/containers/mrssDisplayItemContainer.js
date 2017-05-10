// @flow

import { connect } from 'react-redux';

import { getFeedDisplayItem } from '../store/feedDisplayItems';

import MrssDisplayItem from '../components/mrssDisplayItem';

function mapStateToProps (state, ownProps) {
  return {
    ...ownProps,
    displayItem : getFeedDisplayItem(state, ownProps.dataFeedId)
  };
}

const MrssDisplayItemContainer = connect(
  mapStateToProps,
)(MrssDisplayItem);

export default MrssDisplayItemContainer;

