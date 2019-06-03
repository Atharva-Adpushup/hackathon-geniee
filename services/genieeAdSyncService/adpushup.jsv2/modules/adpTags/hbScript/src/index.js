// AdpTags entry point

(function (w, d) {
    var hb = reqiure('./hb');
    var gpt = require('./gpt');

    hb.init(w);
    gpt.init(w, d);
})(window, document);