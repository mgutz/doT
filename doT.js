// doT.js
// 2011, Laura Doktorova, https://github.com/olado/doT
// 2012, Mario Gutierrez, https://github.com/mgutz/doT
//
// doT.js is an open source component of http://bebedo.com
// Licensed under the MIT license.
//

var coffeescript, jsp, pro;
try {
  coffeescript = require('coffee-script');
  jsp = require('uglify-js').parser;
  pro = require('uglify-js').uglify;
}
catch (err) {}

(function() {
  "use strict";

  var doT = {
    version: '0.2.0-mgutz',
    templateSettings: {
      coffee:      /\{\{`cs([\s\S]+?)\}\}/g,
      comment:     /\{\{--([\s\S]+?)\}\}/g,
      evaluate:    /\{\{([\s\S]+?)\}\}/g,
      interpolate: /\{\{=([\s\S]+?)\}\}/g,
      encode:      /\{\{!([\s\S]+?)\}\}/g,
      use:         /\{\{#([\s\S]+?)\}\}/g,
      define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
      conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
      iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
      oiterate:    /\{\{\.\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
      varname: 'it',
      strip: true,
      append: true,
      selfcontained: false,
    },
    template: undefined, //fn, compile template
    compile:  undefined  //fn, for express
  };

  var global = (function(){ return this || (0,eval)('this'); }());

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = doT;
  } else if (typeof define === 'function' && define.amd) {
    define(function(){return doT;});
  } else {
    global.doT = doT;
  }

  function encodeHTMLSource() {
    var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': '&#34;', "'": '&#39;', "/": '&#47;' },
      matchHTML = /&(?!\\w+;)|<|>|"|'|\//g;
    return function(code) {
      return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : code;
    };
  }
  //global.encodeHTML = encodeHTMLSource();

  var startend = {
    append: { start: "'+(",      end: ")+'",      startencode: "'+__dotEncodeHTML(" },
    split:  { start: "';out+=(", end: ");out+='", startencode: "';out+=__dotEncodeHTML("}
  }, skip = /$^/;

  function resolveDefs(c, block, def) {
    return ((typeof block === 'string') ? block : block.toString())
    .replace(c.define || skip, function(m, code, assign, value) {
      if (code.indexOf('def.') === 0) {
        code = code.substring(4);
      }
      if (!(code in def)) {
        if (assign === ':') {
          def[code]= value;
        } else {
          eval("def['"+code+"']=" + value);
        }
      }
      return '';
    })
    .replace(c.use || skip, function(m, code) {
      var v = eval(code);
      return v ? resolveDefs(c, v, def) : v;
    });
  }

  function unescape(code) {
    return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, ' ');
  }

  doT.template = function(tmpl, c, def) {
    c = c || doT.templateSettings;
    var cse = c.append ? startend.append : startend.split, str, needhtmlencode, sid=0, indv;

    if (c.use || c.define) {
      var olddef = global.def; global.def = def || {}; // workaround minifiers
      str = resolveDefs(c, tmpl, global.def);
      global.def = olddef;
    } else str = tmpl;

    str = ("var out='" + (c.strip ? str.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g,' ')
          .replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g,''): str)
      .replace(/'|\\/g, '\\$&')
      .replace(c.comment, '')
      .replace(c.coffee || skip, function(m, code) {
        if (coffeescript) {
          code = coffeescript.compile(code, {bare: true, lint: true});
          return "';" + unescape(code) + "out+='";
        }
        else return code;
      })
      .replace(c.interpolate || skip, function(m, code) {
        return cse.start + unescape(code) + cse.end;
      })
      .replace(c.conditional || skip, function(m, elsecase, code) {
        return elsecase ?
          (code ? "';}else if(" + unescape(code) + "){out+='" : "';}else{out+='") :
          (code ? "';if(" + unescape(code) + "){out+='" : "';}out+='");
      })
      .replace(c.iterate || skip, function(m, iterate, vname, iname) {
        if (!iterate) return "';} } out+='";
        sid+=1; indv=iname || "i"+sid; iterate=unescape(iterate);
        return "';var arr"+sid+"="+iterate+";if(arr"+sid+"){var "+vname+","+indv+"=-1,l"+sid+"=arr"+sid+".length-1;while("+indv+"<l"+sid+"){"
          +vname+"=arr"+sid+"["+indv+"+=1];out+='";
      })
      .replace(c.oiterate || skip, function(m, iterate, valueName, keyName) {
        if (!iterate) return "';} } out+='";
        sid += 1;
        var obj = iterate + sid;
        keyName = keyName || "i"+sid;
        iterate=unescape(iterate);

        return "';var "+keyName+","+valueName+","+obj+"="+iterate+";" +
          "if("+obj+"){" +
            "for("+keyName+" in "+obj+"){" +
              valueName+"="+obj+"["+keyName+"];out+='";
      })
      .replace(c.evaluate || skip, function(m, code) {
        return "';" + unescape(code) + "out+='";
      })
      .replace(c.encode || skip, function(m, code) {
        needhtmlencode = true;
        return cse.startencode + unescape(code) + cse.end;
      })
      + "';")
      .replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r')
      .replace(/(\s|;|}|^|{)out\+='';/g, '$1').replace(/\+''/g, '')
      .replace(/(\s|;|}|^|{)out\+=''\+/g,'$1out+=');

    if (needhtmlencode && c.selfcontained) {
      str = "var __dotEncodeHTML=(" + encodeHTMLSource.toString() + "());" + str;
    }
    try {
      // note that this only slows down compilation. c.strip should be
      // set to true for production. this helps with debugging!
      if (!c.strip && jsp) {
        var ast = jsp.parse(str);
        str = pro.gen_code(ast, {beautify: true, indent_level: 2});
        str += "\n";
      }
      str += "return out;";
      return new Function(c.varname, str);
    } catch (e) {
      if (typeof console !== 'undefined') console.log("Could not create a template function: " + str);
      throw e;
    }
  };

  doT.compile = function(tmpl, def) {
    return doT.template(tmpl, null, def);
  };
}());
