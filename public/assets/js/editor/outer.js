var Flux = require("./flux"),
	Editor = require("./editor"),
	CommonConsts = require("./commonConsts");

module.exports = (function (Flux, Editor, CommonConsts) {
    var editor = new Editor();
    
    window.ADP = CommonConsts;
})( Flux, Editor, CommonConsts);

