
var path = require('path');
var fs = require('fs');
var Q = require('q');

module.exports = {

    book: {}, // we should be able to leave this out, but we get a
    // "Cannot read property 'html' of undefined" error

    hooks: {

        "page:before": function(page) {
            // page.raw is the path to the raw file
	    // page.path is the path to the page in the gitbook
            // page.content is a string with the file markdown content

	    // use multiline flag to grok every line, and global flag to 
	    // find all matches -- finds '' and "" filenames
	    // -- add initial \s* to eat up whitespace?
	    var re = /^!INCLUDE\s+(?:\"([^\"]+)\"|'([^']+)')\s*$/gm;
	    
	    var dir = path.dirname(page.raw);

	    var files = {};
	    // returns a closure for saving the passed text
	    var cacheFile = function(filename) {
		return function(text) {
		    files[filename] = text;
		};
	    };

	    // find all !INCLUDE statements.
	    // read and cache target files
	    var res;
	    while (res = re.exec(page.content)) {
		
		var filename = res[1] || res[2];
		var filepath = path.join(dir, filename);
		promises.push(
		    Q.nfcall(fs.readFile, filepath)
			.then(cacheFile(filename))
		);
	    }
	    // once all files are read, replace !INCLUDE statements with 
	    // appropriate file content
	    return Q.all(promises)
		.then(function() {
		    page.content = page.content.replace(re, function(match, p1, p2) {
			var filename = p1 || p2;
			return files[filename].toString().trim(); // strip whitespace
		    });
		    return page;
		})
        }
    }
};
