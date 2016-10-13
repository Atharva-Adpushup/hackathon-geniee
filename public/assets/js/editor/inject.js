var InnerController = require("./innerController");
var CommonConsts = require("./commonConsts");


module.exports = (function (Controller, CommonConsts) {
    window.ADP = CommonConsts;
    var controller = new Controller();
})( InnerController, CommonConsts );