'use strict';

/**
 * @constructor MojoSpy
 * @author Jonathan Eiten
 * @license MIT
 *
 * Instantiating a `MojoSpy` object lets you spy on a particular method:
 * * Observe how many times the method was called (records the particular parameters for each call)
 * * Call through to the method
 * * Call through to a mock function instead (which can the call through on its own)
 *
 * The above options are switchable. By default for testing purposes,
 * call history is ON but call through is OFF.
 *
 * @param {object} object - Object containing a method `methodName` to spy on.
 * @param {string} methodName - The name of the method in `object` to spy on.
 */
function MojoSpy(object, methodName) {
    var method = object[methodName];

    if (typeof method !== 'function') {
        throw 'Cannot spy on a non-function!';
    }

    var self = this;
    function spy() {
        var args = Array.prototype.slice.call(arguments);
        if (self.isRecording) {
            self.callHistory.push(args);
        }
        if (self.callThru) {
            var callThru = typeof self.callThru === 'function' ? self.callThru : method;
            callThru.apply(this, args);
        }
    }

    object[methodName] = spy;

    this.object = object;
    this.methodName = methodName;
    this.method = method;

    this.reset();
}

MojoSpy.prototype = {

    /**
     * @abstract
     * @name callThru
     * @type {boolean|function}
     * @default false
     * @summary Whether to call through
     * @desc The three options are:
     * * `true` - call the original (spied-upon) method
     * * a mock - call a mock instead
     * * `false` - do not call anything
     *
     * A mock can call the original method by calling:
     *
     * `spy.method.apply(this, Array.prototype.slice.call(arguments));`
     *
     * Note that the context in the above (`this` and `arguments`) is the mock function body.
     *
     * @memberOf MojoSpy.prototype
     */

    /**
     * @abstract
     * @name isRecording
     * @type {boolean}
     * @default true
     * @summary Whether or not to record calls to the original method.
     * @desc If truthy, calls to the original method are recorded in `this.callHistory`.
     * @see {@link MojoSpy|on} shorthand to turn historical recording **ON**.
     * @see {@link MojoSpy|off} shorthand to turn historical recording **OFF**.
     * @memberOf MojoSpy.prototype
     */

    /**
     * @abstract
     * @name callHistory
     * @type {Array.Array}
     * @default []
     * @summary List of call arguments as arrays.
     * @desc These are the `arguments` objects from each call, converted to true `Array` objects.
     * @memberOf MojoSpy.prototype
     */

    /**
     * @summary Resets options.
     * @desc This method resets the options to their default values:
     * * Record calling history
     * * Block call-throughs
     * * Empty the history list
     *
     * Note: This method does not disentangle the spy.
     * @param object
     * @param methodName
     * @memberOf MojoSpy.prototype
     */
    reset: function () {
        this.on();
        this.callThru = false;
        this.clear();
    },

    /**
     * @summary Resets the call history to an empty list.
     * @memberOf MojoSpy.prototype
     */
    clear: function () {
        this.callHistory = [];
    },

    /**
     * @summary Turns historical recording *ON*.
     * @memberOf MojoSpy.prototype
     */
    on: function () {
        this.isRecording = true;
    },

    /**
     * @summary Turns historical recording *OFF*.
     * @memberOf MojoSpy.prototype
     */
    off: function () {
        this.isRecording = false;
    },

    /**
     * @summary Removes the spy code from the original method.
     * @summary synonym: `close()`
     * @desc The spied-upon method is restored to its original state.
     * This method is provided for tear down.
     * The spy object is now a lame duck and may be disposed of.
     * @memberOf MojoSpy.prototype
     */
    retire: function () {
        if (this.object && this.methodName && this.method) { // if spying...
            this.object[this.methodName] = this.method;
            this.method = null;
        }
    },

    /**
     * @summary Determines if (or how) spied-upon menthod was called.
     * @returns {boolean} `true` if spied-upon method called (with exact args).
     *
     * @desc Overloaded:
     * * When called without any parameters:
     * Determines whether or not spied-upon method was ever called with or without parameters.
     * * When called with some parameters:
     * Determines whether or not spied-upon method was called with exactly the given (expected) parameters.
     * (Looks through `this.callHistory` for a matching set of parameters.)
     * Hint: If you have the expected parameters in an array, call may with:
     * `yourSpy.wasCalled.apply(yourSpy, yourArray)`.
     *
     * Note that there is presently no way to determine if the spied-upon method was called without any parameters.
     *
     * @param {*} [arg...] - "Exact" (i.e., ===) arguments required to have been supplied to the spied-upon method
     * @memberOf MojoSpy.prototype
     */
    wasCalled: function () {
        if (arguments.length) {
            var args = arguments;
            return this.callHistory.some(function (callArgs) {
                if (callArgs.length === args.length) {
                    for (var i = 0; i < args.length; ++i) {
                        if (callArgs[i] !== args[i]) {
                            return false;
                        }
                    }
                    return true;
                }
            });
        } else {
            return this.callHistory.length > 0;
        }
    }
};

// synonyms:
MojoSpy.prototype.close = MojoSpy.prototype.retire;


module.exports = MojoSpy; // Node.js support
