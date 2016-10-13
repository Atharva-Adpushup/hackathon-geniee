var _ = require('libs/third-party/underscore'),
    $ = require('libs/third-party/jquery');

module.exports = (function(_, $) {
    var escapeSelector = function(a) {
            return a.replace(/([\!\"\#\$\%\&'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\[\\\]\^\`\{\|\}\~])/g, "\\$1")
        },
        Selectorator = function() {
            this.INVALID_SELECTORS = {classes: ["}",  "ui-droppable", "_APD_highlighter"]};
            this.cachedResults = {}
        };

    Selectorator.prototype.generate = function(a) {
        this.cachedResults = {};
        return this.generateSelector(a)
    };
    Selectorator.prototype.generateSelector = function(a) {
        if (a.get(0) === document || "undefined" === typeof a.get(0).tagName)
            return [""];
        for (var b = [], c = [{name: "simple",fn: this.generateSimple}, {name: "ancestor",fn: this.generateAncestor}, {name: "recursive",fn: this.generateRecursive}], d = 0; d < c.length; d++)
            if (b = c[d].fn.call(this, a), this.clean(b, null), 0 < b.length)
                return b;
        return this.unique(b)
    };
    Selectorator.prototype.convertToNthchild = function (exp, id) {
        var el = $("#" + id);
        if (el.length > 1)
            return false;
        var elems = $('[id^=' + exp + ']');
        if (!elems || elems.length <= 0)
            return false;
        elems = elems.toArray();
        return elems.indexOf(el.get(0));
    }
    Selectorator.prototype.generateSimple = function(a, b, c, d) {
        for (var e = this.getProperTagName(a), f, g = [], h = function() {
            var b = a.attr("id");
            /************ Wordpress wild card selection **************/
            if("string" == typeof b){
                var ambiguity = b.match(new RegExp('(post-' +
                '|post_' +
                '|post-main-' +
                '|_ap_wp_content_start_' +
                '|_ap_wp_content_end_' +
                '|_ap_wp_content_top_' +
                '|_ap_wp_content_bottom_' +
                '|_ap_wp_post_left_' +
                '|_ap_wp_post_right_' +
                '|_ap_wp_post_top_' +
                '|_ap_wp_post_bottom_' +
                ')([0-9]*$)', 'i'));
                var pos = false;
                if (ambiguity && ambiguity instanceof Array) {
                    pos = this.convertToNthchild(ambiguity[1], b);
                }
                if (pos !== false && pos >= 0) {
                    b = '[id^=' + ambiguity[1] + ']:eq(' + pos + ')'.toString()
                    return (f = b, [f]);
                }
            }
            /************ Wordpress wild card selection  ENDS **************/
            return "string" == typeof b && (b = b.trim(), 0 < b.length) ? (f = "#" + escapeSelector(b), [f]) : null
        }, j = function() {
            if ("body" === e || "html" === e)
                return null;
            for (var b = (a.attr("class") || "").replace(/\{.*\}/, "").split(/\s/), c = [], d = 0; d < b.length; d++) {
                var f = b[d];
                if (f) {
                    if (-1 !== this.INVALID_SELECTORS.classes.indexOf(f))
                        break;
                    f = escapeSelector(f);
                    c.push("." + f)
                }
            }
            return c
        }, l = [h, j, function() {
            var a =
                h.call(this);
            return null !== a ? [e + a[0]] : null
            return null !== a ? [e + a[0]] : null
        }, function() {
            var a = j.call(this);
            if (null !== a)
                for (var b = 0; b < a.length; b++)
                    a[b] = e + a[b];
            return a
        }, function() {
            var b = a.attr("name");
            return b ? (f = e + "[name='" + b + "']", [f]) : null
        }/*, function() {
         return [e]
         }*/], m = 0; m < l.length; m++)
            if (g = l[m].call(this), null !== g && 0 < g.length) {
                for (var k = 0; k < g.length; k++)
                    g[k] = this.validate(a, g[k], b, c, d);
                this.clean(g, null);
                if (0 < g.length)
                    return g
            }
        return []
    };
    Selectorator.prototype.generateAncestor = function(a) {
        this.getProperTagName(a);
        for (var b = [], c = a.parents(), d = 0; d < c.length; d++) {
            var e = c[d], f = !1;
            0 == d && (f = !0);
            for (var e = this.generateSimple($(e), null, !1), g = 0; g < e.length; g++)
                for (var h = this.generateSimple(a, e[g], !0, f), j = 0; j < h.length; j++)
                    b.push(h[j])
        }
        return b
    };
    Selectorator.prototype.generateRecursive = function(a) {
        var b = this.getProperTagName(a);
        -1 !== b.indexOf(":") && (b = "*");
        var c = a.parent(), d = this.generateSelector(c)[0], a = c.children(b).index(a), b = b + ":eq(" + a + ")";
        "" != d && (b = d + " > " + b);
        return [b]
    };
    Selectorator.prototype.generateAllSelectors = function(a) {
        var selectors = [];
        selectors.push(this.generateSimple(a));
        selectors.push(this.generateAncestor(a));
        selectors.push(this.generateRecursive(a));
        selectors = _.flatten(selectors);
        return _.uniq(selectors);
    };
    Selectorator.prototype.getProperTagName = function(a) {
        return escapeSelector(a.get(0).tagName.toLowerCase())
    };
    Selectorator.prototype.validate = function(a, b, c, d, e) {
        var f;
        "undefined" == typeof d && (d = !0);
        "undefined" == typeof e && (e = !1);
        f = this.query(b);
        if (d && 1 < f.length || !d && 0 == f.length)
            if (c && -1 === b.indexOf(":")) {
                if (f = " ", e && (f = " > "), b = c + f + b, f = this.query(b), d && 1 < f.length || !d && 0 == f.length)
                    return null
            } else
                return null;
        return -1 !== [].indexOf.call(f, a.get(0)) ? b : null
    };
    Selectorator.prototype.clean = function(a, b) {
        for (var c = 0; c < a.length; c++)
            a[c] == b && (a.splice(c, 1), c--);
        return a
    };
    Selectorator.prototype.unique = function(a) {
        var b = [], c = 0, d = a.length;
        a: for (; c < d; c++) {
            for (var e = 0, f = b.length; e < f; e++)
                if (b[e] == a[c])
                    continue a;
            b[b.length] = a[c]
        }
        return b
    };
    Selectorator.prototype.query = function(a) {
        a in this.cachedResults || (this.cachedResults[a] = $(a));
        return this.cachedResults[a]
    };

    return Selectorator;
})(_, $);