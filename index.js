/*
File: mustacheEngine.js
Description:
Connect middleware to compile requested html file as a mustache template before serving
the response. Also allows mustache partials to be included using file system.
*/

var WritableStream = require("stream-buffers").WritableStreamBuffer;
var fs = require('fs');
var path = require('path');
var Mustache = require('mustache');


var MustacheEngine = {

    // options property
    options: {
        rootDir: '',
        dataDir: ''
    },

    /*
    Function: setOptions
    Set options for mustache engine

    Params:
    - options: key/value options

    Returns: NA
    */
    setOptions: function (options) {
        this.options = options;
    },


    /*
    Function: getCompileWithFileContent
    Returns JSON file to compile mustache template with or null if not available

    Params:
    - body: HTML content to parse JSON data filename and retrive its content

    Returns: JSON | NULL
    */
    getCompileWithFileContent: function (body) {
        var regex = /\<!--\s*\[MUSTACHE\-COMPILE\-WITH[^\]]+.*\]\s*-->/img,
            matches = body.match(regex) || [],
            filename,
            content;

        // matches found
        if (matches && matches.length > 0) {
            filename = matches[0].split(':')[1].replace(/\].*/img, '').replace(/\s+/img, '');
            content = fs.readFileSync(this.options.dataDir + '/' + filename, 'utf8')
            return JSON.parse(content) || null;
        }

        return null;
    },


    /*
    Function: includePartials
    Returns main Mustache template by including all partials mentioned in the HTML content

    Params:
    - body: HTML content contains partials syntax to include other files.

    Returns: Mustache Template
    */
    includePartials: function (body) {
        var regex = /\{\{\s*\>\s*[^\s]+\s*\}\}/img,
            matches,
            partialFile,
            content,
            count = 0,
            partials = {};

        // replace all appearance of partials ({{> file}}) with actual file contents
        do {
            matches = body.match(regex) || [];

            if (matches) {
                for (var i = 0; i < matches.length; i++) {
                    partialFile = matches[i].replace(/[^a-zA-Z\.\/\\]/img, '');
                    content = fs.readFileSync(this.options.rootDir + '/' + partialFile, 'utf8');
                    body = body.replace(matches[i], content);
                    //partials[partialFile] = content;
                }
            }
        } while (matches && matches.length > 0)

        // return template content
        return body;
    },


    /*
    Function: middleware
    Connect middleware function to  compile requested file as mustache template before serving response.

    Params:
    - options: key/value options settings for middleware

    Returns: NA
    */
    middleware: function (options) {

        this.options = options;

        return function(req, res, next) {

            var buffer,
                oldWrite,
                oldEnd,
                body;

            // call next middleware for non-html requests
            if (req.url !== "/" && !req.url.match(/\.html$/)) {
                return next();
            }


            buffer = new WritableStream();
            oldWrite = res.write;

            // override to write response into buffer
            res.write = function(chunk) {
                buffer.write(chunk);
                return true;
            };

            oldEnd = res.end;

            res.end = function(data) {

                if(data) {
                    buffer.write(data);
                }

                if (!buffer.size()) {
                    return oldEnd.call(this, buffer.getContents());
                }

                body = buffer.getContentsAsString();
                var partials = MustacheEngine.includePartials(body);
                var jsonData = MustacheEngine.getCompileWithFileContent(partials);

                if (jsonData) {
                    // parse mustache template 
                    oldEnd.call(this, Mustache.render(partials, jsonData));
                } else {
                    // parse mustache template 
                    oldEnd.call(this, partials);
                }
            }

            // call next middleware
            next();
        }
    }
};

module.exports = exports = MustacheEngine;