/**
 * Wrapper around console functions for logging messages, erros etc.
 *
 * @public
 * @module Logger
 * @requires ../data/MessageLevel
 * @requires ../data/GlobalConsts
 * @requires ../AddonSettings
 * @requires Logger/RealConsole
 */
import { MESSAGE_LEVEL } from "../data/MessageLevel.js";
import { ADDON_NAME_SHORT } from "../data/GlobalConsts.js";

import * as AddonSettings from "../AddonSettings/AddonSettings.js";
import * as RealConsole from "./internal/RealConsole.js";

import isPlainObject from "../lodash/isPlainObject.js";

let debugMode = null;

const MESSAGE_LEVEL_NAME = Object.freeze({
    [MESSAGE_LEVEL.ERROR]: "ERROR",
    [MESSAGE_LEVEL.WARN]: "WARN",
    [MESSAGE_LEVEL.INFO]: "INFO",
    [MESSAGE_LEVEL.LOADING]: "LOADING",
    [MESSAGE_LEVEL.SUCCESS]: "SUCCESS"
});

/**
 * Freeze (nested) objects to ensure a proper output.
 *
 * @private
 * @param  {array} args
 * @returns {Object}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Console/log#Logging_objects}
 */
function prepareObjectsForLogging(args) {
    for (const [index, value] of args.entries()) {
        if (isPlainObject(value)) {
            args[index] = JSON.parse(JSON.stringify(value));
        }
    }
    return args;
}

/**
 * Logs a string to console.
 *
 * Pass as many strings/output as you want.
 * For brevity, better prefer the other functions (logError, etc.) instead
 * of this one.
 *
 * @public
 * @param  {MESSAGE_LEVEL} messagetype
 * @param  {...*} args
 * @returns {void}
 */
export function log(...args) {
    if (arguments.length <= 0) {
        // recursive call, it's secure, because this won't fail
        log(MESSAGE_LEVEL.ERROR, "log has been called without parameters");
        return;
    }

    const messagetype = args[0];
    args[0] = `${ADDON_NAME_SHORT} [${MESSAGE_LEVEL_NAME[messagetype]}]`;

    args = prepareObjectsForLogging(args);

    /* eslint-disable no-console */
    switch (messagetype) {
    case MESSAGE_LEVEL.ERROR:
        RealConsole.error(...args);
        break;
    case MESSAGE_LEVEL.WARN:
        RealConsole.warn(...args);
        break;
    default:
        RealConsole.log(...args);
    }
    /* eslint-enable no-console */
}

/**
 * Logs a fatal error.
 *
 * @public
 * @param  {...*} args
 * @returns {void}
 */
export function logError(...args) {
    args.unshift(MESSAGE_LEVEL.ERROR);

    log(...args);
}

/**
 * Logs a warning.
 *
 * @public
 * @param  {...*} args
 * @returns {void}
 */
export function logWarning(...args) {
    args.unshift(MESSAGE_LEVEL.WARN);

    log(...args);
}

/**
 * Logs some information.
 *
 * Note: This log may be skipped, when not in debug mode.
 *
 * @public
 * @param  {...*} args
 * @returns {void}
 */
export function logInfo(...args) {
    // skip log only, when deliberately disabled!
    // NOTE: The effect of this is, that when the settings are not yet
    // loaded, we always log all messages. However, we also cannot wait/delay
    // loading these in some asyncronous way as log messages are time-critical
    // and must be in the correct order to be useful output.
    if (debugMode === false) {
        return;
    }

    args.unshift(MESSAGE_LEVEL.INFO);

    log(...args);
}

/**
 * Enable or disable the debug mode.
 *
 * @public
 * @param  {boolean} isDebug
 * @returns {void}
 */
export function setDebugMode(isDebug) {
    debugMode = isDebug;
}

/**
 * Inits some information.
 *
 * @public
 * @returns {Promise}
 */
export function init() {
    RealConsole.setToDefaults();

    return AddonSettings.get("debugMode").then((isDebug) => {
        setDebugMode(isDebug);
    });
}

// init module automatically
init().then(() => {
    logInfo("Logger module loaded.");
});
