// @flow

import React, { Component } from 'react';
import { HState } from '../hsm/HState';

import path from 'path';

export default class Image extends Component {

  constructor(props : Object) {
    super(props);
    this.constructHState( props.stateMachine, props.bsdmImageState.id);
    this.initHState(props.stateMachine, props.bsdm, props.bsdmImageState);

    this.timeout = null;
  }

  shouldComponentUpdate() {
    if (this.timeout) {
      return false;
    }
    return true;
  }

  initHState(stateMachine : Object, bsdm : Object, bsdmImageState : Object) {

    this.bsdm = bsdm;
    this.bsdmImageState = bsdmImageState;

    this.superState = stateMachine.stTop;

    this.HStateEventHandler = this.STDisplayingImageEventHandler;

  }

  superState : Object;
  HStateEventHandler : Function;
  nextState : Object;

  bsdm : Object;
  bsdmImageState : Object;
  timeout : ?number;

  setNextState( nextState : Object ) {
    this.nextState = nextState;
  }

  STDisplayingImageEventHandler(event : Object, stateData : Object) : string {

    stateData.nextState = null;

    if (event.EventType && event.EventType === 'ENTRY_SIGNAL') {
      console.log('entry signal');
      return 'HANDLED';
    }
    else if (event.EventType && event.EventType === 'EXIT_SIGNAL') {
      console.log('exit signal');
    }

    else if (event.EventType && event.EventType === 'timeoutEvent') {
      console.log('timeoutEvent');

      // const eventIds = dmGetEventIdsForMediaState( this.bsdm, { id : this.bsdmImageState.id });
      // const bsdmEvent = dmGetEventById( this.bsdm, { id : eventIds[0] } );
      if (event.EventType === 'timeoutEvent') {
        // const transitionIds = dmGetTransitionIdsForEvent( this.bsdm, { id : eventIds[0] });
        // const transition = dmGetTransitionById(this.bsdm, { id : transitionIds[0] } );
        // const targetMediaStateId = transition.targetMediaStateId;
        // const targetMediaState = dmGetMediaStateById(this.bsdm, { id : targetMediaStateId});

        stateData.nextState = this.nextState;
        return "TRANSITION";
      }
    }


    stateData.nextState = this.superState;
    return 'SUPER';
  }

  render () {

    let self = this;

    if (this.timeout) {
      debugger;
    }

    this.timeout = setTimeout( () => {
      this.timeout = null;
      self.props.onTimeout();
    }
      ,this.props.duration);

    const src = path.join('file://', this.props.poolFilePath);
    console.log('image.js::render, image src: ' + src);

    return (
      <img
        src={src}
        width={this.props.width.toString()}
        height={this.props.height.toString()}
      />
    );
  }
}

Image.propTypes = {
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  duration: React.PropTypes.number.isRequired,
  onTimeout: React.PropTypes.func.isRequired,
  resourceIdentifier: React.PropTypes.string,
  poolFilePath: React.PropTypes.string,
  stateMachine: React.PropTypes.object,
  bsdmImageState: React.PropTypes.object,
  bsdm: React.PropTypes.object,
};

Object.assign(Image.prototype, HState);
