/**
 * Wraps the "real" console.log/info etc values.
 *
 */

/**
 * The function console.log().
 *
 * May be overriden, in case you already overwrote console.log.
 *
 * @protected
 * @type {function}
 */
export let log;

/**
 * The function console.warn().
 *
 * May be overriden, in case you already overwrote console.warn.
 *
 * @protected
 * @type {function}
 */
export let warn;

/**
 * The function console.error().
 *
 * May be overriden, in case you already overwrote console.error.
 *
 * @protected
 * @type {function}
 */
export let error;

/**
 * The setter function for {@see log}.
 *
 * @protected
 * @param {function} boundFunction
 * @returns {void}
 */
export function setLog(boundFunction) {
    log = boundFunction;
}

/**
 * The setter function for {@see warn}.
 *
 * @protected
 * @param {function} boundFunction
 * @returns {void}
 */
export function setWarn(boundFunction) {
    warn = boundFunction;
}

/**
 * The setter function for {@see error}.
 *
 * @protected
 * @param {function} boundFunction
 * @returns {void}
 */
export function setError(boundFunction) {
    error = boundFunction;
}

/**
 * Sets all console values to the defaults, i.e. console.log, .warn etc.
 *
 * @protected
 * @returns {void}
 */
export function setToDefaults() {
    setLog(console.log);
    setWarn(console.warn);
    setError(console.error);
}
