
var fs = require('fs');

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
	    // filename is first matching group
	    page.content.replace(re, function(match, p1, p2) {
		var filename = p1 || p2;
		fs.readFile(filename, function(err, content) {
		    if (err) throw err;
		    page.content = content;
		});
	    });
	    return page;
        }
    }
};
