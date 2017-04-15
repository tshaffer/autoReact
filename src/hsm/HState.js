export const HState = {

  constructHState(obj, id) {
    this.topState = null;

    this.HStateEventHandler = null;                                             // filled in by HState instance

    this.stateMachine = obj;

    this.superState = null;                                                     // filled in by HState instance
    this.id = id;
  }

};
