'use strict';

export namespace CacheService {
  //cache is like : Map<cacheType,Map<cacheKey,any>>
  type MapCache = Map<CacheType, Map<CacheKey, CacheContent>>;
  type CacheKey = string;
  type CacheContent = any;

  export enum CacheType {
    TRANSCODIFICATION = 'transcodification',
    SUBSCRIPTION = 'subscription',
    CONFIGURATION = 'configuration',
    TOKEN = 'token',
    PINGSIGNINGKEY = 'pingSigningKey',
    RULE = 'rule',
    MONITORING = 'monitoring',
    CREDENTIAL = 'credential',
    FUNC_FILTER = 'functionalFilter',
  }
  const Logger = console;
  export function print() {
    // @ts-ignore
    const currentCache: MapCache = global.CACHED;
    if (currentCache && currentCache.size > 0) {
      currentCache.forEach((cacheType) =>
        Logger.info(
          cacheType.forEach((cacheValue, cacheKey) =>
            Logger.info(cacheKey + '==>' + JSON.stringify(cacheValue)),
          ),
        ),
      );
    }
  }

  export async function get(
    cacheType: CacheType,
    cacheKey: CacheKey,
  ): Promise<CacheContent> {
    return getCache(cacheType, cacheKey).get(cacheKey);
  }

  export async function put(
    cacheType: CacheType,
    cacheKey: CacheKey,
    cacheContent: CacheContent,
  ) {
    try {
      const mapSize = getCache(cacheType, cacheKey).size;
      if (mapSize > 200 && mapSize < 500) {
        //dummy limit for cache
        Logger.warn(`${mapSize} have been pushed in the cache`);
      } else if (mapSize > 500) {
        Logger.error(
          `${mapSize} have been pushed in the cache ${cacheType}. No more key added`,
        );
        Logger.error(
          `Dump cache  ${JSON.stringify(
            Array.from(getCache(cacheType, cacheKey).entries()),
          )}`,
        );
        return;
      }
      getCache(cacheType, cacheKey).set(cacheKey, cacheContent);
    } catch (e) {
      Logger.error(`Cache ${cacheType} invalid`, JSON.stringify(e));
    }
  }

  //add an element for the key
  export async function addOnKey(cacheType, cacheKey, cacheContent) {
    const existingContent: Array<any> = getCache(cacheType, cacheKey).get(
      cacheKey,
    );
    if (existingContent !== undefined) {
      existingContent.push(
        cacheContent instanceof Array ? cacheContent[0] : cacheContent,
      );
      getCache(cacheType, cacheKey).set(cacheKey, existingContent);
    } else {
      getCache(cacheType, cacheKey).set(cacheKey, cacheContent);
    }
  }

  export async function del(cacheType, cacheKey) {
    try {
      getCache(cacheType, cacheKey).delete(cacheKey);
      Logger.warn(`${cacheType} has changed. ${cacheKey} removed from cache`);
    } catch (e) {
      Logger.error(`${cacheType} has not been initialized. Check the code`);
    }
  }

  export async function delByType(cacheType) {
    try {
      getCache(cacheType).delete(cacheType);
      Logger.warn(`${cacheType} removed from cache`);
    } catch (e) {
      Logger.error(`${cacheType} has not been initialized. Check the code`);
    }
  }

  /**
   * return an initialized memory cache
   * @param cacheType
   * @param cacheKey
   */
  function getCache(cacheType, cacheKey = undefined): Map<string, any> {
    // @ts-ignore
    if (global.CACHED === undefined) {
      //First time ever. Create the mega map
      // @ts-ignore
      global.CACHED = new Map();
      // @ts-ignore
      global.CACHED.set(cacheType, undefined);
    }
    // @ts-ignore
    if (global.CACHED.get(cacheType) === undefined && cacheKey !== undefined) {
      const maMap = new Map();
      maMap.set(cacheKey, undefined);
      // @ts-ignore
      global.CACHED.set(cacheType, maMap);
    }
    // @ts-ignore
    return global.CACHED.get(cacheType);
  }

  export function count(cacheType) {
    let cnt = 0;
    try {
      cnt = getCache(cacheType).size;
    } catch (e) {
      cnt = -1;
    }
    return cnt;
  }
}
