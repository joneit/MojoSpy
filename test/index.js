'use strict';

/* global describe, it, beforeEach, afterEach */

require('should'); // extends Object with `should`

var Spy = require('../src/js/MojoSpy.js');

describe('require() returns an object that', function() {
    it('is a function that', function() {
        (typeof Spy).should.equal('function');
    });
    describe('when used as a constructor returns an API that', function() {
        var methodArgs, func, obj, spy;
        beforeEach(function() {
            methodArgs = false;
            func = function () { methodArgs = arguments; };
            obj = { method: func };
            spy = new Spy(obj, 'method');
        });
        describe('initializes the spy', function() {
            it('by replacing the method', function() {
                obj.method.should.not.equal(func);
            });
            it('by saving the method in `.method`', function() {
                spy.method.should.equal(func);
            });
        });
        describe('has a member `reset` that', function() {
            it('is a function', function () {
                (typeof Spy).should.equal('function');
            });
            it('sets `.isRecording`, resets `.callThru`, and implements `.callHistory`.', function() {
                delete spy.isRecording;
                delete spy.callThru;
                delete spy.callHistory;
                spy.reset();
                spy.isRecording.should.be.true();
                spy.callThru.should.be.false();
                (spy.callHistory instanceof Array).should.be.true();
                spy.callHistory.length.should.equal(0);
            });
        });
        describe('has a member `callHistory` that', function() {
            it('is an array', function () {
                (spy.callHistory instanceof Array).should.be.true();
            });
            it('counts calls', function () {
                spy.callHistory.length.should.equal(0);
                obj.method();
                spy.callHistory.length.should.equal(1);
                obj.method();
                spy.callHistory.length.should.equal(2);
            });
            it('records the calling arguments', function () {
                obj.method(1,2,3);
                obj.method(4,5,6);
                Array.prototype.slice.call(spy.callHistory[0], 0).should.deepEqual([1,2,3]);
                Array.prototype.slice.call(spy.callHistory[1], 0).should.deepEqual([4,5,6]);
            });
        });
        describe('has a member `clear` that', function() {
            it('is a function', function () {
                (typeof spy.clear).should.equal('function');
            });
            it('resets the call history', function () {
                obj.method();
                spy.callHistory.length.should.equal(1);
                spy.clear();
                spy.callHistory.length.should.equal(0);
            });
        });
        describe('has a member `on` that', function() {
            it('is a function', function () {
                (typeof spy.on).should.equal('function');
            });
            it('when called, sets the call recording flag', function () {
                delete spy.isRecording;
                spy.on();
                spy.isRecording.should.be.true();
            });
            it('when the recording flag is set, calls are recorded', function () {
                spy.on();
                obj.method();
                spy.callHistory.length.should.equal(1);
            });
        });
        describe('has a member `off` that', function() {
            it('is a function', function () {
                (typeof spy.off).should.equal('function');
            });
            it('resets the call recording flag', function () {
                delete spy.isRecording;
                spy.off();
                spy.isRecording.should.be.false();
            });
            it('when the recording flag is reset, calls are NOT recorded', function () {
                delete spy.isRecording;
                obj.method();
                spy.callHistory.length.should.equal(0);
            });
        });
        describe('has a member `wasCalled` that', function() {
            it('is a function', function () {
                (typeof spy.wasCalled).should.equal('function');
            });
            it('when called without arguments returns whether or not the method was ever called', function () {
                spy.wasCalled().should.be.false();
                obj.method();
                spy.wasCalled().should.be.true();
            });
            it('when called with arguments returns whether or not the method was ever called with precisely those arguments', function () {
                obj.method(1,2,3);
                spy.wasCalled(4,5).should.be.false();
                obj.method(4,5);
                obj.method(6,7,8,9);
                spy.wasCalled(4,5).should.be.true();
            });
        });
        describe('has a member `retire` that', function() {
            it('is a function', function () {
                (typeof spy.wasCalled).should.equal('function');
            });
            it('when called, restores the method', function() {
                spy.retire();
                obj.method.should.equal(func);
            });
        });
        describe('has a member `callThru` that', function() {
            it('when set to `true`, makes calls to the original method', function () {
                spy.callThru = true;
                obj.method();
                methodArgs.should.be.ok();
            });
            it('when set to `false`, blocks calls to the original method', function () {
                spy.callThru = false;
                obj.method();
                methodArgs.should.be.false();
            });
            it('when set to a function (a "mock"), makes calls to that function INSTEAD OF the original method with arguments forwarded', function () {
                var calledMock = false;
                spy.callThru = function () { calledMock = arguments; };
                obj.method(1, 2, 3);
                methodArgs.should.be.false();
                Array.prototype.slice.call(calledMock, 0).should.deepEqual([1, 2, 3]);
            });
            it('when set to a function (a "mock") with a call-through of its own, makes calls to that function AND the original method with arguments forwarded to each', function () {
                var mockArgs = false;
                spy.callThru = function () {
                    mockArgs = arguments;
                    spy.method.apply(this, Array.prototype.slice.call(arguments, 0));
                };
                obj.method(1, 2, 3);
                Array.prototype.slice.call(methodArgs, 0).should.deepEqual([1, 2, 3]);
                Array.prototype.slice.call(mockArgs, 0).should.deepEqual([1, 2, 3]);
            });
        });
    });
});
