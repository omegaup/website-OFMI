function addSeconds(date: Date, seconds: number): Date {
  const dateCopy = new Date(date);
  dateCopy.setSeconds(dateCopy.getSeconds() + seconds);
  return dateCopy;
}

/**
 * Options for cache
 */
type TTLCacheOptions = {
  /**
   * How long to cache the key in seconds
   *
   * @default 180 seconds
   * @type {number}
   */
  ttl: number;
  /**
   * Disable the cache (useful for testing purposes)
   *
   * @default false
   * @type {boolean}
   */
  disabled: boolean;
};

/**
 * Default values
 */
const defaults: TTLCacheOptions = {
  ttl: 180,
  disabled: false,
};

type WithTTL<V = unknown> = {
  /**
   * The cached value
   *
   * @type {V}
   */
  value: V;
  /**
   * Expiry meta data
   *
   * @type {string}
   */
  expiresAt: string;
};

/**
 * A simple TTL cache with lazy expiry
 *
 * @class TTLCache
 * @template V
 */
export class TTLCache<V = unknown> {
  /**
   * User options and defaults merged
   *
   * @private
   * @type {TTLCacheOptions}
   * @memberof TTLCache
   */
  private options: TTLCacheOptions;

  /**
   * Base cache instance
   *
   * @private
   * @type {Map<string, WithTTL<V>>}
   * @memberof TTLCache
   */
  private cache: Map<string, WithTTL<V>> = new Map<string, WithTTL<V>>();
  constructor(options?: TTLCacheOptions) {
    // Merge user options with the defaults
    this.options = { ...defaults, ...(options || {}) };
  }

  /**
   * Clear the cache
   *
   * @memberof TTLCache
   */
  clear = (): void => {
    this.cache.clear();
  };

  /**
   * Check whether the cache contains an item
   *
   * @param {string} key
   * @returns {boolean}
   * @memberof TTLCache
   */
  has = (key: string): boolean => {
    if (this.hasExpired(key)) return false;
    return this.cache.has(key);
  };

  /**
   * Get the item from the cache by key if not expired
   *
   * @param {string} key
   * @returns {(V | null)}
   * @memberof TTLCache
   */
  get = (key: string): V | null => {
    if (this.options.disabled) return null;
    if (this.hasExpired(key)) return null;
    return this.cache.get(key)?.value || null;
  };

  /**
   * Add a new cache item
   *
   * @param {string} key
   * @param {V} value
   * @memberof TTLCache
   */
  set = (key: string, value: V): void => {
    if (this.options.disabled) {
      return;
    }
    const expiry = addSeconds(new Date(), this.options.ttl).toISOString();

    this.cache.set(key, { value, expiresAt: expiry });
  };

  /**
   * Remove an item from the cache
   *
   * @param {string} key
   * @memberof TTLCache
   */
  remove = (key: string): void => {
    this.cache.delete(key);
  };

  /**
   * Extract the expiry date from a given key
   *
   * @private
   * @param {string} key
   * @returns {(Date | null)}
   * @memberof TTLCache
   */
  private getExpiryFromKey = (key: string): Date | null => {
    const result = this.cache.get(key);
    if (!result || !result.expiresAt) return null;
    return new Date(result.expiresAt);
  };

  /**
   * Check whether the given cache item has expired
   *
   * @private
   * @param {string} key
   * @returns {boolean}
   * @memberof TTLCache
   */
  private hasExpired = (key: string): boolean => {
    const date = this.getExpiryFromKey(key);
    const hasExpired = date ? new Date() > date : true;
    if (hasExpired) {
      this.remove(key);
    }
    return hasExpired;
  };
}
