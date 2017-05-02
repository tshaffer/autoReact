// @flow

import { connect } from 'react-redux';

import TickerZone from '../components/tickerZone';

function mapStateToProps (state, ownProps) {
  return {
    ...ownProps,
    dataFeeds: state.dataFeeds
  };
}

const TickerZoneContainer = connect(
  mapStateToProps,
)(TickerZone);

export default TickerZoneContainer;
