
var path = require('path');
var fs = require('fs');
var async = require('async');
var Q = require('q');

// return a promise for a read file
function readFile(file) {

    var deferred = Q.defer();
    fs.readFile(file, function(err, text) {
	if (err) {
	    deferred.reject(err);
	} else {
	    deferred.resolve(text);
	}
    });
    return deferred.promise;
}

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
	    var res;
	    while ((res = re.exec(page.content)) !== null) {

		var filename = res[1] || res[2];
		var filepath = path.join(dir, filename);
		var promise = Q.nfcall(fs.readFile, filepath)
		    // closure to save text by filename
		    .then(function(filename) { 
			return function(text) {
			    files[filename] = text;
			    return text;
			}
		    }(filename));
		promises.push(promise);
	    }
	    return Q.all(promises)
		.then(function() {
		    page.content = page.content.replace(re, function(match, p1, p2) {
			console.log("including " + p1 || p2);
			return files[p1 || p2];
		    });
		    return page;
		})
        }
    }
};
