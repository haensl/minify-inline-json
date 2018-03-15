const fs = require('fs');
const join = require('path').join;
const expect = require('chai').expect;
const minifyInlineJson = require('../');
const fixturesPath = join(__dirname, 'fixtures');

const fixture = (name) =>
  new Promise((resolve, reject) => {
    fs.readFile(join(fixturesPath, name), 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }

      resolve(data);
    });
  });

describe('minify-inline-json', () => {
  describe('application/json', () => {
    const expected = [
      '{"type":"json","parent":"head"}',
      '{"type":"json","parent":"body"}'
    ];
    let output;

    beforeEach((done) => {
      fixture('json.html')
        .then((html) => {
          output = minifyInlineJson(html);
          done();
        });
    });

    it('removes whitespace from json data', () => {
      expected.forEach((expectedScriptTagContent) =>
        expect(new RegExp(expectedScriptTagContent).test(output)).to.be.true);
    });
  });

  describe('application/ld+json', () => {
    const expected = [
      '{"type":"jsonld","parent":"head"}',
      '{"type":"jsonld","parent":"body"}',
    ];
    let output;

    beforeEach((done) => {
      fixture('jsonld.html')
        .then((html) => {
          output = minifyInlineJson(html);
          done();
        });
    });

    it('removes whitespace from json data', () => {
      expected.forEach((expectedScriptTagContent) =>
        expect(new RegExp(expectedScriptTagContent).test(output)).to.be.true);
    });
  });

  describe('non-JSON script', () => {
    let html;
    beforeEach((done) => {
      fixture('gibberish.html')
        .then((content) => {
          html = content;
          done();
        });
    });

    it('throws an exception', () => {
      expect(minifyInlineJson.bind(null, html)).to.throw;
    });
  });

  describe('no script tag', () => {
    let output;
    let input;

    beforeEach((done) => {
      fixture('noscript.html')
        .then((html) => {
          input = html;
          output = minifyInlineJson(html);
          done();
        });
    });

    it('Bypasses the input', () => {
      expect(output).to.equal(input);
    });
  });

  describe('no input', () => {
    let error;
    beforeEach((done) => {
      try {
        minifyInlineJson();
      } catch (err) {
        error = err;
      } finally {
        done();
      }
    });

    it('throws invalid parameter error', () => {
      expect(/invalid parameter: html/i.test(error.message)).to.be.true;
    });
  });

  describe('options', () => {
    let output;

    describe('mimeTypes', () => {
      describe('application/json', () => {
        beforeEach((done) => {
          fixture('json+jsonld.html')
            .then((html) => {
              output = minifyInlineJson(html, {
                mimeTypes: [
                  'application/json'
                ]
              });
              done();
            });
        });

        it('minifies application/json', () => {
          expect(/{"type":"json","parent":"head"}/.test(output)).to.be.true;
        });

        it('does not minify application/ld+json', () => {
          expect(/{"type":"jsonld","parent":"body"}/.test(output)).to.be.false;
        });
      });

      describe('application/ld+json', () => {
        beforeEach((done) => {
          fixture('json+jsonld.html')
            .then((html) => {
              output = minifyInlineJson(html, {
                mimeTypes: [
                  'application/ld+json'
                ]
              })
              done();
            });
        });

        it('minifies application/json', () => {
          expect(/{"type":"json","parent":"head"}/.test(output)).to.be.false;
        });

        it('does not minify application/ld+json', () => {
          expect(/{"type":"jsonld","parent":"body"}/.test(output)).to.be.true;
        });
      });
    });
  });
});
