(function(){var e="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,d){a!=Array.prototype&&a!=Object.prototype&&(a[b]=d.value)},g="undefined"!=typeof window&&window===this?this:"undefined"!=typeof global&&null!=global?global:this;function h(){h=function(){};g.Symbol||(g.Symbol=k)}var k=function(){var a=0;return function(b){return"jscomp_symbol_"+(b||"")+a++}}();
function m(){h();var a=g.Symbol.iterator;a||(a=g.Symbol.iterator=g.Symbol("iterator"));"function"!=typeof Array.prototype[a]&&e(Array.prototype,a,{configurable:!0,writable:!0,value:function(){return n(this)}});m=function(){}}function n(a){var b=0;return p(function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}})}function p(a){m();a={next:a};a[g.Symbol.iterator]=function(){return this};return a}function q(a){m();var b=a[Symbol.iterator];return b?b.call(a):n(a)}
function r(a){for(var b,d=[];!(b=a.next()).done;)d.push(b.value);return d}function t(){for(var a=v,b=(2<<Math.log(63)/Math.LN2)-1,d=Math.ceil(33.6*b/64),c="";;)for(var f=a(d),l=0;l<d;l++){var u=f[l]&b;if("_~0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"[u]&&(c+="_~0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"[u],21===c.length))return c}}var crypto=self.crypto||self.msCrypto;function v(a){return crypto.getRandomValues(new Uint8Array(a))}function w(){return t()}
var ga=function(){var a=window.GoogleAnalyticsObject||"ga";window[a]=window[a]||function(b){for(var d=[],c=0;c<arguments.length;++c)d[c]=arguments[c];(window[a].q=window[a].q||[]).push(d)};return function(b){for(var d=[],c=0;c<arguments.length;++c)d[c]=arguments[c];return window[a].apply(null,d instanceof Array?d:r(q(d)))}}();
function x(a,b){window.gaDevIds=window.gaDevIds||[];0>window.gaDevIds.indexOf("d8f00h")&&window.gaDevIds.push("d8f00h");ga("provide",a,b);window.gaplugins=window.gaplugins||{};window.gaplugins[a.charAt(0).toUpperCase()+a.slice(1)]=b}
function y(a,b){if("number"!==typeof b.customDimensionIndex)throw Error("The ClientIdTracker plugin requires a\n        customDimensionIndex to store the GA Client ID in. Please create a\n        custom diminsion and provide its index as a number when requiring\n        the ClientIdTracker plugin.");this.a=b;this.b=a;a.set("dimension"+b.customDimensionIndex,a.get("clientId"))}y.prototype.remove=function(){this.b.set("dimension"+this.a.customDimensionIndex,null)};x("clientIdTracker",y);
function z(a,b){if("number"!==typeof b.customDimensionIndex&&!A(b))throw Error("The SessionIdTracker plugin requires a\n        customDimensionIndex to store the auto generated uuid value in\n        or a customSession object with customDimensionIndex number and\n        id string. You can use both. Please provide the options when requiring\n        the plugin.");this.b=a;this.a=b;"number"===typeof b.customDimensionIndex&&a.set("dimension"+b.customDimensionIndex,t());A(b)&&a.set("dimension"+b.customSession.customDimensionIndex,
b.customSession.id)}function A(a){return"object"===typeof a.customSession&&"number"===typeof a.customSession.customDimensionIndex&&"string"===typeof a.customSession.id}z.prototype.remove=function(){"number"===typeof this.a.customDimensionIndex&&this.b.set("dimension"+this.a.customDimensionIndex,null);A(this.a)&&this.b.set("dimension"+this.a.customSession.customDimensionIndex,null)};x("sessionIdTracker",z);
function B(a,b,d){for(var c=[],f=2;f<arguments.length;++f)c[f-2]=arguments[f];ga.apply(null,[a.get("name")+".gaTaskManager:"+b].concat(c instanceof Array?c:r(q(c))))}
function C(a,b){if(!a.plugins_||-1===a.plugins_.keys.indexOf("gaTaskManager"))throw Error("The HitIdTracker plugin requires the GaTaskManager\n        plugin to work. Please load and require the GaTaskManager for this\n        tracker before requiring the HitIdTracker plugin.");if("number"!==typeof b.customDimensionIndex)throw Error("The HitIdTracker plugin requires a customDimensionIndex\n        to store the GA Client ID in. Please create a custom diminsion and\n        provide its index as a number when requiring the HitIdTracker\n        plugin.");this.b=
a;this.a=b;B(a,"setCustomDimension",b.customDimensionIndex,w)}C.prototype.remove=function(){B(this.b,"unsetCustomDimension",this.a.customDimensionIndex)};x("hitIdTracker",C);
function D(a,b){if(-1===a.plugins_.keys.indexOf("gaTaskManager"))throw Error("The HitTimestampTracker plugin requires the GaTaskManager\n        plugin to work. Please load and require the GaTaskManager for this\n        tracker before requiring the HitTimestampTracker plugin.");if("number"!==typeof b.customDimensionIndex)throw Error("The HitTimestampTracker plugin requires a\n        customDimensionIndex to store the GA Client ID in. Please create a\n        custom diminsion and provide its index as a number when requiring\n        the HitTimestampTracker plugin.");this.b=
a;this.a=b;B(a,"setCustomDimension",b.customDimensionIndex,function(){return+Date.now()})}D.prototype.remove=function(){B(this.b,"unsetCustomDimension",this.a.customDimensionIndex)};x("hitTimestampTracker",D);})();
//# sourceMappingURL=ga-autotrack-ids.js.map