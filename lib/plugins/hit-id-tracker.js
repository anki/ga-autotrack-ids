import provide from '../provide';
import callGaTaskManager from '../ga-task-manager';
import {uuid} from '../utilities';

/**
 * Class for the `HitIdTracker` analytics.js plugin.
 * @implements {HitIdTrackerPublicInterface}
 */
class HitIdTracker {

  /**
   * Registers Hit ID tracking on a tracker object. This plugin registers
   * a function which sets a chosen Custom Dimension with an uuid value and
   * registers this function to run at customTask Task execution time of every
   * hit.
   * @param {!Tracker} tracker Passed internally by analytics.js
   * @param {?HitIdTrackerOpts} opts Passed by the require command.
   */
  constructor(tracker, opts) {
    if (!tracker.plugins_ || tracker.plugins_.keys.indexOf('gaTaskManager') === -1) {
      throw new Error(`The HitIdTracker plugin requires the GaTaskManager
        plugin to work. Please load and require the GaTaskManager for this
        tracker before requiring the HitIdTracker plugin.`);
    }

    if (typeof opts.customDimensionIndex !== 'number') {
      throw new Error(`The HitIdTracker plugin requires a customDimensionIndex
        to store the GA Client ID in. Please create a custom diminsion and
        provide its index as a number when requiring the HitIdTracker
        plugin.`);
    }

    this.tracker = tracker;
    this.opts = opts;

    callGaTaskManager(
      tracker,
      'setCustomDimension',
      opts.customDimensionIndex,
      uuid
    );
  }


  /**
   * Restores all overridden tasks and methods.
   */
  remove() {
    callGaTaskManager(
      this.tracker,
      'unsetCustomDimension',
      this.opts.customDimensionIndex
    );
  }
}

provide('hitIdTracker', HitIdTracker);
