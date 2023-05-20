var __create = Object.create;
var __descs = Object.getOwnPropertyDescriptors;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/micro-memoize/dist/micro-memoize.js
var require_micro_memoize = __commonJS((exports, module) => {
  (function(global, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global["micro-memoize"] = factory());
  })(exports, function() {
    var DEFAULT_OPTIONS_KEYS = {
      isEqual: true,
      isMatchingKey: true,
      isPromise: true,
      maxSize: true,
      onCacheAdd: true,
      onCacheChange: true,
      onCacheHit: true,
      transformKey: true
    };
    var slice = Array.prototype.slice;
    function cloneArray(arrayLike) {
      var length = arrayLike.length;
      if (!length) {
        return [];
      }
      if (length === 1) {
        return [arrayLike[0]];
      }
      if (length === 2) {
        return [arrayLike[0], arrayLike[1]];
      }
      if (length === 3) {
        return [arrayLike[0], arrayLike[1], arrayLike[2]];
      }
      return slice.call(arrayLike, 0);
    }
    function getCustomOptions(options) {
      var customOptions = {};
      for (var key in options) {
        if (!DEFAULT_OPTIONS_KEYS[key]) {
          customOptions[key] = options[key];
        }
      }
      return customOptions;
    }
    function isMemoized(fn) {
      return typeof fn === "function" && fn.isMemoized;
    }
    function isSameValueZero(object1, object2) {
      return object1 === object2 || object1 !== object1 && object2 !== object2;
    }
    function mergeOptions(existingOptions, newOptions) {
      var target = {};
      for (var key in existingOptions) {
        target[key] = existingOptions[key];
      }
      for (var key in newOptions) {
        target[key] = newOptions[key];
      }
      return target;
    }
    var Cache = function() {
      function Cache2(options) {
        this.keys = [];
        this.values = [];
        this.options = options;
        var isMatchingKeyFunction = typeof options.isMatchingKey === "function";
        if (isMatchingKeyFunction) {
          this.getKeyIndex = this._getKeyIndexFromMatchingKey;
        } else if (options.maxSize > 1) {
          this.getKeyIndex = this._getKeyIndexForMany;
        } else {
          this.getKeyIndex = this._getKeyIndexForSingle;
        }
        this.canTransformKey = typeof options.transformKey === "function";
        this.shouldCloneArguments = this.canTransformKey || isMatchingKeyFunction;
        this.shouldUpdateOnAdd = typeof options.onCacheAdd === "function";
        this.shouldUpdateOnChange = typeof options.onCacheChange === "function";
        this.shouldUpdateOnHit = typeof options.onCacheHit === "function";
      }
      Object.defineProperty(Cache2.prototype, "size", {
        get: function() {
          return this.keys.length;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(Cache2.prototype, "snapshot", {
        get: function() {
          return {
            keys: cloneArray(this.keys),
            size: this.size,
            values: cloneArray(this.values)
          };
        },
        enumerable: false,
        configurable: true
      });
      Cache2.prototype._getKeyIndexFromMatchingKey = function(keyToMatch) {
        var _a = this.options, isMatchingKey = _a.isMatchingKey, maxSize = _a.maxSize;
        var keys = this.keys;
        var keysLength = keys.length;
        if (!keysLength) {
          return -1;
        }
        if (isMatchingKey(keys[0], keyToMatch)) {
          return 0;
        }
        if (maxSize > 1) {
          for (var index = 1;index < keysLength; index++) {
            if (isMatchingKey(keys[index], keyToMatch)) {
              return index;
            }
          }
        }
        return -1;
      };
      Cache2.prototype._getKeyIndexForMany = function(keyToMatch) {
        var isEqual = this.options.isEqual;
        var keys = this.keys;
        var keysLength = keys.length;
        if (!keysLength) {
          return -1;
        }
        if (keysLength === 1) {
          return this._getKeyIndexForSingle(keyToMatch);
        }
        var keyLength = keyToMatch.length;
        var existingKey;
        var argIndex;
        if (keyLength > 1) {
          for (var index = 0;index < keysLength; index++) {
            existingKey = keys[index];
            if (existingKey.length === keyLength) {
              argIndex = 0;
              for (;argIndex < keyLength; argIndex++) {
                if (!isEqual(existingKey[argIndex], keyToMatch[argIndex])) {
                  break;
                }
              }
              if (argIndex === keyLength) {
                return index;
              }
            }
          }
        } else {
          for (var index = 0;index < keysLength; index++) {
            existingKey = keys[index];
            if (existingKey.length === keyLength && isEqual(existingKey[0], keyToMatch[0])) {
              return index;
            }
          }
        }
        return -1;
      };
      Cache2.prototype._getKeyIndexForSingle = function(keyToMatch) {
        var keys = this.keys;
        if (!keys.length) {
          return -1;
        }
        var existingKey = keys[0];
        var length = existingKey.length;
        if (keyToMatch.length !== length) {
          return -1;
        }
        var isEqual = this.options.isEqual;
        if (length > 1) {
          for (var index = 0;index < length; index++) {
            if (!isEqual(existingKey[index], keyToMatch[index])) {
              return -1;
            }
          }
          return 0;
        }
        return isEqual(existingKey[0], keyToMatch[0]) ? 0 : -1;
      };
      Cache2.prototype.orderByLru = function(key, value, startingIndex) {
        var keys = this.keys;
        var values = this.values;
        var currentLength = keys.length;
        var index = startingIndex;
        while (index--) {
          keys[index + 1] = keys[index];
          values[index + 1] = values[index];
        }
        keys[0] = key;
        values[0] = value;
        var maxSize = this.options.maxSize;
        if (currentLength === maxSize && startingIndex === currentLength) {
          keys.pop();
          values.pop();
        } else if (startingIndex >= maxSize) {
          keys.length = values.length = maxSize;
        }
      };
      Cache2.prototype.updateAsyncCache = function(memoized) {
        var _this = this;
        var _a = this.options, onCacheChange = _a.onCacheChange, onCacheHit = _a.onCacheHit;
        var firstKey = this.keys[0];
        var firstValue = this.values[0];
        this.values[0] = firstValue.then(function(value) {
          if (_this.shouldUpdateOnHit) {
            onCacheHit(_this, _this.options, memoized);
          }
          if (_this.shouldUpdateOnChange) {
            onCacheChange(_this, _this.options, memoized);
          }
          return value;
        }, function(error) {
          var keyIndex = _this.getKeyIndex(firstKey);
          if (keyIndex !== -1) {
            _this.keys.splice(keyIndex, 1);
            _this.values.splice(keyIndex, 1);
          }
          throw error;
        });
      };
      return Cache2;
    }();
    function createMemoizedFunction(fn, options) {
      if (options === undefined) {
        options = {};
      }
      if (isMemoized(fn)) {
        return createMemoizedFunction(fn.fn, mergeOptions(fn.options, options));
      }
      if (typeof fn !== "function") {
        throw new TypeError("You must pass a function to `memoize`.");
      }
      var _a = options.isEqual, isEqual = _a === undefined ? isSameValueZero : _a, isMatchingKey = options.isMatchingKey, _b = options.isPromise, isPromise = _b === undefined ? false : _b, _c = options.maxSize, maxSize = _c === undefined ? 1 : _c, onCacheAdd = options.onCacheAdd, onCacheChange = options.onCacheChange, onCacheHit = options.onCacheHit, transformKey = options.transformKey;
      var normalizedOptions = mergeOptions({
        isEqual,
        isMatchingKey,
        isPromise,
        maxSize,
        onCacheAdd,
        onCacheChange,
        onCacheHit,
        transformKey
      }, getCustomOptions(options));
      var cache = new Cache(normalizedOptions);
      var { keys, values, canTransformKey, shouldCloneArguments, shouldUpdateOnAdd, shouldUpdateOnChange, shouldUpdateOnHit } = cache;
      var memoized = function() {
        var key = shouldCloneArguments ? cloneArray(arguments) : arguments;
        if (canTransformKey) {
          key = transformKey(key);
        }
        var keyIndex = keys.length ? cache.getKeyIndex(key) : -1;
        if (keyIndex !== -1) {
          if (shouldUpdateOnHit) {
            onCacheHit(cache, normalizedOptions, memoized);
          }
          if (keyIndex) {
            cache.orderByLru(keys[keyIndex], values[keyIndex], keyIndex);
            if (shouldUpdateOnChange) {
              onCacheChange(cache, normalizedOptions, memoized);
            }
          }
        } else {
          var newValue = fn.apply(this, arguments);
          var newKey = shouldCloneArguments ? key : cloneArray(arguments);
          cache.orderByLru(newKey, newValue, keys.length);
          if (isPromise) {
            cache.updateAsyncCache(memoized);
          }
          if (shouldUpdateOnAdd) {
            onCacheAdd(cache, normalizedOptions, memoized);
          }
          if (shouldUpdateOnChange) {
            onCacheChange(cache, normalizedOptions, memoized);
          }
        }
        return values[0];
      };
      memoized.cache = cache;
      memoized.fn = fn;
      memoized.isMemoized = true;
      memoized.options = normalizedOptions;
      return memoized;
    }
    return createMemoizedFunction;
  });
});

// node_modules/fast-equals/dist/fast-equals.js
var require_fast_equals = __commonJS((exports, module) => {
  (function(global, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global["fast-equals"] = {}));
  })(exports, function(exports2) {
    var HAS_WEAK_MAP_SUPPORT = typeof WeakMap === "function";
    var keys = Object.keys;
    function sameValueZeroEqual(a, b) {
      return a === b || a !== a && b !== b;
    }
    function isPlainObject(value) {
      return value.constructor === Object || value.constructor == null;
    }
    function isPromiseLike(value) {
      return !!value && typeof value.then === "function";
    }
    function isReactElement(value) {
      return !!(value && value.$$typeof);
    }
    function getNewCacheFallback() {
      var entries = [];
      return {
        delete: function(key) {
          for (var index = 0;index < entries.length; ++index) {
            if (entries[index][0] === key) {
              entries.splice(index, 1);
              return;
            }
          }
        },
        get: function(key) {
          for (var index = 0;index < entries.length; ++index) {
            if (entries[index][0] === key) {
              return entries[index][1];
            }
          }
        },
        set: function(key, value) {
          for (var index = 0;index < entries.length; ++index) {
            if (entries[index][0] === key) {
              entries[index][1] = value;
              return;
            }
          }
          entries.push([key, value]);
        }
      };
    }
    var getNewCache = function(canUseWeakMap) {
      if (canUseWeakMap) {
        return function _getNewCache() {
          return new WeakMap;
        };
      }
      return getNewCacheFallback;
    }(HAS_WEAK_MAP_SUPPORT);
    function createCircularEqualCreator(isEqual) {
      return function createCircularEqual(comparator) {
        var _comparator = isEqual || comparator;
        return function circularEqual(a, b, indexOrKeyA, indexOrKeyB, parentA, parentB, cache) {
          if (cache === undefined) {
            cache = getNewCache();
          }
          var isCacheableA = !!a && typeof a === "object";
          var isCacheableB = !!b && typeof b === "object";
          if (isCacheableA !== isCacheableB) {
            return false;
          }
          if (!isCacheableA && !isCacheableB) {
            return _comparator(a, b, cache);
          }
          var cachedA = cache.get(a);
          if (cachedA && cache.get(b)) {
            return cachedA === b;
          }
          cache.set(a, b);
          cache.set(b, a);
          var result = _comparator(a, b, cache);
          cache.delete(a);
          cache.delete(b);
          return result;
        };
      };
    }
    function areArraysEqual(a, b, isEqual, meta) {
      var index = a.length;
      if (b.length !== index) {
        return false;
      }
      while (index-- > 0) {
        if (!isEqual(a[index], b[index], index, index, a, b, meta)) {
          return false;
        }
      }
      return true;
    }
    function areMapsEqual(a, b, isEqual, meta) {
      var isValueEqual = a.size === b.size;
      if (isValueEqual && a.size) {
        var matchedIndices_1 = {};
        var indexA_1 = 0;
        a.forEach(function(aValue, aKey) {
          if (isValueEqual) {
            var hasMatch_1 = false;
            var matchIndexB_1 = 0;
            b.forEach(function(bValue, bKey) {
              if (!hasMatch_1 && !matchedIndices_1[matchIndexB_1]) {
                hasMatch_1 = isEqual(aKey, bKey, indexA_1, matchIndexB_1, a, b, meta) && isEqual(aValue, bValue, aKey, bKey, a, b, meta);
                if (hasMatch_1) {
                  matchedIndices_1[matchIndexB_1] = true;
                }
              }
              matchIndexB_1++;
            });
            indexA_1++;
            isValueEqual = hasMatch_1;
          }
        });
      }
      return isValueEqual;
    }
    var OWNER = "_owner";
    var hasOwnProperty = Function.prototype.bind.call(Function.prototype.call, Object.prototype.hasOwnProperty);
    function areObjectsEqual(a, b, isEqual, meta) {
      var keysA = keys(a);
      var index = keysA.length;
      if (keys(b).length !== index) {
        return false;
      }
      if (index) {
        var key = undefined;
        while (index-- > 0) {
          key = keysA[index];
          if (key === OWNER) {
            var reactElementA = isReactElement(a);
            var reactElementB = isReactElement(b);
            if ((reactElementA || reactElementB) && reactElementA !== reactElementB) {
              return false;
            }
          }
          if (!hasOwnProperty(b, key) || !isEqual(a[key], b[key], key, key, a, b, meta)) {
            return false;
          }
        }
      }
      return true;
    }
    var areRegExpsEqual = function() {
      if (/foo/g.flags === "g") {
        return function areRegExpsEqual(a, b) {
          return a.source === b.source && a.flags === b.flags;
        };
      }
      return function areRegExpsEqualFallback(a, b) {
        return a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.unicode === b.unicode && a.sticky === b.sticky && a.lastIndex === b.lastIndex;
      };
    }();
    function areSetsEqual(a, b, isEqual, meta) {
      var isValueEqual = a.size === b.size;
      if (isValueEqual && a.size) {
        var matchedIndices_2 = {};
        a.forEach(function(aValue, aKey) {
          if (isValueEqual) {
            var hasMatch_2 = false;
            var matchIndex_1 = 0;
            b.forEach(function(bValue, bKey) {
              if (!hasMatch_2 && !matchedIndices_2[matchIndex_1]) {
                hasMatch_2 = isEqual(aValue, bValue, aKey, bKey, a, b, meta);
                if (hasMatch_2) {
                  matchedIndices_2[matchIndex_1] = true;
                }
              }
              matchIndex_1++;
            });
            isValueEqual = hasMatch_2;
          }
        });
      }
      return isValueEqual;
    }
    var HAS_MAP_SUPPORT = typeof Map === "function";
    var HAS_SET_SUPPORT = typeof Set === "function";
    var valueOf = Object.prototype.valueOf;
    function createComparator(createIsEqual) {
      var isEqual = typeof createIsEqual === "function" ? createIsEqual(comparator) : function(a, b, indexOrKeyA, indexOrKeyB, parentA, parentB, meta) {
        return comparator(a, b, meta);
      };
      function comparator(a, b, meta) {
        if (a === b) {
          return true;
        }
        if (a && b && typeof a === "object" && typeof b === "object") {
          if (isPlainObject(a) && isPlainObject(b)) {
            return areObjectsEqual(a, b, isEqual, meta);
          }
          var aShape = Array.isArray(a);
          var bShape = Array.isArray(b);
          if (aShape || bShape) {
            return aShape === bShape && areArraysEqual(a, b, isEqual, meta);
          }
          aShape = a instanceof Date;
          bShape = b instanceof Date;
          if (aShape || bShape) {
            return aShape === bShape && sameValueZeroEqual(a.getTime(), b.getTime());
          }
          aShape = a instanceof RegExp;
          bShape = b instanceof RegExp;
          if (aShape || bShape) {
            return aShape === bShape && areRegExpsEqual(a, b);
          }
          if (isPromiseLike(a) || isPromiseLike(b)) {
            return a === b;
          }
          if (HAS_MAP_SUPPORT) {
            aShape = a instanceof Map;
            bShape = b instanceof Map;
            if (aShape || bShape) {
              return aShape === bShape && areMapsEqual(a, b, isEqual, meta);
            }
          }
          if (HAS_SET_SUPPORT) {
            aShape = a instanceof Set;
            bShape = b instanceof Set;
            if (aShape || bShape) {
              return aShape === bShape && areSetsEqual(a, b, isEqual, meta);
            }
          }
          if (a.valueOf !== valueOf || b.valueOf !== valueOf) {
            return sameValueZeroEqual(a.valueOf(), b.valueOf());
          }
          return areObjectsEqual(a, b, isEqual, meta);
        }
        return a !== a && b !== b;
      }
      return comparator;
    }
    var deepEqual = createComparator();
    var shallowEqual = createComparator(function() {
      return sameValueZeroEqual;
    });
    var circularDeepEqual = createComparator(createCircularEqualCreator());
    var circularShallowEqual = createComparator(createCircularEqualCreator(sameValueZeroEqual));
    exports2.circularDeepEqual = circularDeepEqual;
    exports2.circularShallowEqual = circularShallowEqual;
    exports2.createCustomEqual = createComparator;
    exports2.deepEqual = deepEqual;
    exports2.sameValueZeroEqual = sameValueZeroEqual;
    exports2.shallowEqual = shallowEqual;
    Object.defineProperty(exports2, "__esModule", { value: true });
  });
});

// node_modules/moize/dist/moize.js
var require_moize = __commonJS((exports, module) => {
  (function(global, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require_micro_memoize(), require_fast_equals()) : typeof define === "function" && define.amd ? define(["micro-memoize", "fast-equals"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.moize = factory(global.memoize, global.fe));
  })(exports, function(memoize, fastEquals) {
    function _extends() {
      _extends = Object.assign ? Object.assign.bind() : function(target) {
        for (var i = 1;i < arguments.length; i++) {
          var source = arguments[i];
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
        return target;
      };
      return _extends.apply(this, arguments);
    }
    function _objectWithoutPropertiesLoose(source, excluded) {
      if (source == null)
        return {};
      var target = {};
      var sourceKeys = Object.keys(source);
      var key, i;
      for (i = 0;i < sourceKeys.length; i++) {
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0)
          continue;
        target[key] = source[key];
      }
      return target;
    }
    var DEFAULT_OPTIONS = {
      isDeepEqual: false,
      isPromise: false,
      isReact: false,
      isSerialized: false,
      isShallowEqual: false,
      matchesArg: undefined,
      matchesKey: undefined,
      maxAge: undefined,
      maxArgs: undefined,
      maxSize: 1,
      onExpire: undefined,
      profileName: undefined,
      serializer: undefined,
      updateCacheForKey: undefined,
      transformArgs: undefined,
      updateExpire: false
    };
    function combine() {
      for (var _len = arguments.length, functions = new Array(_len), _key = 0;_key < _len; _key++) {
        functions[_key] = arguments[_key];
      }
      return functions.reduce(function(f, g) {
        if (typeof f === "function") {
          return typeof g === "function" ? function() {
            f.apply(this, arguments);
            g.apply(this, arguments);
          } : f;
        }
        if (typeof g === "function") {
          return g;
        }
      });
    }
    function compose() {
      for (var _len2 = arguments.length, functions = new Array(_len2), _key2 = 0;_key2 < _len2; _key2++) {
        functions[_key2] = arguments[_key2];
      }
      return functions.reduce(function(f, g) {
        if (typeof f === "function") {
          return typeof g === "function" ? function() {
            return f(g.apply(this, arguments));
          } : f;
        }
        if (typeof g === "function") {
          return g;
        }
      });
    }
    function findExpirationIndex(expirations, key) {
      for (var index = 0;index < expirations.length; index++) {
        if (expirations[index].key === key) {
          return index;
        }
      }
      return -1;
    }
    function createFindKeyIndex(isEqual, isMatchingKey) {
      var areKeysEqual = typeof isMatchingKey === "function" ? isMatchingKey : function(cacheKey, key) {
        for (var index = 0;index < key.length; index++) {
          if (!isEqual(cacheKey[index], key[index])) {
            return false;
          }
        }
        return true;
      };
      return function(keys, key) {
        for (var keysIndex = 0;keysIndex < keys.length; keysIndex++) {
          if (keys[keysIndex].length === key.length && areKeysEqual(keys[keysIndex], key)) {
            return keysIndex;
          }
        }
        return -1;
      };
    }
    function mergeOptions(originalOptions, newOptions) {
      if (!newOptions || newOptions === DEFAULT_OPTIONS) {
        return originalOptions;
      }
      return _extends({}, originalOptions, newOptions, {
        onCacheAdd: combine(originalOptions.onCacheAdd, newOptions.onCacheAdd),
        onCacheChange: combine(originalOptions.onCacheChange, newOptions.onCacheChange),
        onCacheHit: combine(originalOptions.onCacheHit, newOptions.onCacheHit),
        transformArgs: compose(originalOptions.transformArgs, newOptions.transformArgs)
      });
    }
    function isMoized(fn) {
      return typeof fn === "function" && fn.isMoized;
    }
    function setName(fn, originalFunctionName, profileName) {
      try {
        var name = profileName || originalFunctionName || "anonymous";
        Object.defineProperty(fn, "name", {
          configurable: true,
          enumerable: false,
          value: "moized(" + name + ")",
          writable: true
        });
      } catch (_unused) {
      }
    }
    function clearExpiration(expirations, key, shouldRemove) {
      var expirationIndex = findExpirationIndex(expirations, key);
      if (expirationIndex !== -1) {
        clearTimeout(expirations[expirationIndex].timeoutId);
        if (shouldRemove) {
          expirations.splice(expirationIndex, 1);
        }
      }
    }
    function createTimeout(expirationMethod, maxAge2) {
      var timeoutId = setTimeout(expirationMethod, maxAge2);
      if (typeof timeoutId.unref === "function") {
        timeoutId.unref();
      }
      return timeoutId;
    }
    function createOnCacheAddSetExpiration(expirations, options, isEqual, isMatchingKey) {
      var maxAge2 = options.maxAge;
      return function onCacheAdd(cache, moizedOptions, moized) {
        var key = cache.keys[0];
        if (findExpirationIndex(expirations, key) === -1) {
          var expirationMethod = function expirationMethod() {
            var findKeyIndex = createFindKeyIndex(isEqual, isMatchingKey);
            var keyIndex = findKeyIndex(cache.keys, key);
            var value = cache.values[keyIndex];
            if (~keyIndex) {
              cache.keys.splice(keyIndex, 1);
              cache.values.splice(keyIndex, 1);
              if (typeof options.onCacheChange === "function") {
                options.onCacheChange(cache, moizedOptions, moized);
              }
            }
            clearExpiration(expirations, key, true);
            if (typeof options.onExpire === "function" && options.onExpire(key) === false) {
              cache.keys.unshift(key);
              cache.values.unshift(value);
              onCacheAdd(cache, moizedOptions, moized);
              if (typeof options.onCacheChange === "function") {
                options.onCacheChange(cache, moizedOptions, moized);
              }
            }
          };
          expirations.push({
            expirationMethod,
            key,
            timeoutId: createTimeout(expirationMethod, maxAge2)
          });
        }
      };
    }
    function createOnCacheHitResetExpiration(expirations, options) {
      return function onCacheHit(cache) {
        var key = cache.keys[0];
        var expirationIndex = findExpirationIndex(expirations, key);
        if (~expirationIndex) {
          clearExpiration(expirations, key, false);
          expirations[expirationIndex].timeoutId = createTimeout(expirations[expirationIndex].expirationMethod, options.maxAge);
        }
      };
    }
    function getMaxAgeOptions(expirations, options, isEqual, isMatchingKey) {
      var onCacheAdd = typeof options.maxAge === "number" && isFinite(options.maxAge) ? createOnCacheAddSetExpiration(expirations, options, isEqual, isMatchingKey) : undefined;
      return {
        onCacheAdd,
        onCacheHit: onCacheAdd && options.updateExpire ? createOnCacheHitResetExpiration(expirations, options) : undefined
      };
    }
    var statsCache = {
      anonymousProfileNameCounter: 1,
      isCollectingStats: false,
      profiles: {}
    };
    var hasWarningDisplayed = false;
    function clearStats(profileName) {
      if (profileName) {
        delete statsCache.profiles[profileName];
      } else {
        statsCache.profiles = {};
      }
    }
    function collectStats(isCollectingStats) {
      if (isCollectingStats === undefined) {
        isCollectingStats = true;
      }
      statsCache.isCollectingStats = isCollectingStats;
    }
    function createOnCacheAddIncrementCalls(options) {
      var profileName = options.profileName;
      return function() {
        if (profileName && !statsCache.profiles[profileName]) {
          statsCache.profiles[profileName] = {
            calls: 0,
            hits: 0
          };
        }
        statsCache.profiles[profileName].calls++;
      };
    }
    function createOnCacheHitIncrementCallsAndHits(options) {
      return function() {
        var profiles = statsCache.profiles;
        var profileName = options.profileName;
        if (!profiles[profileName]) {
          profiles[profileName] = {
            calls: 0,
            hits: 0
          };
        }
        profiles[profileName].calls++;
        profiles[profileName].hits++;
      };
    }
    function getDefaultProfileName(fn) {
      return fn.displayName || fn.name || "Anonymous " + statsCache.anonymousProfileNameCounter++;
    }
    function getUsagePercentage(calls, hits) {
      return calls ? (hits / calls * 100).toFixed(4) + "%" : "0.0000%";
    }
    function getStats(profileName) {
      if (!statsCache.isCollectingStats && !hasWarningDisplayed) {
        console.warn('Stats are not currently being collected, please run "collectStats" to enable them.');
        hasWarningDisplayed = true;
      }
      var profiles = statsCache.profiles;
      if (profileName) {
        if (!profiles[profileName]) {
          return {
            calls: 0,
            hits: 0,
            usage: "0.0000%"
          };
        }
        var profile = profiles[profileName];
        return _extends({}, profile, {
          usage: getUsagePercentage(profile.calls, profile.hits)
        });
      }
      var completeStats = Object.keys(statsCache.profiles).reduce(function(completeProfiles, profileName2) {
        completeProfiles.calls += profiles[profileName2].calls;
        completeProfiles.hits += profiles[profileName2].hits;
        return completeProfiles;
      }, {
        calls: 0,
        hits: 0
      });
      return _extends({}, completeStats, {
        profiles: Object.keys(profiles).reduce(function(computedProfiles, profileName2) {
          computedProfiles[profileName2] = getStats(profileName2);
          return computedProfiles;
        }, {}),
        usage: getUsagePercentage(completeStats.calls, completeStats.hits)
      });
    }
    function getStatsOptions(options) {
      return statsCache.isCollectingStats ? {
        onCacheAdd: createOnCacheAddIncrementCalls(options),
        onCacheHit: createOnCacheHitIncrementCallsAndHits(options)
      } : {};
    }
    var ALWAYS_SKIPPED_PROPERTIES = {
      arguments: true,
      callee: true,
      caller: true,
      constructor: true,
      length: true,
      name: true,
      prototype: true
    };
    function copyStaticProperties(originalFn, newFn, skippedProperties) {
      if (skippedProperties === undefined) {
        skippedProperties = [];
      }
      Object.getOwnPropertyNames(originalFn).forEach(function(property) {
        if (!ALWAYS_SKIPPED_PROPERTIES[property] && skippedProperties.indexOf(property) === -1) {
          var descriptor = Object.getOwnPropertyDescriptor(originalFn, property);
          if (descriptor.get || descriptor.set) {
            Object.defineProperty(newFn, property, descriptor);
          } else {
            newFn[property] = originalFn[property];
          }
        }
      });
    }
    function addInstanceMethods(memoized, _ref) {
      var expirations = _ref.expirations;
      var options = memoized.options;
      var findKeyIndex = createFindKeyIndex(options.isEqual, options.isMatchingKey);
      var moized = memoized;
      moized.clear = function() {
        var onCacheChange = moized._microMemoizeOptions.onCacheChange, cache = moized.cache;
        cache.keys.length = 0;
        cache.values.length = 0;
        if (onCacheChange) {
          onCacheChange(cache, moized.options, moized);
        }
        return true;
      };
      moized.clearStats = function() {
        clearStats(moized.options.profileName);
      };
      moized.get = function(key) {
        var transformKey = moized._microMemoizeOptions.transformKey, cache = moized.cache;
        var cacheKey = transformKey ? transformKey(key) : key;
        var keyIndex = findKeyIndex(cache.keys, cacheKey);
        return keyIndex !== -1 ? moized.apply(this, key) : undefined;
      };
      moized.getStats = function() {
        return getStats(moized.options.profileName);
      };
      moized.has = function(key) {
        var transformKey = moized._microMemoizeOptions.transformKey;
        var cacheKey = transformKey ? transformKey(key) : key;
        return findKeyIndex(moized.cache.keys, cacheKey) !== -1;
      };
      moized.keys = function() {
        return moized.cacheSnapshot.keys;
      };
      moized.remove = function(key) {
        var _moized$_microMemoize = moized._microMemoizeOptions, onCacheChange = _moized$_microMemoize.onCacheChange, transformKey = _moized$_microMemoize.transformKey, cache = moized.cache;
        var keyIndex = findKeyIndex(cache.keys, transformKey ? transformKey(key) : key);
        if (keyIndex === -1) {
          return false;
        }
        var existingKey = cache.keys[keyIndex];
        cache.keys.splice(keyIndex, 1);
        cache.values.splice(keyIndex, 1);
        if (onCacheChange) {
          onCacheChange(cache, moized.options, moized);
        }
        clearExpiration(expirations, existingKey, true);
        return true;
      };
      moized.set = function(key, value) {
        var { _microMemoizeOptions, cache, options: options2 } = moized;
        var { onCacheAdd, onCacheChange, transformKey } = _microMemoizeOptions;
        var cacheKey = transformKey ? transformKey(key) : key;
        var keyIndex = findKeyIndex(cache.keys, cacheKey);
        if (keyIndex === -1) {
          var cutoff = options2.maxSize - 1;
          if (cache.size > cutoff) {
            cache.keys.length = cutoff;
            cache.values.length = cutoff;
          }
          cache.keys.unshift(cacheKey);
          cache.values.unshift(value);
          if (options2.isPromise) {
            cache.updateAsyncCache(moized);
          }
          if (onCacheAdd) {
            onCacheAdd(cache, options2, moized);
          }
          if (onCacheChange) {
            onCacheChange(cache, options2, moized);
          }
        } else {
          var existingKey = cache.keys[keyIndex];
          cache.values[keyIndex] = value;
          if (keyIndex > 0) {
            cache.orderByLru(existingKey, value, keyIndex);
          }
          if (options2.isPromise) {
            cache.updateAsyncCache(moized);
          }
          if (typeof onCacheChange === "function") {
            onCacheChange(cache, options2, moized);
          }
        }
      };
      moized.values = function() {
        return moized.cacheSnapshot.values;
      };
    }
    function addInstanceProperties(memoized, _ref2) {
      var { expirations, options: moizeOptions, originalFunction } = _ref2;
      var microMemoizeOptions = memoized.options;
      Object.defineProperties(memoized, {
        _microMemoizeOptions: {
          configurable: true,
          get: function get() {
            return microMemoizeOptions;
          }
        },
        cacheSnapshot: {
          configurable: true,
          get: function get() {
            var currentCache = memoized.cache;
            return {
              keys: currentCache.keys.slice(0),
              size: currentCache.size,
              values: currentCache.values.slice(0)
            };
          }
        },
        expirations: {
          configurable: true,
          get: function get() {
            return expirations;
          }
        },
        expirationsSnapshot: {
          configurable: true,
          get: function get() {
            return expirations.slice(0);
          }
        },
        isMoized: {
          configurable: true,
          get: function get() {
            return true;
          }
        },
        options: {
          configurable: true,
          get: function get() {
            return moizeOptions;
          }
        },
        originalFunction: {
          configurable: true,
          get: function get() {
            return originalFunction;
          }
        }
      });
      var moized = memoized;
      copyStaticProperties(originalFunction, moized);
    }
    function createMoizeInstance(memoized, configuration) {
      addInstanceMethods(memoized, configuration);
      addInstanceProperties(memoized, configuration);
      return memoized;
    }
    var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for ? Symbol.for("react.element") : 60103;
    function createMoizedComponent(moizer, fn, options) {
      var reactMoizer = moizer(_extends({
        maxArgs: 2,
        isShallowEqual: true
      }, options, {
        isReact: false
      }));
      if (!fn.displayName) {
        fn.displayName = fn.name || "Component";
      }
      function Moized(props, context, updater) {
        this.props = props;
        this.context = context;
        this.updater = updater;
        this.MoizedComponent = reactMoizer(fn);
      }
      Moized.prototype.isReactComponent = {};
      Moized.prototype.render = function() {
        return {
          $$typeof: REACT_ELEMENT_TYPE,
          type: this.MoizedComponent,
          props: this.props,
          ref: null,
          key: null,
          _owner: null
        };
      };
      copyStaticProperties(fn, Moized, ["contextType", "contextTypes"]);
      Moized.displayName = "Moized(" + (fn.displayName || fn.name || "Component") + ")";
      setName(Moized, fn.name, options.profileName);
      return Moized;
    }
    function createGetInitialArgs(size) {
      return function(args) {
        if (size >= args.length) {
          return args;
        }
        if (size === 0) {
          return [];
        }
        if (size === 1) {
          return [args[0]];
        }
        if (size === 2) {
          return [args[0], args[1]];
        }
        if (size === 3) {
          return [args[0], args[1], args[2]];
        }
        var clone = [];
        for (var index = 0;index < size; index++) {
          clone[index] = args[index];
        }
        return clone;
      };
    }
    function getCutoff(array, value) {
      var length = array.length;
      for (var index = 0;index < length; ++index) {
        if (array[index] === value) {
          return index + 1;
        }
      }
      return 0;
    }
    function createDefaultReplacer() {
      var cache = [];
      var keys = [];
      return function defaultReplacer(key, value) {
        var type = typeof value;
        if (type === "function" || type === "symbol") {
          return value.toString();
        }
        if (typeof value === "object") {
          if (cache.length) {
            var thisCutoff = getCutoff(cache, this);
            if (thisCutoff === 0) {
              cache[cache.length] = this;
            } else {
              cache.splice(thisCutoff);
              keys.splice(thisCutoff);
            }
            keys[keys.length] = key;
            var valueCutoff = getCutoff(cache, value);
            if (valueCutoff !== 0) {
              return "[ref=" + (keys.slice(0, valueCutoff).join(".") || ".") + "]";
            }
          } else {
            cache[0] = value;
            keys[0] = key;
          }
          return value;
        }
        return "" + value;
      };
    }
    function getStringifiedArgument(arg) {
      var typeOfArg = typeof arg;
      return arg && (typeOfArg === "object" || typeOfArg === "function") ? JSON.stringify(arg, createDefaultReplacer()) : arg;
    }
    function defaultArgumentSerializer(args) {
      var key = "|";
      for (var index = 0;index < args.length; index++) {
        key += getStringifiedArgument(args[index]) + "|";
      }
      return [key];
    }
    function getSerializerFunction(options) {
      return typeof options.serializer === "function" ? options.serializer : defaultArgumentSerializer;
    }
    function getIsSerializedKeyEqual(cacheKey, key) {
      return cacheKey[0] === key[0];
    }
    function createOnCacheOperation(fn) {
      if (typeof fn === "function") {
        return function(_cacheIgnored, _microMemoizeOptionsIgnored, memoized) {
          return fn(memoized.cache, memoized.options, memoized);
        };
      }
    }
    function getIsEqual(options) {
      return options.matchesArg || options.isDeepEqual && fastEquals.deepEqual || options.isShallowEqual && fastEquals.shallowEqual || fastEquals.sameValueZeroEqual;
    }
    function getIsMatchingKey(options) {
      return options.matchesKey || options.isSerialized && getIsSerializedKeyEqual || undefined;
    }
    function getTransformKey(options) {
      return compose(options.isSerialized && getSerializerFunction(options), typeof options.transformArgs === "function" && options.transformArgs, typeof options.maxArgs === "number" && createGetInitialArgs(options.maxArgs));
    }
    function createRefreshableMoized(moized) {
      var updateCacheForKey = moized.options.updateCacheForKey;
      var refreshableMoized = function refreshableMoized() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0;_key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        if (!updateCacheForKey(args)) {
          return moized.apply(this, args);
        }
        var result = moized.fn.apply(this, args);
        moized.set(args, result);
        return result;
      };
      copyStaticProperties(moized, refreshableMoized);
      return refreshableMoized;
    }
    var _excluded = ["matchesArg", "isDeepEqual", "isPromise", "isReact", "isSerialized", "isShallowEqual", "matchesKey", "maxAge", "maxArgs", "maxSize", "onCacheAdd", "onCacheChange", "onCacheHit", "onExpire", "profileName", "serializer", "updateCacheForKey", "transformArgs", "updateExpire"];
    var moize = function moize(fn, passedOptions) {
      var options = passedOptions || DEFAULT_OPTIONS;
      if (isMoized(fn)) {
        var moizeable = fn.originalFunction;
        var mergedOptions = mergeOptions(fn.options, options);
        return moize(moizeable, mergedOptions);
      }
      if (typeof fn === "object") {
        return function(curriedFn, curriedOptions) {
          if (typeof curriedFn === "function") {
            var _mergedOptions = mergeOptions(fn, curriedOptions);
            return moize(curriedFn, _mergedOptions);
          }
          var mergedOptions2 = mergeOptions(fn, curriedFn);
          return moize(mergedOptions2);
        };
      }
      if (options.isReact) {
        return createMoizedComponent(moize, fn, options);
      }
      var coalescedOptions = _extends({}, DEFAULT_OPTIONS, options, {
        maxAge: typeof options.maxAge === "number" && options.maxAge >= 0 ? options.maxAge : DEFAULT_OPTIONS.maxAge,
        maxArgs: typeof options.maxArgs === "number" && options.maxArgs >= 0 ? options.maxArgs : DEFAULT_OPTIONS.maxArgs,
        maxSize: typeof options.maxSize === "number" && options.maxSize >= 0 ? options.maxSize : DEFAULT_OPTIONS.maxSize,
        profileName: options.profileName || getDefaultProfileName(fn)
      });
      var expirations = [];
      coalescedOptions.matchesArg;
      coalescedOptions.isDeepEqual;
      var isPromise = coalescedOptions.isPromise;
      coalescedOptions.isReact;
      coalescedOptions.isSerialized;
      coalescedOptions.isShallowEqual;
      coalescedOptions.matchesKey;
      coalescedOptions.maxAge;
      coalescedOptions.maxArgs;
      var { maxSize, onCacheAdd, onCacheChange, onCacheHit } = coalescedOptions;
      coalescedOptions.onExpire;
      coalescedOptions.profileName;
      coalescedOptions.serializer;
      var updateCacheForKey = coalescedOptions.updateCacheForKey;
      coalescedOptions.transformArgs;
      coalescedOptions.updateExpire;
      var customOptions = _objectWithoutPropertiesLoose(coalescedOptions, _excluded);
      var isEqual = getIsEqual(coalescedOptions);
      var isMatchingKey = getIsMatchingKey(coalescedOptions);
      var maxAgeOptions = getMaxAgeOptions(expirations, coalescedOptions, isEqual, isMatchingKey);
      var statsOptions = getStatsOptions(coalescedOptions);
      var transformKey = getTransformKey(coalescedOptions);
      var microMemoizeOptions = _extends({}, customOptions, {
        isEqual,
        isMatchingKey,
        isPromise,
        maxSize,
        onCacheAdd: createOnCacheOperation(combine(onCacheAdd, maxAgeOptions.onCacheAdd, statsOptions.onCacheAdd)),
        onCacheChange: createOnCacheOperation(onCacheChange),
        onCacheHit: createOnCacheOperation(combine(onCacheHit, maxAgeOptions.onCacheHit, statsOptions.onCacheHit)),
        transformKey
      });
      var memoized = memoize(fn, microMemoizeOptions);
      var moized = createMoizeInstance(memoized, {
        expirations,
        options: coalescedOptions,
        originalFunction: fn
      });
      if (updateCacheForKey) {
        moized = createRefreshableMoized(moized);
      }
      setName(moized, fn.name, options.profileName);
      return moized;
    };
    moize.clearStats = clearStats;
    moize.collectStats = collectStats;
    moize.compose = function() {
      return compose.apply(undefined, arguments) || moize;
    };
    moize.deep = moize({
      isDeepEqual: true
    });
    moize.getStats = getStats;
    moize.infinite = moize({
      maxSize: Infinity
    });
    moize.isCollectingStats = function isCollectingStats() {
      return statsCache.isCollectingStats;
    };
    moize.isMoized = function isMoized(fn) {
      return typeof fn === "function" && !!fn.isMoized;
    };
    moize.matchesArg = function(argMatcher) {
      return moize({
        matchesArg: argMatcher
      });
    };
    moize.matchesKey = function(keyMatcher) {
      return moize({
        matchesKey: keyMatcher
      });
    };
    function maxAge(maxAge2, expireOptions) {
      if (expireOptions === true) {
        return moize({
          maxAge: maxAge2,
          updateExpire: expireOptions
        });
      }
      if (typeof expireOptions === "object") {
        var { onExpire, updateExpire } = expireOptions;
        return moize({
          maxAge: maxAge2,
          onExpire,
          updateExpire
        });
      }
      if (typeof expireOptions === "function") {
        return moize({
          maxAge: maxAge2,
          onExpire: expireOptions,
          updateExpire: true
        });
      }
      return moize({
        maxAge: maxAge2
      });
    }
    moize.maxAge = maxAge;
    moize.maxArgs = function maxArgs(maxArgs) {
      return moize({
        maxArgs
      });
    };
    moize.maxSize = function maxSize(maxSize) {
      return moize({
        maxSize
      });
    };
    moize.profile = function(profileName) {
      return moize({
        profileName
      });
    };
    moize.promise = moize({
      isPromise: true,
      updateExpire: true
    });
    moize.react = moize({
      isReact: true
    });
    moize.serialize = moize({
      isSerialized: true
    });
    moize.serializeWith = function(serializer) {
      return moize({
        isSerialized: true,
        serializer
      });
    };
    moize.shallow = moize({
      isShallowEqual: true
    });
    moize.transformArgs = function(transformArgs) {
      return moize({
        transformArgs
      });
    };
    moize.updateCacheForKey = function(updateCacheForKey) {
      return moize({
        updateCacheForKey
      });
    };
    Object.defineProperty(moize, "default", {
      configurable: false,
      enumerable: false,
      value: moize,
      writable: false
    });
    return moize;
  });
});

// src/make-tag.ts
var import_moize = __toESM(require_moize());

// src/parser/parser.ts
var peggyParser = function() {
  function peg$subclass(child, parent) {
    function C() {
      this.constructor = child;
    }
    C.prototype = parent.prototype;
    child.prototype = new C;
  }
  function peg$SyntaxError(message, expected, found, location) {
    var self2 = Error.call(this, message);
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(self2, peg$SyntaxError.prototype);
    }
    self2.expected = expected;
    self2.found = found;
    self2.location = location;
    self2.name = "SyntaxError";
    return self2;
  }
  peg$subclass(peg$SyntaxError, Error);
  function peg$padEnd(str, targetLength, padString) {
    padString = padString || " ";
    if (str.length > targetLength) {
      return str;
    }
    targetLength -= str.length;
    padString += padString.repeat(targetLength);
    return str + padString.slice(0, targetLength);
  }
  peg$SyntaxError.prototype.format = function(sources) {
    var str = "Error: " + this.message;
    if (this.location) {
      var src = null;
      var k;
      for (k = 0;k < sources.length; k++) {
        if (sources[k].source === this.location.source) {
          src = sources[k].text.split(/\r\n|\n|\r/g);
          break;
        }
      }
      var s = this.location.start;
      var offset_s = this.location.source && typeof this.location.source.offset === "function" ? this.location.source.offset(s) : s;
      var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
      if (src) {
        var e = this.location.end;
        var filler = peg$padEnd("", offset_s.line.toString().length, " ");
        var line = src[s.line - 1];
        var last = s.line === e.line ? e.column : line.length + 1;
        var hatLen = last - s.column || 1;
        str += "\n --> " + loc + "\n" + filler + " |\n" + offset_s.line + " | " + line + "\n" + filler + " | " + peg$padEnd("", s.column - 1, " ") + peg$padEnd("", hatLen, "^");
      } else {
        str += "\n at " + loc;
      }
    }
    return str;
  };
  peg$SyntaxError.buildMessage = function(expected, found) {
    var DESCRIBE_EXPECTATION_FNS = {
      literal: function(expectation) {
        return "\"" + literalEscape(expectation.text) + "\"";
      },
      class: function(expectation) {
        var escapedParts = expectation.parts.map(function(part) {
          return Array.isArray(part) ? classEscape(part[0]) + "-" + classEscape(part[1]) : classEscape(part);
        });
        return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
      },
      any: function() {
        return "any character";
      },
      end: function() {
        return "end of input";
      },
      other: function(expectation) {
        return expectation.description;
      }
    };
    function hex(ch) {
      return ch.charCodeAt(0).toString(16).toUpperCase();
    }
    function literalEscape(s) {
      return s.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
        return "\\x0" + hex(ch);
      }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
        return "\\x" + hex(ch);
      });
    }
    function classEscape(s) {
      return s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
        return "\\x0" + hex(ch);
      }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
        return "\\x" + hex(ch);
      });
    }
    function describeExpectation(expectation) {
      return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
    }
    function describeExpected(expected2) {
      var descriptions = expected2.map(describeExpectation);
      var i, j;
      descriptions.sort();
      if (descriptions.length > 0) {
        for (i = 1, j = 1;i < descriptions.length; i++) {
          if (descriptions[i - 1] !== descriptions[i]) {
            descriptions[j] = descriptions[i];
            j++;
          }
        }
        descriptions.length = j;
      }
      switch (descriptions.length) {
        case 1:
          return descriptions[0];
        case 2:
          return descriptions[0] + " or " + descriptions[1];
        default:
          return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
      }
    }
    function describeFound(found2) {
      return found2 ? "\"" + literalEscape(found2) + "\"" : "end of input";
    }
    return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
  };
  function peg$parse(input, options) {
    options = options !== undefined ? options : {};
    var peg$FAILED = {};
    var peg$source = options.grammarSource;
    var peg$startRuleFunctions = { Expression: peg$parseExpression };
    var peg$startRuleFunction = peg$parseExpression;
    var peg$c0 = "+";
    var peg$c1 = "-";
    var peg$c2 = "*";
    var peg$c3 = "/";
    var peg$c4 = "(";
    var peg$c5 = ")";
    var peg$c6 = "$";
    var peg$r0 = /^[0-9]/;
    var peg$r1 = /^[ \t\n\r]/;
    var peg$e0 = peg$literalExpectation("+", false);
    var peg$e1 = peg$literalExpectation("-", false);
    var peg$e2 = peg$literalExpectation("*", false);
    var peg$e3 = peg$literalExpectation("/", false);
    var peg$e4 = peg$literalExpectation("(", false);
    var peg$e5 = peg$literalExpectation(")", false);
    var peg$e6 = peg$otherExpectation("integer");
    var peg$e7 = peg$literalExpectation("$", false);
    var peg$e8 = peg$classExpectation([["0", "9"]], false, false);
    var peg$e9 = peg$otherExpectation("whitespace");
    var peg$e10 = peg$classExpectation([" ", "\t", "\n", "\r"], false, false);
    var peg$f0 = function(head, tail) {
      return (args) => tail.reduce((result, element) => options.operators.binary[element[1]](result, element[3](args)), head(args));
    };
    var peg$f1 = function(head, tail) {
      return (args) => tail.reduce((result, element) => options.operators.binary[element[1]](result, element[3](args)), head(args));
    };
    var peg$f2 = function(expr) {
      return expr;
    };
    var peg$f3 = function() {
      const index = parseInt(text().replace("$", ""), 10);
      return (args) => args[index];
    };
    var peg$currPos = 0;
    var peg$savedPos = 0;
    var peg$posDetailsCache = [{ line: 1, column: 1 }];
    var peg$maxFailPos = 0;
    var peg$maxFailExpected = [];
    var peg$silentFails = 0;
    var peg$result;
    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }
      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }
    function text() {
      return input.substring(peg$savedPos, peg$currPos);
    }
    function offset() {
      return peg$savedPos;
    }
    function range() {
      return {
        source: peg$source,
        start: peg$savedPos,
        end: peg$currPos
      };
    }
    function location() {
      return peg$computeLocation(peg$savedPos, peg$currPos);
    }
    function expected(description, location2) {
      location2 = location2 !== undefined ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
      throw peg$buildStructuredError([peg$otherExpectation(description)], input.substring(peg$savedPos, peg$currPos), location2);
    }
    function error(message, location2) {
      location2 = location2 !== undefined ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
      throw peg$buildSimpleError(message, location2);
    }
    function peg$literalExpectation(text2, ignoreCase) {
      return { type: "literal", text: text2, ignoreCase };
    }
    function peg$classExpectation(parts, inverted, ignoreCase) {
      return { type: "class", parts, inverted, ignoreCase };
    }
    function peg$anyExpectation() {
      return { type: "any" };
    }
    function peg$endExpectation() {
      return { type: "end" };
    }
    function peg$otherExpectation(description) {
      return { type: "other", description };
    }
    function peg$computePosDetails(pos) {
      var details = peg$posDetailsCache[pos];
      var p;
      if (details) {
        return details;
      } else {
        p = pos - 1;
        while (!peg$posDetailsCache[p]) {
          p--;
        }
        details = peg$posDetailsCache[p];
        details = {
          line: details.line,
          column: details.column
        };
        while (p < pos) {
          if (input.charCodeAt(p) === 10) {
            details.line++;
            details.column = 1;
          } else {
            details.column++;
          }
          p++;
        }
        peg$posDetailsCache[pos] = details;
        return details;
      }
    }
    function peg$computeLocation(startPos, endPos, offset2) {
      var startPosDetails = peg$computePosDetails(startPos);
      var endPosDetails = peg$computePosDetails(endPos);
      var res = {
        source: peg$source,
        start: {
          offset: startPos,
          line: startPosDetails.line,
          column: startPosDetails.column
        },
        end: {
          offset: endPos,
          line: endPosDetails.line,
          column: endPosDetails.column
        }
      };
      if (offset2 && peg$source && typeof peg$source.offset === "function") {
        res.start = peg$source.offset(res.start);
        res.end = peg$source.offset(res.end);
      }
      return res;
    }
    function peg$fail(expected2) {
      if (peg$currPos < peg$maxFailPos) {
        return;
      }
      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }
      peg$maxFailExpected.push(expected2);
    }
    function peg$buildSimpleError(message, location2) {
      return new peg$SyntaxError(message, null, null, location2);
    }
    function peg$buildStructuredError(expected2, found, location2) {
      return new peg$SyntaxError(peg$SyntaxError.buildMessage(expected2, found), expected2, found, location2);
    }
    function peg$parseExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parseTerm();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 43) {
          s5 = peg$c0;
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e0);
          }
        }
        if (s5 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 45) {
            s5 = peg$c1;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e1);
            }
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse_();
          s7 = peg$parseTerm();
          if (s7 !== peg$FAILED) {
            s4 = [s4, s5, s6, s7];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 43) {
            s5 = peg$c0;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e0);
            }
          }
          if (s5 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 45) {
              s5 = peg$c1;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e1);
              }
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            s7 = peg$parseTerm();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s0 = peg$f0(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseTerm() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parseFactor();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 42) {
          s5 = peg$c2;
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e2);
          }
        }
        if (s5 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 47) {
            s5 = peg$c3;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e3);
            }
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse_();
          s7 = peg$parseFactor();
          if (s7 !== peg$FAILED) {
            s4 = [s4, s5, s6, s7];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 42) {
            s5 = peg$c2;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e2);
            }
          }
          if (s5 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 47) {
              s5 = peg$c3;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e3);
              }
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            s7 = peg$parseFactor();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s0 = peg$f1(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseFactor() {
      var s0, s1, s2, s3, s4, s5;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c4;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e4);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        s3 = peg$parseExpression();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 41) {
            s5 = peg$c5;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e5);
            }
          }
          if (s5 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f2(s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseInteger();
      }
      return s0;
    }
    function peg$parseInteger() {
      var s0, s1, s2, s3, s4;
      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parse_();
      if (input.charCodeAt(peg$currPos) === 36) {
        s2 = peg$c6;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e7);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        if (peg$r0.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e8);
          }
        }
        if (s4 !== peg$FAILED) {
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            if (peg$r0.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e8);
              }
            }
          }
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f3();
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e6);
        }
      }
      return s0;
    }
    function peg$parse_() {
      var s0, s1;
      peg$silentFails++;
      s0 = [];
      if (peg$r1.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e10);
        }
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        if (peg$r1.test(input.charAt(peg$currPos))) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e10);
          }
        }
      }
      peg$silentFails--;
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e9);
      }
      return s0;
    }
    peg$result = peg$startRuleFunction();
    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail(peg$endExpectation());
      }
      throw peg$buildStructuredError(peg$maxFailExpected, peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null, peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos));
    }
  }
  return {
    SyntaxError: peg$SyntaxError,
    parse: peg$parse
  };
}();
peggyParser.SyntaxError.prototype.name = "PeggySyntaxError";
var parse = peggyParser.parse;
var PeggySyntaxError = peggyParser.SyntaxError;

// src/make-tag.ts
var validate = (tagStrings) => {
  if (tagStrings.length <= 0) {
    return new Error("Template string must contain at least one string");
  }
  for (let i = 0;i < tagStrings.length; i++) {
    if (tagStrings[i].includes("$")) {
      return new Error("Template string cannot contain $");
    }
  }
  return null;
};
var parse2 = (tagStrings, operators) => {
  const error = validate(tagStrings);
  if (error) {
    throw error;
  }
  const [first, ...tail] = tagStrings;
  const stringToParse = tail.reduce((acc, cur, index) => `${acc}\$${index}${cur}`, first);
  console.log("stringToParse", stringToParse);
  return parse(stringToParse, { operators });
};
var memoizedParse = import_moize.default(parse2);
var makeTag = ({ operators }) => {
  const tag = (tagStrings, ...args) => {
    const parsedResult = memoizedParse(tagStrings, operators);
    return parsedResult(args);
  };
  return tag;
};
export {
  makeTag
};
