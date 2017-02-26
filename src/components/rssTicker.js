// @flow

// http://docs.brightsign.biz/display/DOC/BSTicker

import React, { Component } from 'react';

const xml2js = require('xml2js');

export default class RSSTicker extends Component {

  componentWillMount() {

    let self = this;

    console.log('RSSTicker::componentWillMount: ', this.props.feedUrl);

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
        })
      }).catch( (err) => {
      console.log(err);
      debugger;
    });
  }

  parseRSS(rssData) {

    // TODO - do this elsewhere
    if (this.props.platform === 'brightsign') {
      // TODO - get this from a prop
      const bsTicker = new BSTicker(0, 880, 1920, 200, 0);
      const speed = bsTicker.SetPixelsPerSecond(180);
      console.log('bsTicker speed: ' + speed);
      bsTicker.AddString("First line is a pizza");
      bsTicker.AddString("Second line is a milk shake");
      bsTicker.AddString("Third line is a sandwich");
    }
  }


  render () {

    let self = this;

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
