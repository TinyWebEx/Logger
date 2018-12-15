/**
 * Overwrites the console.log, .info, .debug etc. functions, so you don't
 * explicitly have to import this module.
 *
 * It is recommend to include this module in a "async" way, so it is loaded
 * before all others.
 *
 * @requires ./Logger
 */

import * as RealConsole from "./internal/RealConsole.js";
import * as Logger from "./Logger.js";

// backlup old console statements
const backupConsoleLog = window.console.log.bind(window.console);
const backupConsoleWarn = window.console.warn.bind(window.console);
const backupConsoleError = window.console.error.bind(window.console);

RealConsole.setLog(backupConsoleLog);
RealConsole.setWarn(backupConsoleWarn);
RealConsole.setError(backupConsoleError);

window.console.log = function(...args) {
    return Logger.logInfo(...args);
};
window.console.debug = function(...args) {
    return Logger.logInfo(...args);
};
window.console.info = function(...args) {
    return Logger.logInfo(...args);
};

window.console.warn = function(...args) {
    return Logger.logWarning(...args);
};
window.console.error = function(...args) {
    return Logger.logError(...args);
};

// only in some very specific this may work, so we rather leave it as it is
// window.onerror = function(...args) {
//     return Logger.logError(...args);
// };
