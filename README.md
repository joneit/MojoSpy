# MojoSpy
Simple method spying with calling history and mocking.

\[See the note [Regarding submodules](https://github.com/openfin/rectangular#regarding-submodules)
for important information on cloning or re-purposing this repo.\]

### API documentation

Detailed API docs can be found [here](http://joneit.github.io/MojoSpy/MojoSpy.html).

### Introduction
"Spying" is used in testing to determine if a public API method is called when it is supposed to be.

Note that the function you are spying on must be publicly accessible; you cannot spy on private methods.
This is not as severe a limitation as it may at first seem -- when you consider that you should only be
testing the public interface; you should not be testing private functions anyway!

> In the following, the term _actual method_ shall refer to the method you are spying upon
> (that is, the method indicated in the parameters to the constructor)
> -- as opposed to the spy method under discussion.

In addition to checking that the actual method has been called
(or not called, as the case may be), you can also:
* check the precise parameters it was called with
* call through (call the actual method)
* mock it (supply a function to call instead of the actual method)
* allow the mock to call through explicity

### Basic spying

To spy on a method, for example `email.send`, instantiate a spy object:

```javascript
var Spy = require('mojo-spy');

describe('Doing such-and-such', function() {
    var spy;
    beforeEach(function() {
        var spy = new Spy(email, 'send');
    });
    it('invokes the `send` method', function() {
        // put some test code here that you expect will invoke the method
        spy.wasCalled().should.be.true();
    });
    it('does not invoke the `send` method', function() {
        // put some test code here that you expect will NOT invoke the method
        spy.wasCalled().should.be.false();
    });
});
```

The above example code makes jasmine/mocha-style `describe()`, `beforeEach()`, and `it()` function calls and uses the [shoud.js assertion library](https://www.npmjs.com/package/should) to assert its expectaions of the results.
This is just an example, however. `spy.wasCalled()` simply returns a boolean which you can use however you want.

### Call recording

The spy object keeps a record of every call made to the method being spied on.
The recording can be turned on and off with the `spy.on()` and `spy.off()` methods.
Recording is initially ON.

When recording, each call to the method adds an element to the `spy.callHistory[]` array.
Therefore, `spy.callHistory.length` gives the number of calls.

The `spy.clear()` method will empty the history.

The `spy.reset()` method will reset the options to their original values when the spy object was instantiated. Specifically, it will empty the history, turn on recording, and reset call-throughs (discussed below).

### Call signatures

What's saved in the call history is the arguments object for each call.
The `spy.wasCalled(...)` method (when called with parameters) will search
the history for a call whose parameters match those given to
`wasCalled()`. It will return `true` if such a call was found; or `false` otherwise.

So for example if you're looking for a call like
`email.send("Mickey Mouse", "mmouse@disney.com")`
you might write the following test fragment:

```javascript
    it('sends mail to Mickey', function() {
        // put some test code here that you expect will invoke the method with the expected parameters
        spy.wasCalled("Mickey Mouse", "mmouse@disney.com").should.be.true();
    });
```
or, alternatively, you might want to check the parameters of (say) the last call made:

```javascript
    it('sends mail to Mickey', function() {
        // test code goes here
        var arguments = spy.callHistory[spy.callHistory.length - 1];
        arguments.length.should.equal(2);
        arguments[0].should.equal("Mickey Mouse");
        arguments[1].should.equal("mmouse@disney.com");
    });
```

or, more simply:

```javascript
    it('sends mail to Mickey', function() {
        // test code goes here
        var arguments = spy.callHistory[spy.callHistory.length - 1];
        arguments.should.deepEqual([ "Mickey Mouse", "mmouse@disney.com" ]);
    });
```

Alternatively, you could loop through `spy.callHistory[]` on your own -- but
that's exactly what `spy.wasCalled(...)` (called with parameters) does for you.

### Call-throughs vs. mock calls

By default the `spy` object does not "call through" to the actual method --
in deference to merely recording the call signature. That is because the
`spy.callThru` property is false. You can force it to call through by setting
the property to `true`.

Alternatively, you can set the `callThru` property to a _mock._
A mock function to call in place of the actual method.
The function you supply will be called or with the same parameters
that the actual method would have been called with.

If you want to call both a mock function of your own and the actual method,
you can do so by calling the actual method from your mock function with the
following statement:

```javascript
spy.method.apply(this, Array.prototype.slice.call(arguments));
```

### Retiring your spy

Calling `spy.retire()` removes the spy code from the actual method,
which is restored to its original state.
The spy object is now a lame duck and may be disposed of.
This method is provided for tear down.
