import {
  CacheFirst, CacheOnly, NetworkFirst,
  NetworkOnly, StaleWhileRevalidate,
} from '../../../sw-runtime-caching/src/index.js';
import {CacheExpirationPlugin} from
  '../../../sw-cache-expiration/src/index.js';
import {BroadcastCacheUpdatePlugin} from
  '../../../sw-broadcast-cache-update/src/index.js';
import {CacheableResponsePlugin} from
  '../../../sw-cacheable-response/src/index.js';
import {RequestWrapper} from '../../../sw-runtime-caching/src/index.js';

/**
 * This is a simple class used to namespace the supported caching strategies in
 * sw-lib.
 *
 * You would never access this class directly but instead use with
 * `swlib.strategies.<Strategy Name>`.
 *
 * @memberof module:sw-lib
 */
class Strategies {
  /**
   * This constructor will configure shared options across each strategy.
   * @param  {String} [input.cacheId]  The cacheId to be applied to the run
   * time strategies cache names.
   */
  constructor({cacheId} = {}) {
    this._cacheId = cacheId;
  }

  /**
   * A [cache first](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#cache-falling-back-to-network)
   * run-time caching strategy.
   *
   * @example
   * const = new goog.SWLib();
   * const cacheFirstStrategy = swlib.strategies.cacheFirst();
   *
   * swlib.router.registerRoute('/styles/*', cacheFirstStrategy);
   *
   * @param {module:sw-lib.SWLib.RuntimeStrategyOptions} [options] To define
   * any additional caching or broadcast plugins pass in option values.
   * @return {module:sw-runtime-caching.CacheFirst} A CacheFirst handler.
   */
  cacheFirst(options) {
    return this._getCachingMechanism(CacheFirst, options);
  }

  /**
   * A [cache only](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#cache-only)
   * run-time caching strategy.
   *
   * @example
   * const swlib = new goog.SWLib();
   * const cacheOnlyStrategy = swlib.strategies.cacheOnly();
   *
   * swlib.router.registerRoute('/styles/*', cacheOnlyStrategy);
   *
   * @param {module:sw-lib.SWLib.RuntimeStrategyOptions} [options] To define
   * any additional caching or broadcast plugins pass in option values.
   * @return {module:sw-runtime-caching.CacheOnly} The caching handler
   * instance.
   */
  cacheOnly(options) {
    return this._getCachingMechanism(CacheOnly, options);
  }

  /**
   * A [network first](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#network-falling-back-to-cache)
   * run-time caching strategy.
   *
   * @example
   * const swlib = new goog.SWLib();
   * const networkFirstStrategy = swlib.strategies.networkFirst();
   *
   * swlib.router.registerRoute('/blog/', networkFirstStrategy);
   *
   * @param {module:sw-lib.SWLib.RuntimeStrategyOptions} [options] To define
   * any additional caching or broadcast plugins pass in option values.
   * @return {module:sw-runtime-caching.NetworkFirst} The caching handler
   * instance.
   */
  networkFirst(options) {
    return this._getCachingMechanism(NetworkFirst, options);
  }

  /**
   * A [network only](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#network-only)
   * run-time caching strategy.
   *
   * @example
   * const swlib = new goog.SWLib();
   * const networkOnlyStrategy = swlib.strategies.networkOnly();
   *
   * swlib.router.registerRoute('/admin/', networkOnlyStrategy);
   *
   * @param {module:sw-lib.SWLib.RuntimeStrategyOptions} [options] To define
   * any additional caching or broadcast plugins pass in option values.
   * @return {module:sw-runtime-caching.NetworkOnly} The caching handler
   * instance.
   */
  networkOnly(options) {
    return this._getCachingMechanism(NetworkOnly, options);
  }

  /**
   * A [stale while revalidate](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#stale-while-revalidate)
   * run-time caching strategy.
   *
   * @example
   * const swlib = new goog.SWLib();
   * const staleWhileRevalidateStrategy =
   *  swlib.strategies.staleWhileRevalidate();
   *
   * swlib.router.registerRoute('/styles/*', staleWhileRevalidateStrategy);
   *
   * @param {module:sw-lib.SWLib.RuntimeStrategyOptions} [options] To define
   * any additional caching or broadcast plugins pass in option values.
   * @return {module:sw-runtime-caching.StaleWhileRevalidate} The caching
   * handler instance.
   */
  staleWhileRevalidate(options) {
    return this._getCachingMechanism(StaleWhileRevalidate, options);
  }

  /**
   * This method will add plugins based on options passed in by the
   * developer.
   *
   * @private
   * @param {Class} HandlerClass The class to be configured and instantiated.
   * @param {Object} [options] Options to configure the handler.
   * @return {Handler} A handler instance configured with the appropriate
   * behaviours
   */
  _getCachingMechanism(HandlerClass, options = {}) {
    const pluginParamsToClass = {
      'cacheExpiration': CacheExpirationPlugin,
      'broadcastCacheUpdate': BroadcastCacheUpdatePlugin,
      'cacheableResponse': CacheableResponsePlugin,
    };

    const wrapperOptions = {
      plugins: [],
      cacheId: this._cacheId,
    };

    if (options['cacheName']) {
      wrapperOptions['cacheName'] = options['cacheName'];
    }

    // Iterate over known plugins and add them to Request Wrapper options.
    const pluginKeys = Object.keys(pluginParamsToClass);
    pluginKeys.forEach((pluginKey) => {
      if (options[pluginKey]) {
        const PluginClass = pluginParamsToClass[pluginKey];
        const pluginParams = options[pluginKey];

        wrapperOptions.plugins.push(new PluginClass(pluginParams));
      }
    });

    // Add custom plugins.
    if (options.plugins) {
      options.plugins.forEach((plugin) => {
        wrapperOptions.plugins.push(plugin);
      });
    }

    return new HandlerClass({
      requestWrapper: new RequestWrapper(wrapperOptions),
    });
  }
}

export default Strategies;
