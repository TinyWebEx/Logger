import "https://unpkg.com/mocha@5.2.0/mocha.js"; /* globals mocha */
import "https://unpkg.com/chai@4.1.2/chai.js"; /* globals chai */
import "https://unpkg.com/sinon@6.1.5/pkg/sinon.js"; /* globals sinon */

import * as AddonSettingsStub from "../../AddonSettings/tests/helper/AddonSettingsStub.js";

import {MESSAGE_LEVEL} from "../../data/MessageLevel.js";
import * as Logger from "../Logger.js";
import * as RealConsole from "../internal/RealConsole.js";

const LOG_PREFIX = Object.freeze({
    INFO: sinon.match(/\[INFO\]$/),
    WARN: sinon.match(/\[WARN\]$/),
    ERROR: sinon.match(/\[ERROR\]$/)
});

describe("common module: Logger", function () {
    beforeEach(function() {
        // reset debug mode to initial value
        Logger.setDebugMode(null);
    });
    afterEach(function() {
        sinon.restore();
    });

    /**
     * Verify the debug mode setting.
     *
     * @private
     * @function
     * @param {function} mockConsole the sinon mock of the window.console object
     * @param {function} consoleMockTest the test to run for the mock
     * @returns {void}
     */
    function testDebugModeSetting(mockConsole, consoleMockTest) {
        const logMessage = Symbol("log message");

        consoleMockTest(mockConsole, logMessage);

        Logger.logInfo(logMessage);

        mockConsole.verify();
    }

    /**
     * Verify the debug mode is enabled.
     *
     * @function
     * @param {function} mockConsole the sinon mock of the window.console object
     * @param {any} logMessage the log message I am expected to see
     * @returns {Promise}
     */
    function expectDebugModeEnabled(mockConsole, logMessage) {
        mockConsole.expects("log").once().withExactArgs(LOG_PREFIX.INFO, logMessage);
    }

    /**
     * Verify the debug mode is disabled.
     *
     * @function
     * @param {function} mockConsole the sinon mock of the window.console object
     * @returns {Promise}
     */
    function expectDebugModeDisabled(mockConsole) {
        // should never call console.log()
        mockConsole.expects("log").never();
    }

    /**
     * Test that the log method is correctly called.
     *
     * @private
     * @function
     * @param {string} prefixName the log method to test
     * @param {function} testFunction the function under test, get's passed the log message
     * @returns {Promise}
     */
    async function testLogIsCalled(prefixName, testFunction) {
        let consoleMethod = prefixName.toLowerCase();
        if (consoleMethod === "info") {
            consoleMethod = "log";
        }

        const logMessage = Symbol("log message");
        const mockConsole = sinon.mock(console);

        mockConsole.expects(consoleMethod)
            .once().withExactArgs(LOG_PREFIX[prefixName], logMessage);

        await RealConsole.setToDefaults(); // to apply mock/stub
        testFunction(logMessage);

        mockConsole.verify();
    }

    describe("init()", function () {
        before(function () {
            AddonSettingsStub.before();
        });

        beforeEach(function() {
            AddonSettingsStub.stubAllStorageApis();
        });

        afterEach(function() {
            sinon.restore();
            AddonSettingsStub.afterTest();
        });

        it("loads debugMode setting if disabled", async function () {
            AddonSettingsStub.stubSettings({
                "debugMode": false
            });

            const mockConsole = sinon.mock(console);

            // load setting
            await Logger.init();

            return testDebugModeSetting(mockConsole, async (...args) => {
                expectDebugModeDisabled(...args);
                await RealConsole.setToDefaults(); // to apply mock/stub
            });
        });

        it("loads debugMode setting if enabled", async function () {
            AddonSettingsStub.stubSettings({
                "debugMode": true
            });

            const mockConsole = sinon.mock(console);

            // load setting
            await Logger.init();

            return testDebugModeSetting(mockConsole, async (...args) => {
                expectDebugModeEnabled(...args);
                await RealConsole.setToDefaults(); // to apply mock/stub
            });
        });
    });

    describe("setDebugMode()", function () {
        it("correctly sets debug mode to enabled", function () {
            Logger.setDebugMode(true);

            const mockConsole = sinon.mock(console);

            return testDebugModeSetting(mockConsole, async (...args) => {
                expectDebugModeEnabled(...args);
                await RealConsole.setToDefaults(); // to apply mock/stub
            });
        });

        it("correctly sets debug mode to disabled", function () {
            Logger.setDebugMode(false);

            const mockConsole = sinon.mock(console);

            return testDebugModeSetting(mockConsole, async (...args) => {
                expectDebugModeDisabled(...args);
                await RealConsole.setToDefaults(); // to apply mock/stub
            });
        });
    });

    /**
     * Tests that the passed log function behaves correctly cwhen logging options.
     *
     * The function is always called with the parameters to log, only. So when
     * you test .log(), you need to .bind it.
     *
     * @private
     * @function
     * @param {string} logMethod the console.<??> method that is expected to
     *                           be called
     * @param {function} logFunctionCall the log function to test
     * @returns {Promise}
     */
    function testlogObject(logMethod, logFunctionCall) {
        it("logs multiple objects", async function () {
            const param1 = Symbol("start log message");
            const param2 = "a great string";
            const param3 = {
                and: "an object, because we like",
                integers: 123
            };

            const mockConsole = sinon.mock(console);

            mockConsole.expects(logMethod)
                .once().withExactArgs(sinon.match.any, param1, param2, param3);

            await RealConsole.setToDefaults(); // to apply mock/stub
            // test function
            logFunctionCall(param1, param2, param3);

            mockConsole.verify();
        });

        it("correctly freezes objects", async function () {
            const logMessageExpected = {
                and: "an object, because we like",
                integers: 123
            };

            const spyLog = sinon.spy(console, logMethod);

            // copy object (we do not test with nested objects here, so Object.assign doing a shallow copy is fine)
            const logMessageModify = Object.assign({}, logMessageExpected);

            await RealConsole.setToDefaults(); // to apply mock/stub
            logFunctionCall(logMessageModify);

            // modify object
            logMessageModify.and = "modify object";
            logMessageModify.integers = 234;

            // now verify passed argument manually
            chai.assert.deepEqual(
                spyLog.args[0][1], // verify second argument of first call
                logMessageExpected, // it should ignore the modifications done to the object
                "did not ignore changed object properties/freeze object");
        });
    }

    describe("log()", function () {
        it("logs, if called without params", async function () {
            const mockConsole = sinon.mock(window.console);

            mockConsole.expects("error")
                .once().withExactArgs(LOG_PREFIX.ERROR, "log has been called without parameters");

            // test function
            await RealConsole.setToDefaults(); // to apply mock/stub
            Logger.log();

            mockConsole.verify();
        });

        testlogObject("log", Logger.log.bind(null, MESSAGE_LEVEL.INFO)); // eslint-disable-line mocha/no-setup-in-describe

        it("still logs info, if debug mode is not yet loaded", function () {
            Logger.setDebugMode(true);

            const mockConsole = sinon.mock(console);

            // note it is not explicitly enabled, but internally set to "null"
            return testDebugModeSetting(mockConsole, async (...args) => {
                expectDebugModeEnabled(...args);
                await RealConsole.setToDefaults(); // to apply mock/stub
            });
        });

        it("uses correct prefix for different error levels", function () {
            Logger.setDebugMode(true);

            const allPromises = [];
            for (const prefixName of Object.keys(LOG_PREFIX)) {
                const promise = testLogIsCalled(prefixName, (logMessage) => {
                    Logger.log(MESSAGE_LEVEL[prefixName], logMessage);
                });
                allPromises.push(promise);
            }

            return Promise.all(allPromises);
        });
    });

    describe("logInfo()", function () {
        it("calls .log(MESSAGE_LEVEL.INFO)", function () {
            Logger.setDebugMode(true);

            return testLogIsCalled("INFO", (logMessage) => {
                Logger.logInfo(logMessage);
            });
        });

        testlogObject("log", Logger.logInfo); // eslint-disable-line mocha/no-setup-in-describe
    });

    describe("logWarn()", function () {
        it("calls .log(MESSAGE_LEVEL.WARN)", function () {
            return testLogIsCalled("WARN", (logMessage) => {
                Logger.logWarning(logMessage);
            });
        });

        testlogObject("warn", Logger.logWarning); // eslint-disable-line mocha/no-setup-in-describe
    });

    describe("logError()", function () {
        it("calls .log(MESSAGE_LEVEL.ERROR)", function () {
            return testLogIsCalled("ERROR", (logMessage) => {
                Logger.logError(logMessage);
            });
        });

        testlogObject("error", Logger.logError); // eslint-disable-line mocha/no-setup-in-describe
    });
});
