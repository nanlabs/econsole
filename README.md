econsole
========

Enhanced console for node.js

Current version: **v0.2.0**

One of the easiest and most common ways to debug and log a node.js app is to use *console.log()*

It works ok for simple apps, but when things get complicated, it's usually not enough.

For a recent node project, we created a "console enhancer" that gave us some really required features (see below).

One of the keys of this components was to make it small and self-contained (no external dependencies besides the ones provided by node).

##Features

 - Logging filtering based on LEVEL
 - Different text colors and styles for each level, making it easier to read and distinguish them
 - Source filename and line number for each log message!
 - Error parsing for Error level logs
 - New custom verbose/TRACE logging level added to go beyond DEBUG
 - All logs are sent to stderr for consistency (node sends some to stderr and some to stdout, making it harder to collect all in one place)
 - Log to **File**

##Logging levels


The following logging levels are defined (in order):

 - ERROR(console.error)
 - WARN (console.warn)
 - INFO (console.info)
 - DEBUG (console.log / console.debug)
 - TRACE (console.verbose)

Node provides error, warn, info and log methods but the only difference between them is that error and warn log to stderr and log and info to stdout. Other than that, they look the same.

This module makes each level visually diferrent and also allows to filter by passing a LEVEL to the enhance function.

**Note:** When log level is set to ERROR, source info (filename and line number) are not added to each log. This is done to improve performance (usually ERROR level is set on production environments) and also because error logs are usually called with Error objects, which include the same information as part of their stacktrace.

##Installation

```javascript
$ npm install econsole
```

##Usage


To enhance the console, add this line **ONCE** (eg. in the main module) to your code:

```javascript
require('econsole').enhance({options})
```

### Options
Name | Type | Default | Description
----|---|----|------
**level** | ```string``` | ```ALL``` (aka ```TRACE```) | Minimum level to Log. <br>For example, if level is WARN, only ERROR and WARN logs will be displayed, others will be ignored.
**file** | ```boolean``` | ```false``` | Flag that enables/disables logging to a file
**filepath** | ```string``` | ```'./logs/server.log'``` | Path where the file should be logged

**Examples**

```javascript
    // Logs ALL levels only to console
    require('econsole').enhance({ level: 'TRACE'});

    // Logs ERROR, WARN and INFO levels to console and the file './logs/server.log'
    require('econsole').enhance({ level: 'INFO', file: true });
    
    // Logs ERROR level only to console and the file 'app.log' in the current directory
    require('econsole').enhance({ level: 'ERROR', file: true,  filepath: './app.log'});

```

After calling ```enhance()```, use console's methods as usual and they will be enhanced.

Here is an example of the new output text (the colors and styles will be different in the actual console):

```javascript
    <DEBUG> [sample.js:51] Testing LOG LEVEL
```

**Differences in API**

The enhanced console includes 2 new methods:

 - **console.debug**: alias for console.log
 - **console.verbose**: TRACE level (greater detail than DEBUG)

Also, error logging is improved to parse errors and show their stacktraces:

```javascript
    // Error level logging with a message but NO error
    console.error('Some error message')
    
    // Error level logging with an error but no message
    // This shows enhanced error parsing in logging 
    console.error(new Error("the error"));

    // Error level logging with both message and error
    console.error('Some error message', new Error("the error"));
```

The last function will output the following text (again, the colors and styles will be different in the actual console)

```javascript
    <ERROR> [sample.js:42] Some error message
    Error: the error
        at writeLogs (<path to script>/sample.js:42:53)
        at Object.<anonymous> (<path to script>/sample.js:24:1)
        at Module._compile (module.js:456:26)
        at Object.Module._extensions..js (module.js:474:10)
        at Module.load (module.js:356:32)
        at Function.Module._load (module.js:312:12)
        at Function.Module.runMain (module.js:497:10)
        at startup (node.js:119:16)
        at node.js:901:3
```

## What's new

#### 0.2.0
 - Log to file, including the appropriate configuration settings

##To Do


 - Configurable log message format
 - Configurable styles
 - Unit testing


##Thanks

We would like to thank the authors of some libraries this code was inspired by:

 - Esa-Matti Suuronen - clim (http://github.com/epeli/node-clim)
 - TJ Holowaychuk - callsite (http://github.com/visionmedia/callsite)

##License
The MIT License (MIT)

Copyright (c) 2013 NaN Labs &lt;martin@nan-labs.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
