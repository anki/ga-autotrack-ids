import provide from '../provide';
import {uuid} from '../utilities';


/**
 * Class for the `SessionIdTracker` analytics.js plugin.
 * @implements {SessionIdTrackerPublicInterface}
 */
class SessionIdTracker {
  /**
   * Registers Session ID tracking on a tracker object. This plugin registers
   * a function which sets a chosen Custom Dimension with an uuid value when
   * it's required. Although the dimension will be set at every page load,
   * given that the dimension configured by the user is session-scoped, GA will
   * report the last value set for all hits within a session.
   * @param {!Tracker} tracker Passed internally by analytics.js
   * @param {?SessionIdTrackerOpts} opts Passed by the require command.
   */
  constructor(tracker, opts) {
    // Opts validation.
    if (typeof opts.customDimensionIndex !== 'number'
      && !SessionIdTracker.validateCustomSessionOpts(opts)) {
      throw new Error(`The SessionIdTracker plugin requires a
        customDimensionIndex to store the auto generated uuid value in
        or a customSession object with customDimensionIndex number and
        id string. You can use both. Please provide the options when requiring
        the plugin.`);
    }

    this.tracker = tracker;
    this.opts = opts;

    if (typeof opts.customDimensionIndex === 'number') {
      tracker.set('dimension' + opts.customDimensionIndex, uuid());
    }

    if (SessionIdTracker.validateCustomSessionOpts(opts)) {
      tracker.set(
        'dimension' + opts.customSession.customDimensionIndex,
        opts.customSession.id
      );
    }
  }

  /**
   * Validates the type of the id property passed in opts.
   * @param  {!SessionIdTrackerOpts} opts Passed by the require command.
   * @return {boolean} Indicates if id property passed in is valid.
   */
  static validateCustomSessionOpts(opts) {
    return (typeof opts.customSession === 'object' && typeof opts.customSession.customDimensionIndex === 'number'
      && typeof opts.customSession.id === 'string');
  }

  /**
   * Removes Custom Dimiension seding by setting their values to null.
   */
  remove() {
    if (typeof this.opts.customDimensionIndex === 'number') {
      this.tracker.set('dimension' + this.opts.customDimensionIndex, null);
    }

    if (SessionIdTracker.validateCustomSessionOpts(this.opts)) {
      this.tracker.set(
        'dimension' + this.opts.customSession.customDimensionIndex,
        null
      );
    }
  }
}

provide('sessionIdTracker', SessionIdTracker);
