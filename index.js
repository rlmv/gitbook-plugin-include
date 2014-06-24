
var path = require('path');
var fs = require('fs');
var Q = require('q');

module.exports = {

    hooks: {

        "page:before": function(page) {
            // page.raw is the path to the raw file
	    // page.path is the path to the page in the gitbook
            // page.content is a string with the file markdown content

	    // use multiline flag to grok every line, and global flag to 
	    // find all matches -- finds '' and "" filenames
	    // -- add initial \s* to eat up whitespace?
	    var re = /^!INCLUDE\s+(?:\"([^\"]+)\"|'([^']+)')\s*$/gm;
	    
	    var dir = path.dirname(page.rawPath);
	    // concatenate filename onto dir 
	    // - the path from the gitbook binary to the target include
	    var makePath = function(filename) {
		return path.join(dir, filename);
	    };
	
	    var files = {};
	    // returns a closure for saving the passed text
	    var cacheFile = function(filepath) {
		return function(text) {
		    files[filepath] = text;
		};
	    };

	    var readFiles = []; // file promises

	    // find all !INCLUDE statements.
	    // read and cache target files
	    var res;
	    while (res = re.exec(page.content)) {
		
		var filepath = makePath(res[1] || res[2]);
		readFiles.push(
		    Q.nfcall(fs.readFile, filepath)
			.then(cacheFile(filepath))
		);
	    }
	    // once all files are read, replace !INCLUDE statements with 
	    // appropriate file content
	    return Q.all(readFiles)
		.then(function() {
		    page.content = page.content.replace(re, function(match, p1, p2) {
			var filepath = makePath(p1 || p2);
			return files[filepath].toString().trim(); // strip whitespace
		    });
		    return page;
		})
        }
    }
};
