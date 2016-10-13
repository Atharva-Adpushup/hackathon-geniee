module.exports = (function(){
    var Components = {};


    Components.HighlighterBox = require("./EditorComponents/InnerComponents/highlighterBox.jsx");
    Components.AdBox = require("./EditorComponents/InnerComponents/adBox.jsx");
    Components.Section = require("./EditorComponents/InnerComponents/section.jsx");

    return Components;
})();