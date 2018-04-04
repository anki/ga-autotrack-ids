/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Modifications Copyright (C) 2018 Anki, Inc.
 */

import provide from '../provide';


/**
 * Class for the `ClientIdTracker` analytics.js plugin.
 * @implements {ClientIdTrackerPublicInterface}
 */
class ClientIdTracker {
  /**
   * Registers clean URL tracking on a tracker object. The clean URL tracker
   * removes query parameters from the page value reported to Google Analytics.
   * It also helps to prevent tracking similar URLs, e.g. sometimes ending a
   * URL with a slash and sometimes not.
   * @param {!Tracker} tracker Passed internally by analytics.js
   * @param {?ClientIdTrackerOpts} opts Passed by the require command.
   */
  constructor(tracker, opts) {
    if (typeof opts.customDimensionIndex !== 'number') {
      throw new Error(`The ClientIdTracker plugin requires a
        customDimensionIndex to store the GA Client ID in. Please create a
        custom diminsion and provide its index as a number when requiring
        the ClientIdTracker plugin.`);
    }

    /** @type {ClientIdTrackerOpts} */
    this.opts = opts;

    this.tracker = tracker;

    tracker.set(
      'dimension' + opts.customDimensionIndex,
      tracker.get('clientId')
    );
  }

  /**
   * Restores all overridden tasks and methods.
   */
  remove() {
    this.tracker.set(
      'dimension' + this.opts.customDimensionIndex,
      null
    );
  }
}

provide('clientIdTracker', ClientIdTracker);
