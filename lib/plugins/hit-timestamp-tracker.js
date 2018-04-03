import provide from '../provide';
import callGaTaskManager from '../ga-task-manager';

/**
 * Class for the `HitTimestampTracker` analytics.js plugin.
 * @implements {HitTimestampTrackerPublicInterface}
 */
class HitTimestampTracker {
  /**
   * Registers Hit Timestamp tracking on a tracker object. This plugin registers
   * a function which sets a chosen Custom Dimension with a value of the number
   * of microseconds seconds since 1 January 1970 00:00:00 UTC and registers
   * this function to run at customTask Task execution time of every hit send
   * for this tracker.
   * @param {!Tracker} tracker Passed internally by analytics.js
   * @param {?HitTimestampTrackerOpts} opts Passed by the require command.
   */
  constructor(tracker, opts) {
    if (tracker.plugins_.keys.indexOf('GaTaskManager') === -1) {
      throw new Error(`The HitTimestampTracker plugin requires the GaTaskManager
        plugin to work. Please load and require the GaTaskManager for this
        tracker before requiring the HitTimestampTracker plugin.`);
    }

    if (typeof opts.customDimensionIndex !== 'number') {
      throw new Error(`The HitTimestampTracker plugin requires a
        customDimensionIndex to store the GA Client ID in. Please create a
        custom diminsion and provide its index as a number when requiring
        the HitTimestampTracker plugin.`);
    }

    this.tracker = tracker;
    this.opts = opts;

    callGaTaskManager(
      tracker,
      'setCustomDimension',
      opts.customDimensionIndex,
      function() {
        return +Date.now();
      }
    );
  }

  /**
   * Restores all overridden tasks and methods.
   */
  remove() {
    callGaTaskManager(this.tracker, 'unsetCustomDimension', this.opts.customDimensionIndex);
  }
}

provide('hitTimestampTracker', HitTimestampTracker);
