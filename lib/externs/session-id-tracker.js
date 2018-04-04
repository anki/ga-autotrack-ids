/**
 * Public options for the SessionIdTracker.
 * @typedef {{
 *   customDimensionIndex: (number),
 *   customSession: (Object),
 *   customSession.customDimensionIndex: (number),
 *   customSession.id: (string),
 * }}
 */
var SessionIdTrackerOpts;


/**
 * @interface
 */
class SessionIdTrackerPublicInterface {
  remove() {}
}
