// @flow

import { connect } from 'react-redux';

import { getMrssDataFeedItem } from '../store/mrssDataFeedItems';

import MrssDisplayItem from '../components/mrssDisplayItem';

function mapStateToProps (state, ownProps) {
  return {
    ...ownProps,
    mrssDataFeedItem : getMrssDataFeedItem(state, ownProps.dataFeedId)
  };
}

const MrssDisplayItemContainer = connect(
  mapStateToProps,
)(MrssDisplayItem);

export default MrssDisplayItemContainer;

