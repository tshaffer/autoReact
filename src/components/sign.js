// @flow

import React, { Component } from 'react';

import Zone from './zone';

export default class Sign extends Component {

  render () {

    const zone: Object = this.props.sign.zones[0];

    return (
      <div>
        <Zone
          platform={this.props.platform}
          playlist={zone.playlist}
          x={Number(zone.x)}
          y={Number(zone.y)}
          width={Number(zone.width)}
          height={Number(zone.height)}
        />
      </div>
    );

    // background={'pink'}

  }
}

Sign.propTypes = {
  sign: React.PropTypes.object.isRequired,
  platform: React.PropTypes.string.isRequired
};
