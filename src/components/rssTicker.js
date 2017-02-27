// @flow

// http://docs.brightsign.biz/display/DOC/BSTicker

import React, { Component } from 'react';

const xml2js = require('xml2js');

export default class RSSTicker extends Component {

  componentWillMount() {

    fetch(this.props.feedUrl)
      .then( (response) => {
        let blobPromise = response.text();
        blobPromise.then( (content) => {
          let parser = new xml2js.Parser();
          try {
            parser.parseString(content, (err, jsonResponse) => {
              if (err) {
                console.log(err);
                debugger;
              }
              console.log(jsonResponse);
              // resolve(jsonResponse);
              this.parseRSS(jsonResponse);
            });
          }
          catch (e) {
            console.log(e);
            debugger;
          }
        });
      }).catch( (err) => {
        console.log(err);
        debugger;
      });
  }

  parseRSS(rssData : Object) {

    const rssChannel = rssData.rss.channel[0];
    // const rssTitle = rssChannel.title[0];
    // const rssUrl = rssChannel.link[0];
    // const lastBuildDate = rssChannel.lastBuildDate[0];
    // const description = rssChannel.description[0];
    const rssItemSpecs = rssChannel.item;
    let rssItems = rssItemSpecs.map( rssItemSpec => {
      return {
        description: rssItemSpec.description[0],
        title: rssItemSpec.title[0],
      };
    });

    this.populateTicker(rssItems);
  }

  populateTicker(rssItems : Array<Object>) {

    if (this.props.platform === 'brightsign') {
      // TODO - get location, dimensions from a prop
      const bsTicker = new BSTicker(0, 880, 1920, 200, 0);
      bsTicker.SetPixelsPerSecond(200);

      rssItems.forEach( rssItem => {
        bsTicker.AddString(rssItem.title);
      });
    }
  }

  render () {

    return (
      <div>Loading...</div>
    );
  }
}

RSSTicker.propTypes = {
  platform: React.PropTypes.string.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  feedUrl: React.PropTypes.string.isRequired
};
