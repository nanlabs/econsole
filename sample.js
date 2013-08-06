/**
 * Console Enhancer Sample
 * 
 * Execute using "node test.js <LOG LEVEL>" (eg "node test.js WARN" or "node test.js ALL")
 * If no level is passed, ALL is used.
 */

// Retrieve log level from command line parameter
var logLevel = (process.argv.length>2)?process.argv[2]:'ALL';

// First, show how regular console shows this
console.log('\n\nRegular console');
console.log('---------------\n');
writeLogs(false);

// Enhance console and call the method again to show the difference
console.log('\n\nEnhanced console with log level', logLevel);
console.log('--------------------------------------\n');

require('./index').enhance(logLevel);
writeLogs(true);

/**
 * Writes logs for the different levels
 * @param customMethods if false, only standard node's console methods will be called.
 *						if true, besides standard methods, also the 2 new added methods are called
 */
function writeLogs(customMethods) {

	// Error level logging with a message but no error
	console.error('Testing ERROR LEVEL without actual error')
	
	// Error level logging with an error but no message
	// This shows enhanced error parsing in logging 
	console.error(new Error("some error"));

	// Error level logging with both message and error
	// This shows enhanced error parsing in logging 
	console.error('Testing ERROR LEVEL with an error', new Error("some error"));
	
	// Warn level logging
	console.warn('Testing WARN LEVEL');

	// Info level logging
	console.info('Testing INFO LEVEL');

	// Log/Debug level logging
	console.log('Testing LOG LEVEL');	
	
	if(customMethods) {
		// Log/Debug level loggin using "debug" alias (not standard but clearer)
		console.debug('Testing DEBUG (AKA LOG) LEVEL');
		
		// Verbose level logging (new level added to go beyond DEBUG)
		console.verbose('Testing TRACE LEVEL');	
	}
}

