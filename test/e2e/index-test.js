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
 */


import assert from 'assert';
import uuid from 'uuid';
import * as ga from './ga';
import {bindLogAccessors} from './server';


const DEFAULT_TRACKER_FIELDS = {
  trackingId: 'UA-40941061-3',
  cookieDomain: 'auto',
  siteSpeedSampleRate: 0,
};


let testId;
let log;


describe('index', function() {
  this.retries(4);

  beforeEach(() => {
    testId = uuid();
    log = bindLogAccessors(testId);
  });

  afterEach(() => {
    browser.execute(ga.run, 'cleanUrlTracker:remove');
    browser.execute(ga.run, 'HitIdTracker:remove');
    browser.execute(ga.run, 'HitTimestampTracker:remove');
    browser.execute(ga.run, 'SessionIdTracker:remove');
    browser.execute(ga.run, 'ClientIdTracker:remove');
    browser.execute(ga.run, 'remove');
    log.removeHits();
  });

  it('provides all plugins', () => {
    browser.url('/test/e2e/fixtures/ga-autotrack-ids.html');
    const gaplugins = browser.execute(ga.getProvidedPlugins).value;

    assert(gaplugins.includes('CleanUrlTracker'));
    assert(gaplugins.includes('HitIdTracker'));
    assert(gaplugins.includes('HitTimestampTracker'));
    assert(gaplugins.includes('SessionIdTracker'));
    assert(gaplugins.includes('ClientIdTracker'));
  });

  it('provides plugins even if sourced before the tracking snippet',
      () => {
    browser.url('/test/e2e/fixtures/ga-autotrack-ids-reorder.html');

    const gaplugins = browser.execute(ga.getProvidedPlugins).value;
    assert(gaplugins.includes('CleanUrlTracker'));
    assert(gaplugins.includes('HitIdTracker'));
    assert(gaplugins.includes('HitTimestampTracker'));
    assert(gaplugins.includes('SessionIdTracker'));
    assert(gaplugins.includes('ClientIdTracker'));
  });

  it('works with all plugins required', () => {
    browser.url('/test/e2e/fixtures/ga-autotrack-ids.html');
    browser.execute(ga.run, 'create', DEFAULT_TRACKER_FIELDS);
    browser.execute(ga.logHitData, testId);
    browser.execute(ga.run, 'require', 'cleanUrlTracker');
    browser.execute(ga.run, 'require', 'HitIdTracker');
    browser.execute(ga.run, 'require', 'HitTimestampTracker');
    browser.execute(ga.run, 'require', 'SessionIdTracker');
    browser.execute(ga.run, 'require', 'ClientIdTracker');
    browser.execute(ga.run, 'send', 'pageview');
    browser.waitUntil(log.hitCountIsAtLeast(1));

    const lastHit = log.getHits().slice(-1)[0];
    assert.strictEqual(lastHit.t, 'pageview');
  });

  it('works when renaming the global object', () => {
    browser.url('/test/e2e/fixtures/ga-autotrack-ids-rename.html');
    browser.execute(ga.run, 'create', DEFAULT_TRACKER_FIELDS);
    browser.execute(ga.logHitData, testId);
    browser.execute(ga.run, 'require', 'cleanUrlTracker');
    browser.execute(ga.run, 'require', 'HitIdTracker');
    browser.execute(ga.run, 'require', 'HitTimestampTracker');
    browser.execute(ga.run, 'require', 'SessionIdTracker');
    browser.execute(ga.run, 'require', 'ClientIdTracker');
    browser.execute(ga.run, 'send', 'pageview');
    browser.waitUntil(log.hitCountIsAtLeast(1));

    const lastHit = log.getHits().slice(-1)[0];
    assert.strictEqual(lastHit.t, 'pageview');
  });
});
