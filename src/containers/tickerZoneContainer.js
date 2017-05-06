// @flow

import { connect } from 'react-redux';

import TickerZone from '../components/tickerZone';

import {
  ContentItemType
} from '@brightsign/bscore';

import {
  dmGetMediaStateIdsForZone,
  dmGetMediaStateById,
} from '@brightsign/bsdatamodel';

import {
  DataFeed
} from '../entities/dataFeed';

function mapStateToProps (state, ownProps) {
  return {
    ...ownProps,
    dataFeeds: state.dataFeeds,
    articles : getArticles(state, ownProps.zone.id)
  };
}
export const getArticles = (state : Object, zoneId : string) : Array<string> => {

  let articles : Array<string> = [];

  const mediaStateIds = dmGetMediaStateIdsForZone(state.bsdm, { id: zoneId});

  mediaStateIds.forEach( (mediaStateId) => {

    const mediaState = dmGetMediaStateById(state.bsdm, { id : mediaStateId} );
    console.log(mediaState);
    if (mediaState.contentItem.type === ContentItemType.DataFeed) {

      const dataFeedId = mediaState.contentItem.dataFeedId;

      if (state.dataFeeds.dataFeedsById.hasOwnProperty(dataFeedId)) {
        const dataFeed : DataFeed = state.dataFeeds.dataFeedsById[dataFeedId];
        dataFeed.rssItems.forEach( (rssItem) => {
          articles.push(rssItem.title);
        });
      }
    }
  });

  return articles;

};


const TickerZoneContainer = connect(
  mapStateToProps,
)(TickerZone);

export default TickerZoneContainer;
