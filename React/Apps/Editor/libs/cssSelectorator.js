import _ from 'lodash';
import $ from 'jquery';

export default (function(_, $) {
	let escapeSelector = function(a) {
			return a.replace(/([\!\"\#\$\%\&'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\[\\\]\^\`\{\|\}\~])/g, '\\$1');
		},
		Selectorator = function() {
			this.INVALID_SELECTORS = { classes: ['}', 'ui-droppable', '_APD_highlighter'] };
			this.cachedResults = {};
		};

	Selectorator.prototype.generate = function(a) {
		this.cachedResults = {};
		return this.generateSelector(a);
	};
	Selectorator.prototype.generateSelector = function(a) {
		if (!a.get(0) || a.get(0) === document || typeof a.get(0).tagName === 'undefined') {
			return [''];
		}
		for (
			var b = [],
				c = [
					{ name: 'simple', fn: this.generateSimple },
					{ name: 'ancestor', fn: this.generateAncestor },
					{ name: 'recursive', fn: this.generateRecursive }
				],
				d = 0;
			d < c.length;
			d++
		) {
			if (((b = c[d].fn.call(this, a)), this.clean(b, null), b.length > 0)) return b;
		}
		return this.unique(b);
	};
	Selectorator.prototype.convertToNthchild = function(exp, id) {
		const el = $(`#${id}`);
		if (el.length > 1) {
			return false;
		}
		let elems = $(`[id^=${exp}]`);
		if (!elems || elems.length <= 0) {
			return false;
		}
		elems = elems.toArray();
		return elems.indexOf(el.get(0));
	};
	Selectorator.prototype.generateSimple = function(a, b, c, d) {
		for (
			let e = this.getProperTagName(a),
				f,
				g = [],
				h = function() {
					let b = a.attr('id');
					/** ********** Wordpress wild card selection **************/
					if (typeof b == 'string') {
						const ambiguity = b.match(
							new RegExp(
								'(post-' +
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
									')([0-9]*$)',
								'i'
							)
						);
						let pos = false;
						if (ambiguity && ambiguity instanceof Array) {
							pos = this.convertToNthchild(ambiguity[1], b);
						}
						if (pos !== false && pos >= 0) {
							b = `[id^=${ambiguity[1]}]:eq(${pos}${')'.toString()}`;
							return (f = b), [f];
						}
					}
					/** ********** Wordpress wild card selection  ENDS **************/
					return typeof b == 'string' && ((b = b.trim()), b.length > 0)
						? ((f = `#${escapeSelector(b)}`), [f])
						: null;
				},
				j = function() {
					if (e === 'body' || e === 'html') {
						return null;
					}
					for (
						var b = (a.attr('class') || '').replace(/\{.*\}/, '').split(/\s/), c = [], d = 0;
						d < b.length;
						d++
					) {
						let f = b[d];
						if (f) {
							if (this.INVALID_SELECTORS.classes.indexOf(f) !== -1) {
								break;
							}
							f = escapeSelector(f);
							c.push(`.${f}`);
						}
					}
					return c;
				},
				l = [
					h,
					j,
					function() {
						const a = h.call(this);
						return a !== null ? [e + a[0]] : null;
						return a !== null ? [e + a[0]] : null;
					},
					function() {
						const a = j.call(this);
						if (a !== null) {
							for (let b = 0; b < a.length; b++) a[b] = e + a[b];
						}
						return a;
					},
					function() {
						const b = a.attr('name');
						return b ? ((f = `${e}[name='${b}']`), [f]) : null;
					} /* , function() {
		 return [e]
		 }*/
				],
				m = 0;
			m < l.length;
			m++
		) {
			if (((g = l[m].call(this)), g !== null && g.length > 0)) {
				for (let k = 0; k < g.length; k++) g[k] = this.validate(a, g[k], b, c, d);
				this.clean(g, null);
				if (g.length > 0) return g;
			}
		}
		return [];
	};
	Selectorator.prototype.generateAncestor = function(a) {
		this.getProperTagName(a);
		for (var b = [], c = a.parents(), d = 0; d < c.length; d++) {
			var e = c[d],
				f = !1;
			d == 0 && (f = !0);
			for (var e = this.generateSimple($(e), null, !1), g = 0; g < e.length; g++) {
				for (let h = this.generateSimple(a, e[g], !0, f), j = 0; j < h.length; j++) b.push(h[j]);
			}
		}
		return b;
	};
	Selectorator.prototype.generateRecursive = function(a) {
		var b = this.getProperTagName(a);
		b.indexOf(':') !== -1 && (b = '*');
		var c = a.parent(),
			d = this.generateSelector(c)[0],
			a = c.children(b).index(a),
			b = `${b}:eq(${a})`;
		d != '' && (b = `${d} > ${b}`);
		return [b];
	};
	Selectorator.prototype.generateAllSelectors = function(a) {
		let selectors = [];
		selectors.push(this.generateSimple(a));
		selectors.push(this.generateAncestor(a));
		selectors.push(this.generateRecursive(a));
		selectors = _.flatten(selectors);
		return _.uniq(selectors);
	};
	Selectorator.prototype.getProperTagName = function(a) {
		return escapeSelector(a.get(0).tagName.toLowerCase());
	};
	Selectorator.prototype.validate = function(a, b, c, d, e) {
		let f;
		typeof d == 'undefined' && (d = !0);
		typeof e == 'undefined' && (e = !1);
		f = this.query(b);
		if ((d && f.length > 1) || (!d && f.length == 0)) {
			if (c && b.indexOf(':') === -1) {
				if (
					((f = ' '),
					e && (f = ' > '),
					(b = c + f + b),
					(f = this.query(b)),
					(d && f.length > 1) || (!d && f.length == 0))
				)
					return null;
			} else return null;
		}
		return [].indexOf.call(f, a.get(0)) !== -1 ? b : null;
	};
	Selectorator.prototype.clean = function(a, b) {
		for (let c = 0; c < a.length; c++) {
			a[c] == b && (a.splice(c, 1), c--);
		}
		return a;
	};
	Selectorator.prototype.unique = function(a) {
		let b = [],
			c = 0,
			d = a.length;
		a: for (; c < d; c++) {
			for (let e = 0, f = b.length; e < f; e++) {
				if (b[e] == a[c]) continue a;
			}
			b[b.length] = a[c];
		}
		return b;
	};
	Selectorator.prototype.query = function(a) {
		a in this.cachedResults || (this.cachedResults[a] = $(a));
		return this.cachedResults[a];
	};

	return Selectorator;
})(_, $);
