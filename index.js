
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
	    var promises = [];

	    // find all !INCLUDE statements.
	    // read and save files to include using promises
	    var res;
	    while ((res = re.exec(page.content)) !== null) {

		var filename = res[1] || res[2];
		var filepath = path.join(dir, filename);
		var promise = Q.nfcall(fs.readFile, filepath)
		    // closure to save read text by filename
		    .then(function(filename) { 
			return function(text) { files[filename] = text; }
		    }(filename));
		promises.push(promise);
	    }
	    // once all files are read, replace !INCLUDE statements with 
	    // appropriate file content
	    return Q.all(promises)
		.then(function() {
		    page.content = page.content.replace(re, function(match, p1, p2) {
			var filename = p1 || p2;
			return files[filename].toString().trim();
		    });
		    return page;
		})
        }
    }
};
