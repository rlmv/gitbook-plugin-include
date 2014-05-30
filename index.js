
var path = require('path');
var fs = require('fs');
var Q = require('q');

module.exports = {

    book: {}, // we should be able to leave this out, but we get a
    // "Cannot read property 'html' of undefined" error

    hooks: {
        // For all the hooks, this represent the current generator

        // The following hooks are called for each page of the book
        // and can be used to change page content (html, data or markdown)

        // Before parsing markdown
        "page:before": function(page) {
            // page.path is the path to the file
            // page.content is a string with the file markdown content

	    // use multiline flag to grok every line, and global flag to 
	    // find all matches -- finds '' and "" filenames
	    // -- add initial \s* to eat up whitespace?
	    var re = /^!INCLUDE\s+(?:\"([^\"]+)\"|'([^']+)')\s*$/gm;
	    
	    var dir = path.dirname(page.path);

	    var res;
	    var fnames = {};
	    // capture all filenames
	    while ((res = re.exec(page.content)) !== null) {

		var filename = path.join(dirname, res[1] || res[2]);
		fnames[filename] = null;
	    }
		
	    // read all files

	    // replace !INCUDEs with file contents
	    // filename is first matching group
/*	    page.content = page.content.replace(re, function(match, p1, p2) {

		Q.nfcall(fs.readFile, filename).done(function (text) {
		    console.log(text);
		});
	    });*/
	    return page;
        }
    }
};
