// @flow

import React, { Component } from 'react';

import Zone from './zone';

export default class Sign extends Component {

  render () {

    const zones = this.props.sign.zones;

    return (
      <div>
        {
          zones.map( (zone, index) =>
            <div
              key={index}
              style={
              {
                position: 'absolute',
                left: zone.position.x,
                top: zone.position.y,
                width: zone.position.width,
                height: zone.position.height
              }
              }
            >
              <Zone
                platform={this.props.platform}
                playlist={zone.playlist}
                width={Number(zone.position.width)}
                height={Number(zone.position.height)}
              />
            </div>
          )
        }
      </div>
    );
  }
}

Sign.propTypes = {
  sign: React.PropTypes.object.isRequired,
  platform: React.PropTypes.string.isRequired
};
