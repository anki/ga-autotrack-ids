/**
 * Copyright 2017 Google Inc. All Rights Reserved.
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
import '../../../lib/plugins/hit-id-tracker';
import callGaTaskManager from '../../../lib/ga-task-manager';
import url from 'nanoid/url';

const DEFAULT_TRACKER_FIELDS = {
  trackingId: 'UA-40941061-3',
  cookieDomain: 'auto',
  siteSpeedSampleRate: 0,
};

const DEFAULT_HIT_TRACKER_OPTS = {customDimensionIndex: 1};

const HIT_ID_QUERY_STRING_VALUE_PATTERN = '=(.{21})&';

describe('HitIdTracker', () => {
  let tracker;
  let HitIdTracker;
  let gaTaskManagerInstance;

  beforeEach((done) => {
    localStorage.clear();
    window.ga('create', DEFAULT_TRACKER_FIELDS);
    window.ga('require', 'gaTaskManager');
    window.ga((t) => {
      tracker = t;
      gaTaskManagerInstance = t.plugins_.values[':gaTaskManager'];
      HitIdTracker = window.gaplugins.HitIdTracker;
      done();
    });
  });

  afterEach(() => {
    localStorage.clear();
    callGaTaskManager(tracker, 'remove');
    window.ga('remove');
  });

  describe('constructor', () => {
    it('stores the Hit ID tracker on the GA tracker instance', (done) => {
      const hit = new HitIdTracker(tracker, DEFAULT_HIT_TRACKER_OPTS);
      assert.strictEqual(tracker, hit.tracker);
      hit.remove();
      done();
    });

    it('registers the uuid custom dimension setting function in GaTaskManager', (done) => {
      assert(typeof gaTaskManagerInstance.a['customTask']['customDimension' + DEFAULT_HIT_TRACKER_OPTS.customDimensionIndex] === 'undefined');
      const hit = new HitIdTracker(tracker, DEFAULT_HIT_TRACKER_OPTS);
      assert(typeof gaTaskManagerInstance.a['customTask']['customDimension' + DEFAULT_HIT_TRACKER_OPTS.customDimensionIndex] === 'function');
      hit.remove();
      done();
    });
  });

  describe('Custom dimension hit id values', () => {
    it('Sets hit id on the correct custom dimension', (done) => {
      callGaTaskManager(
        tracker,
        'addFunctionToTask',
        'sendHitTask',
        'assertHitIdinPayload',
        function(model) {
          let customDimensionQueryParameter = 'cd' + DEFAULT_HIT_TRACKER_OPTS.customDimensionIndex;
          let hitIdPattern = new RegExp(customDimensionQueryParameter + HIT_ID_QUERY_STRING_VALUE_PATTERN);
          try {
            assert(model.get('hitPayload').match(hitIdPattern));
          } catch (e) {
            done(e);
          }
          hit.remove();
          done();
        }
      );
      const hit = new HitIdTracker(tracker, DEFAULT_HIT_TRACKER_OPTS);
      window.ga('send', 'pageview');
    });

    it('Sets url safe nanoids', (done) => {
      callGaTaskManager(
        tracker,
        'addFunctionToTask',
        'buildHitTask',
        'assertUrlSafeHitId',
        function(model) {
          let chars = [...model.get('dimension' + DEFAULT_HIT_TRACKER_OPTS.customDimensionIndex)];
          chars.every((char) => {
            try {
              assert.notStrictEqual(url.indexOf(char), -1, 'Character "' + char + '" is not URL safe.');
              return true;
            } catch (e) {
              done(e);
            }
          });
          hit.remove();
          done();
        }
      );

      const hit = new HitIdTracker(tracker, DEFAULT_HIT_TRACKER_OPTS);
      window.ga('send', 'pageview');
    });

    it('Sets unique hit ids across multiple hits', (done) => {
      let hitIds = [];
      let numOfTests = 100000;
      callGaTaskManager(
        tracker,
        'addFunctionToTask',
        'previewTask',
        'assertUniqueHitIdAbort',
        function(model) {
          let id = model.get('dimension' + DEFAULT_HIT_TRACKER_OPTS.customDimensionIndex);

          try{
            assert.strictEqual(hitIds.indexOf(id), -1, 'Hit ID "' + id + '" repeated.');
          } catch (e) {
            hit.remove();
            done(e);
          }

          hitIds.push(id);
          if(hitIds.length === numOfTests) {
            hit.remove();
            done();
          }

          throw "abort";
        }
      );

      const hit = new HitIdTracker(tracker, DEFAULT_HIT_TRACKER_OPTS);

      for(let counter = 0; counter < numOfTests; counter++) {
        window.ga('send', 'pageview');
      }
    }).timeout(300000);

    it('Sets hit ids across all hit types', (done) => {
      const mockHitTypes = {
        pageview: {
          hitType: 'pageview',
          page: '/home',
        },
        event: {
          hitType: 'event',
          eventCategory: 'Automated',
          eventAction: 'Test',
        },
        Transaction: {
          id: 12345,
        },
        Item: {
          id: 12345,
          name: 'Test Product',
        },
        social: {
          hitType: 'social',
          socialNetwork: 'facebook',
          action: 'like',
          network: 'https://facebook.com',
        },
        timing: {
          hitType: 'timing',
          timingCategory: 'category',
          timingVar: 'lookup',
          timingValue: 123,
        },
        exception: {
          hitType: 'exception',
          exDescription: 'TestError',
        },
      };

      let hits = 0;

      callGaTaskManager(
        tracker,
        'addFunctionToTask',
        'sendHitTask',
        'assertHitIdinPayload',
        function(model) {
          let customDimensionQueryParameter = 'cd' + DEFAULT_HIT_TRACKER_OPTS.customDimensionIndex;
          let hitIdPattern = new RegExp(customDimensionQueryParameter + HIT_ID_QUERY_STRING_VALUE_PATTERN);
          try {
            assert(model.get('hitPayload').match(hitIdPattern));
          } catch (e) {
            hit.remove();
            done(e);
          }
          hits++;

          if(hits === 7) {
            hit.remove();
            done();
          }
        }
      );

      const hit = new HitIdTracker(tracker, DEFAULT_HIT_TRACKER_OPTS);

      window.ga('require', 'ecommerce');

      for (const hitType of Object.keys(mockHitTypes)) {
        const ecommerce = ['Transaction', 'Item'].includes(hitType);
        const command = ecommerce ? 'ecommerce:add' + hitType : 'send';
        window.ga(command, mockHitTypes[hitType]);
        if (ecommerce) window.ga('ecommerce:send');
      }
    });
  });
});
