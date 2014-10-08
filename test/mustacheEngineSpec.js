
var assert = require("assert");
var data = {};
var contract = {};
var Mustache = require("mustache");
var mustacheEngine;

describe('MustacheEngine', function() {

    beforeEach(function(){
        mustacheEngine = require('../mustacheEngine.js');
    })

    describe('Data contract', function() {

        it('should parse html data and return JSON', function() {
            var json,
                html = [
                    '<html>',
                    '<head><title>Test HTML</head>',
                    '<body>',
                    '<!-- [MUSTACHE-COMPILE-WITH:data.json] -->',
                    '</body>',
                    '</html>'
                ];

            mustacheEngine.setOptions({
                rootDir: './lib/mustache-engine/test/demo/rootDir',
                dataDir: './lib/mustache-engine/test/demo/dataDir'
            });

            json = mustacheEngine.getCompileWithFileContent(html.join('\n'));

            // type assertion
            assert.equal(typeof json.data, 'object');
            
            // data assertion
            assert.equal(json.data.indexData, 'INDEX PAGE DATA');
            assert.equal(json.data.headerData, 'HEADER SECTION DATA');
            assert.equal(json.data.footerData, 'FOOTER SECTION DATA');
            assert.equal(json.data.contentData, 'CONTENT SECTION DATA');
            assert.equal(json.data.nestedData, 'NESTED SECTION DATA');
        });

        it('should parse html data and return JSON', function() {
            var template,
                compiledTemplate,
                html = [
                    '<html>',
                    '<head><title>Test HTML</head>',
                    '<body>',
                    '<!-- [MUSTACHE-COMPILE-WITH:data.json] -->',
                    '{{> views/header.html}}',
                    '{{> views/content.html}}',
                    '{{> views/footer.html}}',
                    '</body>',
                    '</html>'
                ];

            mustacheEngine.setOptions({
                rootDir: './lib/mustache-engine/test/demo/rootDir',
                dataDir: './lib/mustache-engine/test/demo/dataDir'
            });

            template = mustacheEngine.includePartials(html.join('\n'));
            json = mustacheEngine.getCompileWithFileContent(html.join('\n'));
            compiledTemplate = Mustache.render(template, json);

            // data assertion
            assert.equal(template.match(/\{\{\s*\>\s*[^\s]+\s*\}\}/img), null);

            for (var i in json.data) {
                if (json.hasOwnProperty(i)) {
                    assert.notEqual(template.indexOf(json[i]), -1);
                }
            }
        });
    });
});