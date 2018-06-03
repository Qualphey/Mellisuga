const less = require('less');

// Identity loader with SourceMap support
module.exports = function(source, map) {
  this.callback(null, source, map);
};
// raw-loader's source - just converts your file to a string with "module.exports=" appended
// This is basically the simplest real world loader.
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
module.exports = function(content) {
	this.cacheable && this.cacheable();
	this.value = content;

  let injection = "let style = document.createElement('style');";
  injection += "style.innerHTML = '"+content.replace(/(\r\n\t|\n|\r\t)/gm,"").replace(/'/g, '"')+"';";
  injection += "document.head.appendChild(style);";

	return injection;
}
module.exports.seperable = true;
