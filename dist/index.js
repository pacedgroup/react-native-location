"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nativeInterface_1 = require("./lib/nativeInterface");
var subscriptions_1 = require("./lib/subscriptions");
var utils_1 = require("./utils");
var _a = nativeInterface_1.default.get(), 
/**
 * @ignore
 */
nativeInterface = _a.nativeInterface, 
/**
 * @ignore
 */
eventEmitter = _a.eventEmitter;
/**
 * The subscription helper. Only for internal use.
 * @ignore
 */
var subscriptions;
/**
 * Internal method to configure the helps. Useful for Jet testing.
 *
 * @ignore
 * @param {RNLocationNativeInterface} ni Native interface
 * @param {EventEmitter} evt Event emitter
 * @returns {void}
 */
exports._configureHelpers = function (ni, evt) {
    nativeInterface = ni;
    eventEmitter = evt;
    subscriptions = new subscriptions_1.default(nativeInterface, eventEmitter);
    eventEmitter.addListener("onWarning", function (opts) {
        console.warn("react-native-location warning:", opts);
    });
};
exports._configureHelpers(nativeInterface, eventEmitter);
/**
 * This is used to configure the location provider. You can use this to enable background mode, filter location updates to a certain distance change, and ensure you have the power settings set correctly for your use case.
 *
 * You can call `configure` multiple times at it will only change the setting which you pass to it. For example, if you only want to change `activityType`, you can call `configure` with just that property present.
 *
 * @param {ConfigureOptions} options The configuration options.
 * @returns {Promise<void>} A Promise which resolves when the configuration is completed.
 */
exports.configure = function (options) {
    return nativeInterface.configure(options);
};
/**
 * Subscribe to location changes with the given listener. Ensure you have the correct permission before calling this method. The location provider will respect the settings you have given it.
 *
 * @param  {LocationCallback} listener The listener which will be called when the user location changes.
 * @returns {Subscription} The subscription function which can be used to unsubscribe.
 */
exports.subscribeToLocationUpdates = function (listener) {
    return subscriptions.subscribeToLocationUpdates(listener);
};
/**
 * Get the latest location. Ensure you have the correct permission before calling this method.
 *
 * This will subscribe to location events for you at the unsubscribe when it gets its first valid location. Usually, this method will return very fast with a possibly out of date location, however, in some circumstances it will not return a location. Therefore, this method has a timeout after which the promise will be resovled with `null` value.
 *
 * The location provider will respect the settings you have given it, so if you need a location with a certain accuracy, ensure you call `RNLocation.configure` first. If you want *any* location then ensure you call `RNLocation.configure` with no distance filter.
 *
 * @param {GetLatestLocationOptions} options The options to use when getting the location.
 * @returns {Promise<Location | null>} A Promise which will resolve to the latest location, or to `null` if the timeout is reached.
 */
exports.getLatestLocation = function (options) {
    if (options === void 0) { options = {}; }
    var locationPromise = new Promise(function (resolve) {
        var unsubscribe = subscriptions.subscribeToLocationUpdates(function (locations) {
            if (locations.length === 0) {
                return;
            }
            // Sort the locations with the most recent first
            var sortedLocations = locations.sort(function (a, b) { return b.timestamp - a.timestamp; });
            // Unsubscribe from future updates
            if (unsubscribe) {
                unsubscribe();
            }
            // Resolve the promise with the latest location
            resolve(sortedLocations[0]);
        });
    });
    // The user has explicitly turned off the timeout so return the promise directly
    if (options.timeout === null) {
        return locationPromise;
    }
    // Setup the timeout with a default value if one was not supplied
    var timeout = options.timeout || 10000;
    return utils_1.promiseTimeoutResolveNull(timeout, locationPromise);
};
/**
 * Subscribe to heading changes with the given listener. Ensure you have the correct permission before calling this method. The location provider will respect the settings you have given it.
 *
 * @param  {LocationCallback} listener The listener which will be called when the heading changes.
 * @returns {Subscription} The subscription function which can be used to unsubscribe.
 */
exports.subscribeToHeadingUpdates = function (listener) {
    return subscriptions.subscribeToHeadingUpdates(listener);
};
/**
 * Subscribe to significant updates to the users location with the given listener.
 *
 * **This method does not take into account the {@link distanceFilter} which you configured RNLocation with**.
 *
 * In most cases, you should call {@link configure} with the correct settings and then use {@link subscribeToLocationUpdates} to subscribe to the location updates. For more details, take a look at [Apple's documentation](https://developer.apple.com/documentation/corelocation/cllocationmanager/1423531-startmonitoringsignificantlocati?language=objc).
 *
 * @param  {LocationCallback} listener The listener which will be called when the user location significantly changes.
 * @returns {Subscription} The subscription function which can be used to unsubscribe.
 */
exports.subscribeToSignificantLocationUpdates = function (listener) {
    return subscriptions.subscribeToSignificantLocationUpdates(listener);
};
exports.default = {
    configure: exports.configure,
    subscribeToLocationUpdates: exports.subscribeToLocationUpdates,
    getLatestLocation: exports.getLatestLocation,
    subscribeToHeadingUpdates: exports.subscribeToHeadingUpdates,
    subscribeToSignificantLocationUpdates: exports.subscribeToSignificantLocationUpdates,
    // Internal use only
    _configureHelpers: exports._configureHelpers,
    _nativeInterface: nativeInterface,
    _eventEmitter: eventEmitter
};
/**
 * @callback LocationPermissionStatusCallback
 * @param {LocationPermissionStatus} status The new permission status.
 */
/**
 * @callback LocationCallback
 * @param {Location} location The new user location.
 */
//# sourceMappingURL=index.js.map