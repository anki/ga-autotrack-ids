/**
 * Race condition safe way to call the analytics.js
 * ga() command queue.
 * @return {!Function}
 * @suppress {checkVars}
 */
export default (() => {
    const gaAlias = window.GoogleAnalyticsObject || 'ga';
    window[gaAlias] = window[gaAlias] || function(...args) {
      (window[gaAlias].q = window[gaAlias].q || []).push(args);
    };
    return (...args) => window[gaAlias](...args);
})();
