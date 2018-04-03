/**
 * Public options for the SessionIdTracker.
 * @typedef {{
 *   customDimensionIndex: (number),
 *   customSession: (Object),
 *   customSession.customDimensionIndex: (number),
 *   customSession.uuid: (string),
 * }}
 */
var SessionIdTrackerOpts;


/**
 * @interface
 */
class SessionIdTrackerPublicInterface {
  remove() {}
}
