import ga from './ga';

/**
 * Wrapper for calling methods of the GaTaskManager plugin.
 * @param {!Tracker} tracker Passed internally by analytics.js
 * @param {string} methodName the GaTaskManager plugin method to invoke.
 * @param {...*} args
 */
export default function callGaTaskManager(tracker, methodName, ...args) {
  ga(tracker.get('name') + '.gaTaskManager:' + methodName, ...args);
}
