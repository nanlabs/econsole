/**
 * Console Enhancer
 * Provides new features to console, such as styling, source information (file and line number) and level-based filtering
 *
 * @author Martin Moscovich (martin@nan-labs.com)
 * Copyright (c) 2013 NaN Labs (www.nan-labs.com)
 */

var fs = require('fs');
var path = require('path');
var util = require("util");

var moment = require('moment');

/**
 * ERROR LEVELS.
 * Higher Levels include the lower levels.
 */
var levels = {
	ERROR: 0,
	WARN: 1,
	INFO: 2,
	DEBUG: 3,
	TRACE: 4,
	ALL: 5
};

/**
 * Font styles
 */
var styles = {
	CLEAR: 0,
	BOLD: 1,
	ITALIC: 3,
	UNDERLINE: 4
};

/**
 * Font colors
 */
var colors = {
	RED: 31,
	YELLOW: 33,
	WHITE: 37,
	BLACK: 30
};

/**
 * Definitions of styles and colors for each level
 */
var levelStyles = {
	ERROR: [styles.BOLD, colors.RED],
	WARN: [styles.BOLD, colors.YELLOW],
	INFO: [styles.BOLD, colors.WHITE],
	DEBUG: [colors.WHITE],
	TRACE: [styles.BOLD, colors.BLACK]
};

/**
 * Current level set
 */
var currentLevel = levels.ALL;

/**
 * Flag indicating whether to show the file name and line on each log.
 * Currently, it is always true except when level is ERROR
 * (to improve performance and because the error's stack contains the line number)
 */
 var showSourceInfo = true;

/**
 * Array of functions used to write the logs.
 * By default, only console logger is used
 */
var appenders = [logToConsole];

/**
 * Path of the log file.
 */
 var currentFilePath = './logs/server.log';

/**
 * Reference to the original console.error in case of failure
 */
var originalConsoleError = global.console.error;

/**
 * Flag that indicates if the timestamp should be shown in the log.
 */
var includeDate = false;


/**
 * Substring the should be replaced in the file paths
 */
var pathReplace;

/**
 * Function to call in order to improve node's console.
 * @param options configuration options
 */
exports.enhance = function(options) {

	var level = options.level;

	if(options.file) initFileLogger(options.filepath);

	if(level === 'VERBOSE') level = 'TRACE';

	if (options.includeDate) includeDate = options.includeDate;

	var levelNumber = levels[level];
	if (typeof levelNumber !== 'undefined') currentLevel = levelNumber;

	showSourceInfo = (currentLevel !== 0);

	pathReplace = options.pathReplace || '';

	global.console.info = LogBuilder.createLogger("INFO");

	global.console.warn = LogBuilder.createLogger("WARN");

	global.console.debug = LogBuilder.createLogger("DEBUG");

	global.console.verbose = LogBuilder.createLogger("TRACE");

	global.console.error = LogBuilder.createErrorLogger();

	global.console.log = global.console.debug;
};

/**
 * Initialzes the file logger
 * @param filepath path to the log file
 */
function initFileLogger(filepath) {
	currentFilePath = filepath || currentFilePath;

	var logDir = path.dirname(currentFilePath);
	appenders.push(logToFile);
	if(!fs.existsSync(logDir)) fs.mkdirSync(logDir);
};

/**
 * Writes the log to stderr
 *
 * Partially based on clim (http://github.com/epeli/node-clim)
 * Copyright (c) 2009-2011 Esa-Matti Suuronen <esa-matti@suuronen.org>
 */
function writeLog(level, msg) {
	var line;
	if(showSourceInfo) {
		var si = getSourceInfo();
		if (includeDate) {
			line = util.format("[%s] <%s>\t[%s:%s] %s", moment().format(), level, si.file, si.lineNumber, msg);
		} else {
			line = util.format("<%s>\t[%s:%s] %s", level, si.file, si.lineNumber, msg);
		}
	} else {
		if (includeDate) {
			line = util.format("[%s] <%s>\t%s", moment().format(), level, msg);
		} else {
			line = util.format("<%s>\t%s", level, msg);
		}
	}

	line += '\n';
	appenders.forEach(function(appender) {
		appender(level, line);
	});
}

function logToConsole(level, line) {
	var styledLine = logStyler.addCodes(line, levelStyles[level]);
	process.stderr.write(styledLine);
};

function logToFile(level, line) {
	fs.appendFile(currentFilePath, line, function (err) {
		if (err) {
			originalConsoleError("Error logging to '" + currentFilePath + "':\n" + err);
			throw err;
		}
	});
};

/**
 * Gets the source information from the line being log
 */
function getSourceInfo() {
	var exec = getStack()[3];

	var pos = exec.getFileName().lastIndexOf('\\');
	if(pos < 0) exec.getFileName().lastIndexOf('/');

	return {
		methodName: exec.getFunctionName() || 'anonymous',
		file: exec.getFileName().substring(pos + 1).replace(pathReplace, ''),
		lineNumber: exec.getLineNumber()
	};
}


/**
 * Gets the current stack in order to retrieve source code info.
 *
 * Based on Callsite (http://github.com/visionmedia/callsite)
 * Copyright (c) 2011, 2013 TJ Holowaychuk <tj@vision-media.ca>
 */
function getStack() {
	var old = Error.stackTraceLimit;
	Error.stackTraceLimit = 4;
	var orig = Error.prepareStackTrace;
  	Error.prepareStackTrace = function(_, stack){ return stack; };
  	var err = new Error;
  	Error.captureStackTrace(err, arguments.callee);
  	var stack = err.stack;
  	Error.prepareStackTrace = orig;

	Error.stackTraceLimit = old;

  	return stack;
}


/**
 * Creates the loggers
 */
var LogBuilder = {
	createLogger: function(level) {
	  return function () {
	  	if(levels[level] <= currentLevel) {
		  	var msg = util.format.apply(this, arguments);
		  	writeLog(level, msg);
	  	}
	  };
	},

	createErrorLogger: function() {
		var level = "ERROR";
		return function () {
			if(levels[level] <= currentLevel) {

		  		if(arguments[0] instanceof Error) {
		  			arguments[0] = arguments[0].stack;
		  		} else if(arguments[1] instanceof Error) {
		  			arguments = [arguments[0] + ":\n" + arguments[1].stack];
				}

			  	var msg = util.format.apply(this, arguments);
			  	writeLog(level, msg);
		  	}
		};
	}
}

/**
 * Adds the styles to the console logs
 */
var logStyler = {
	getAnsi: function(style) {
		return '\u001b['+style+'m';
	},

	addCodes: function(msg, codes) {
		codes.forEach(function(c) {
			msg = logStyler.getAnsi(c) + msg;
		});

		msg = msg + logStyler.getAnsi(styles.CLEAR);

		return msg;
	}
}

