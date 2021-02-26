var cmpFn = function() {
	/*
	Copyright The Closure Library Authors.
	SPDX-License-Identifier: Apache-2.0
	*/
	'use strict';
	var g = function(a) {
			var b = 0;
			return function() {
				return b < a.length ? { done: !1, value: a[b++] } : { done: !0 };
			};
		},
		l = this || self,
		m = /^[\w+/_-]+[=]{0,2}$/,
		p = null,
		q = function() {},
		r = function(a) {
			var b = typeof a;
			if ('object' == b)
				if (a) {
					if (a instanceof Array) return 'array';
					if (a instanceof Object) return b;
					var c = Object.prototype.toString.call(a);
					if ('[object Window]' == c) return 'object';
					if (
						'[object Array]' == c ||
						('number' == typeof a.length &&
							'undefined' != typeof a.splice &&
							'undefined' != typeof a.propertyIsEnumerable &&
							!a.propertyIsEnumerable('splice'))
					)
						return 'array';
					if (
						'[object Function]' == c ||
						('undefined' != typeof a.call &&
							'undefined' != typeof a.propertyIsEnumerable &&
							!a.propertyIsEnumerable('call'))
					)
						return 'function';
				} else return 'null';
			else if ('function' == b && 'undefined' == typeof a.call) return 'object';
			return b;
		},
		u = function(a, b) {
			function c() {}
			c.prototype = b.prototype;
			a.prototype = new c();
			a.prototype.constructor = a;
		};
	var v = function(a, b) {
		Object.defineProperty(l, a, {
			configurable: !1,
			get: function() {
				return b;
			},
			set: q
		});
	};
	var y = function(a, b) {
			this.b = (a === w && b) || '';
			this.a = x;
		},
		x = {},
		w = {};
	var aa = function(a, b) {
		a.src =
			b instanceof y && b.constructor === y && b.a === x ? b.b : 'type_error:TrustedResourceUrl';
		if (null === p)
			b: {
				b = l.document;
				if (
					(b = b.querySelector && b.querySelector('script[nonce]')) &&
					(b = b.nonce || b.getAttribute('nonce')) &&
					m.test(b)
				) {
					p = b;
					break b;
				}
				p = '';
			}
		b = p;
		b && a.setAttribute('nonce', b);
	};
	var z = function() {
		return (
			Math.floor(2147483648 * Math.random()).toString(36) +
			Math.abs(Math.floor(2147483648 * Math.random()) ^ +new Date()).toString(36)
		);
	};
	var A = function(a, b) {
			b = String(b);
			'application/xhtml+xml' === a.contentType && (b = b.toLowerCase());
			return a.createElement(b);
		},
		B = function(a) {
			this.a = a || l.document || document;
		};
	B.prototype.appendChild = function(a, b) {
		a.appendChild(b);
	};
	var C = function(a, b, c, d, e, f) {
		try {
			var k = a.a,
				h = A(a.a, 'SCRIPT');
			h.async = !0;
			aa(h, b);
			k.head.appendChild(h);
			h.addEventListener('load', function() {
				e();
				d && k.head.removeChild(h);
			});
			h.addEventListener('error', function() {
				0 < c ? C(a, b, c - 1, d, e, f) : (d && k.head.removeChild(h), f());
			});
		} catch (n) {
			f();
		}
	};
	var ba = l.atob(
			'aHR0cHM6Ly93d3cuZ3N0YXRpYy5jb20vaW1hZ2VzL2ljb25zL21hdGVyaWFsL3N5c3RlbS8xeC93YXJuaW5nX2FtYmVyXzI0ZHAucG5n'
		),
		ca = l.atob(
			'WW91IGFyZSBzZWVpbmcgdGhpcyBtZXNzYWdlIGJlY2F1c2UgYWQgb3Igc2NyaXB0IGJsb2NraW5nIHNvZnR3YXJlIGlzIGludGVyZmVyaW5nIHdpdGggdGhpcyBwYWdlLg=='
		),
		da = l.atob(
			'RGlzYWJsZSBhbnkgYWQgb3Igc2NyaXB0IGJsb2NraW5nIHNvZnR3YXJlLCB0aGVuIHJlbG9hZCB0aGlzIHBhZ2Uu'
		),
		ea = function(a, b, c) {
			this.b = a;
			this.f = new B(this.b);
			this.a = null;
			this.c = [];
			this.g = !1;
			this.i = b;
			this.h = c;
		},
		F = function(a) {
			if (a.b.body && !a.g) {
				var b = function() {
					D(a);
					l.setTimeout(function() {
						return E(a, 3);
					}, 50);
				};
				C(
					a.f,
					a.i,
					2,
					!0,
					function() {
						l[a.h] || b();
					},
					b
				);
				a.g = !0;
			}
		},
		D = function(a) {
			for (var b = G(1, 5), c = 0; c < b; c++) {
				var d = H(a);
				a.b.body.appendChild(d);
				a.c.push(d);
			}
			b = H(a);
			b.style.bottom = '0';
			b.style.left = '0';
			b.style.position = 'fixed';
			b.style.width = G(100, 110).toString() + '%';
			b.style.zIndex = G(2147483544, 2147483644).toString();
			b.style['background-color'] = I(249, 259, 242, 252, 219, 229);
			b.style['box-shadow'] = '0 0 12px #888';
			b.style.color = I(0, 10, 0, 10, 0, 10);
			b.style.display = 'flex';
			b.style['justify-content'] = 'center';
			b.style['font-family'] = 'Roboto, Arial';
			c = H(a);
			c.style.width = G(80, 85).toString() + '%';
			c.style.maxWidth = G(750, 775).toString() + 'px';
			c.style.margin = '24px';
			c.style.display = 'flex';
			c.style['align-items'] = 'flex-start';
			c.style['justify-content'] = 'center';
			d = A(a.f.a, 'IMG');
			d.className = z();
			d.src = ba;
			d.style.height = '24px';
			d.style.width = '24px';
			d.style['padding-right'] = '16px';
			var e = H(a),
				f = H(a);
			f.style['font-weight'] = 'bold';
			f.textContent = ca;
			var k = H(a);
			k.textContent = da;
			J(a, e, f);
			J(a, e, k);
			J(a, c, d);
			J(a, c, e);
			J(a, b, c);
			a.a = b;
			a.b.body.appendChild(a.a);
			b = G(1, 5);
			for (c = 0; c < b; c++) (d = H(a)), a.b.body.appendChild(d), a.c.push(d);
		},
		J = function(a, b, c) {
			for (var d = G(1, 5), e = 0; e < d; e++) {
				var f = H(a);
				b.appendChild(f);
			}
			b.appendChild(c);
			c = G(1, 5);
			for (d = 0; d < c; d++) (e = H(a)), b.appendChild(e);
		},
		G = function(a, b) {
			return Math.floor(a + Math.random() * (b - a));
		},
		I = function(a, b, c, d, e, f) {
			return (
				'rgb(' +
				G(Math.max(a, 0), Math.min(b, 255)).toString() +
				',' +
				G(Math.max(c, 0), Math.min(d, 255)).toString() +
				',' +
				G(Math.max(e, 0), Math.min(f, 255)).toString() +
				')'
			);
		},
		H = function(a) {
			a = A(a.f.a, 'DIV');
			a.className = z();
			return a;
		},
		E = function(a, b) {
			0 >= b ||
				(null != a.a && 0 != a.a.offsetHeight && 0 != a.a.offsetWidth) ||
				(fa(a),
				D(a),
				l.setTimeout(function() {
					return E(a, b - 1);
				}, 50));
		},
		fa = function(a) {
			var b = a.c;
			var c = 'undefined' != typeof Symbol && Symbol.iterator && b[Symbol.iterator];
			b = c ? c.call(b) : { next: g(b) };
			for (c = b.next(); !c.done; c = b.next())
				(c = c.value) && c.parentNode && c.parentNode.removeChild(c);
			a.c = [];
			(b = a.a) && b.parentNode && b.parentNode.removeChild(b);
			a.a = null;
		};
	var ia = function(a, b, c, d, e) {
			var f = ha(c),
				k = function(n) {
					n.appendChild(f);
					l.setTimeout(function() {
						f
							? (0 !== f.offsetHeight && 0 !== f.offsetWidth ? b() : a(),
							  f.parentNode && f.parentNode.removeChild(f))
							: a();
					}, d);
				},
				h = function(n) {
					document.body
						? k(document.body)
						: 0 < n
						? l.setTimeout(function() {
								h(n - 1);
						  }, e)
						: b();
				};
			h(3);
		},
		ha = function(a) {
			var b = document.createElement('div');
			b.className = a;
			b.style.width = '1px';
			b.style.height = '1px';
			b.style.position = 'absolute';
			b.style.left = '-10000px';
			b.style.top = '-10000px';
			b.style.zIndex = '-10000';
			return b;
		};
	var K = {},
		L = null;
	var M = function() {},
		N = 'function' == typeof Uint8Array,
		O = function(a, b) {
			a.b = null;
			b || (b = []);
			a.j = void 0;
			a.f = -1;
			a.a = b;
			a: {
				if ((b = a.a.length)) {
					--b;
					var c = a.a[b];
					if (
						!(
							null === c ||
							'object' != typeof c ||
							Array.isArray(c) ||
							(N && c instanceof Uint8Array)
						)
					) {
						a.g = b - a.f;
						a.c = c;
						break a;
					}
				}
				a.g = Number.MAX_VALUE;
			}
			a.i = {};
		},
		P = [],
		Q = function(a, b) {
			if (b < a.g) {
				b += a.f;
				var c = a.a[b];
				return c === P ? (a.a[b] = []) : c;
			}
			if (a.c) return (c = a.c[b]), c === P ? (a.c[b] = []) : c;
		},
		R = function(a, b, c) {
			a.b || (a.b = {});
			if (!a.b[c]) {
				var d = Q(a, c);
				d && (a.b[c] = new b(d));
			}
			return a.b[c];
		};
	M.prototype.h = N
		? function() {
				var a = Uint8Array.prototype.toJSON;
				Uint8Array.prototype.toJSON = function() {
					var b;
					void 0 === b && (b = 0);
					if (!L) {
						L = {};
						for (
							var c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split(''),
								d = ['+/=', '+/', '-_=', '-_.', '-_'],
								e = 0;
							5 > e;
							e++
						) {
							var f = c.concat(d[e].split(''));
							K[e] = f;
							for (var k = 0; k < f.length; k++) {
								var h = f[k];
								void 0 === L[h] && (L[h] = k);
							}
						}
					}
					b = K[b];
					c = [];
					for (d = 0; d < this.length; d += 3) {
						var n = this[d],
							t = (e = d + 1 < this.length) ? this[d + 1] : 0;
						h = (f = d + 2 < this.length) ? this[d + 2] : 0;
						k = n >> 2;
						n = ((n & 3) << 4) | (t >> 4);
						t = ((t & 15) << 2) | (h >> 6);
						h &= 63;
						f || ((h = 64), e || (t = 64));
						c.push(b[k], b[n], b[t] || '', b[h] || '');
					}
					return c.join('');
				};
				try {
					return JSON.stringify(this.a && this.a, S);
				} finally {
					Uint8Array.prototype.toJSON = a;
				}
		  }
		: function() {
				return JSON.stringify(this.a && this.a, S);
		  };
	var S = function(a, b) {
		return 'number' !== typeof b || (!isNaN(b) && Infinity !== b && -Infinity !== b)
			? b
			: String(b);
	};
	M.prototype.toString = function() {
		return this.a.toString();
	};
	var T = function(a) {
		O(this, a);
	};
	u(T, M);
	var U = function(a) {
		O(this, a);
	};
	u(U, M);
	var ja = function(a, b) {
			this.c = new B(a);
			var c = R(b, T, 5);
			c = new y(w, Q(c, 4) || '');
			this.b = new ea(a, c, Q(b, 4));
			this.a = b;
		},
		ka = function(a, b, c, d) {
			b = new T(b ? JSON.parse(b) : null);
			b = new y(w, Q(b, 4) || '');
			C(a.c, b, 3, !1, c, function() {
				ia(
					function() {
						F(a.b);
						d(!1);
					},
					function() {
						d(!0);
					},
					Q(a.a, 2),
					Q(a.a, 3),
					Q(a.a, 1)
				);
			});
		};
	var la = function(a, b) {
			V(a, 'internal_api_load_with_sb', function(c, d, e) {
				ka(b, c, d, e);
			});
			V(a, 'internal_api_sb', function() {
				F(b.b);
			});
		},
		V = function(a, b, c) {
			a = l.btoa(a + b);
			v(a, c);
		},
		W = function(a, b, c) {
			for (var d = [], e = 2; e < arguments.length; ++e) d[e - 2] = arguments[e];
			e = l.btoa(a + b);
			e = l[e];
			if ('function' == r(e)) e.apply(null, d);
			else throw Error('API not exported.');
		};
	var X = function(a) {
		O(this, a);
	};
	u(X, M);
	var Y = function(a) {
		this.h = window;
		this.a = a;
		this.b = Q(this.a, 1);
		this.f = R(this.a, T, 2);
		this.g = R(this.a, U, 3);
		this.c = !1;
	};
	Y.prototype.start = function() {
		ma();
		var a = new ja(this.h.document, this.g);
		la(this.b, a);
		na(this);
	};
	var ma = function() {
			var a = function() {
				if (!l.frames.googlefcPresent)
					if (document.body) {
						var b = document.createElement('iframe');
						b.style.display = 'none';
						b.style.width = '0px';
						b.style.height = '0px';
						b.style.border = 'none';
						b.style.zIndex = '-1000';
						b.style.left = '-1000px';
						b.style.top = '-1000px';
						b.name = 'googlefcPresent';
						document.body.appendChild(b);
					} else l.setTimeout(a, 5);
			};
			a();
		},
		na = function(a) {
			var b = Date.now();
			W(
				a.b,
				'internal_api_load_with_sb',
				a.f.h(),
				function() {
					var c;
					var d = a.b,
						e = l[l.btoa(d + 'loader_js')];
					if (e) {
						e = l.atob(e);
						e = parseInt(e, 10);
						d = l.btoa(d + 'loader_js').split('.');
						var f = l;
						d[0] in f || 'undefined' == typeof f.execScript || f.execScript('var ' + d[0]);
						for (; d.length && (c = d.shift()); )
							d.length
								? f[c] && f[c] !== Object.prototype[c]
									? (f = f[c])
									: (f = f[c] = {})
								: (f[c] = null);
						c = Math.abs(b - e);
						c = 1728e5 > c ? 0 : c;
					} else c = -1;
					0 != c && (W(a.b, 'internal_api_sb'), Z(a, Q(a.a, 6)));
				},
				function(c) {
					Z(a, c ? Q(a.a, 4) : Q(a.a, 5));
				}
			);
		},
		Z = function(a, b) {
			a.c || ((a.c = !0), (a = new l.XMLHttpRequest()), a.open('GET', b, !0), a.send());
		};
	(function(a, b) {
		l[a] = function(c) {
			for (var d = [], e = 0; e < arguments.length; ++e) d[e - 0] = arguments[e];
			l[a] = q;
			b.apply(null, d);
		};
	})('__d3lUW8vwsKlB__', function(a) {
		'function' == typeof window.atob &&
			((a = window.atob(a)), (a = new X(a ? JSON.parse(a) : null)), new Y(a).start());
	});
	window.__d3lUW8vwsKlB__(
		'WyI2YjY2YTI3ZjU0MWVjMTVlIixbbnVsbCxudWxsLG51bGwsImh0dHBzOi8vZnVuZGluZ2Nob2ljZXNtZXNzYWdlcy5nb29nbGUuY29tL2YvQUdTS1d4V0d0TDd6dVoxeTFJY05kRHU5N1hWM0ExblNGWWxBeHpVc01GMTFpQm5ad0NFcERzYVpETEp2YXVBMl9DeDNWSW1XLVBrQXhXU3NBMVlsZDV5MXRxQVx1MDAzZCJdCixbMjAsImRpdi1ncHQtYWQiLDEwMCwiTm1JMk5tRXlOMlkxTkRGbFl6RTFaUVx1MDAzZFx1MDAzZCIsW251bGwsbnVsbCxudWxsLCJodHRwczovL3d3dy5nc3RhdGljLmNvbS8wZW1uL2YvcC82YjY2YTI3ZjU0MWVjMTVlLmpzP3VzcXBcdTAwM2RDQW8iXQpdCiwiaHR0cHM6Ly9mdW5kaW5nY2hvaWNlc21lc3NhZ2VzLmdvb2dsZS5jb20vbC9BR1NLV3hYWGRQZXdxTmRBLWRNY19ZMEQzSW90ai1GNXBMZGNhaWhHTzBYUzJQT3RwT25QdTFYWllFOHBZS2gxSnZnOWo1NkVBZUNWWFg2bnJlY2Z5UnM2P2FiXHUwMDNkMSIsImh0dHBzOi8vZnVuZGluZ2Nob2ljZXNtZXNzYWdlcy5nb29nbGUuY29tL2wvQUdTS1d4VUJtY0h4RFFKeVpzeTJ1V2VrekVLeHQwWVhwUGlJd0tmVERGRUR4ZVpmY3ZiZnQzZ0Z0ZGRzZHdkcm5rTEo0SFpkeTFvRnVkejNqUE5qQ0JkSj9hYlx1MDAzZDJcdTAwMjZzYmZcdTAwM2QxIiwiaHR0cHM6Ly9mdW5kaW5nY2hvaWNlc21lc3NhZ2VzLmdvb2dsZS5jb20vbC9BR1NLV3hYQmZMTnhXN2NpZ3c2SThrV0Q3NFVoYThPLWpGcC1JWkVWcmx2MmRUYUstN0lkOUxETk9vOU1ZVXpINFpkcS10QlFRY3QxUFI2YVU4a0pUZVhGP3NiZlx1MDAzZDIiXQo='
	);
};

var cmpFnWrapper = function() {
	/*calling cmpFn after a timeout so that googlefc.controlledMessagingFunction is assured to be setup before Google Funding Choices is loaded
	https://developers.google.com/funding-choices/fc-api-docs#googlefc-controlledMessagingFunction
	*/
	setTimeout(function() {
		try {
			cmpFn.call(window);
		} catch (error) {}
	}, 0);
};

var renderConsentRevokeButton = function() {
	var isMobile = window.adpushup.config.platform === 'MOBILE';

	var revokeBtnCss = `
    border-radius: 0 50% 50% 0;
	bottom: ${isMobile ? '52px' : 0};
	left:0;
    margin: 0;
    padding: 0;
    height: ${isMobile ? '30px' : '40px'};
    width: ${isMobile ? '30px' : '40px'};;
    background: #e5e7e9;
    border: 1px solid #fff;
    box-shadow: ${isMobile ? '0px 3px 7px #777' : '0px -3px 7px #777'};
    cursor: pointer;
    z-index: 9999;
	position: fixed;
	border-left: none;
	box-sizing: border-box;
	`;

	var revokeBtnImgCss = `
    border-radius: 50%;
    border: 1px solid #c9cbcd;
    height: ${isMobile ? '20px' : '25px'};
    width: ${isMobile ? '20px' : '25px'};
    display: block;
    margin: 0 auto;
	`;

	var btn = document.createElement('button');
	btn.style.cssText = revokeBtnCss;
	btn.title = 'Consent Management';
	btn.id = '__ap_gfc_consent_box_btn__';
	btn.addEventListener('click', () => {
		googlefc.callbackQueue.push(googlefc.showRevocationMessage);
	});

	var img = document.createElement('img');
	img.style.cssText = revokeBtnImgCss;
	img.src =
		'data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAeAAD/4QMraHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjZGMzNBMTRFMDNGMzExRUI5MzBBQ0I0NjQzRTJFOERCIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjZGMzNBMTRGMDNGMzExRUI5MzBBQ0I0NjQzRTJFOERCIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NkYzM0ExNEMwM0YzMTFFQjkzMEFDQjQ2NDNFMkU4REIiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NkYzM0ExNEQwM0YzMTFFQjkzMEFDQjQ2NDNFMkU4REIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7/7gAOQWRvYmUAZMAAAAAB/9sAhAAQCwsLDAsQDAwQFw8NDxcbFBAQFBsfFxcXFxcfHhcaGhoaFx4eIyUnJSMeLy8zMy8vQEBAQEBAQEBAQEBAQEBAAREPDxETERUSEhUUERQRFBoUFhYUGiYaGhwaGiYwIx4eHh4jMCsuJycnLis1NTAwNTVAQD9AQEBAQEBAQEBAQED/wAARCAAyADIDASIAAhEBAxEB/8QAZQABAAMBAQAAAAAAAAAAAAAAAAIEBgUHAQEAAAAAAAAAAAAAAAAAAAAAEAABAwMDAgYCAwAAAAAAAAABAAIDEQQFITEScQZBUWGBkRMiMlKCFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A9AREQEVS/wApj8bF9t/cMt2GtOZ1dTX8W7n2VTH904DJTCCzvWPmJo2NwdG5x8miVreXsg6yIiAiIgKL3BjHPd+rQSegUlCVn2RPjrTm0tr1FEGL7axUHck9x3HmI/8AQZJXR2lvJrGyNmn67Henyd118z2fiL+zey0torO8aOVvPC0RcZBq3l9Y1Hnp01VPsC5bHj58NPRl7j5pGyRE6lpNeQ/tULR399b4+zlvLlwbFC0ucT402aPU7BAx0d5FYwRX0jZbtjGtmkZXi54FCRUDforKo4bInKY2C/MLrf728hE48iBWla6VB8PRXkBERAREQZ/Ndn2OUuhkIZpLDIAUFzAaVNKAuGmo9CNFSg7EMsrH5rKXOUjjcHMhkLmsqP5c3yH4otaiCLGtY0MYA1jQA1o0AA2AUkRAREQEREBERAREQEREH//Z';

	btn.appendChild(img);

	document.body.appendChild(btn);
};

var waitForCmpLoad = function(callback) {
	return new Promise((resolve, reject) => {
		var consentRevokeButtonRendered = false;
		window.googlefc = window.googlefc || {};
		window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];

		googlefc.callbackQueue.push({
			CONSENT_DATA_READY: function(consentData) {
				console.log('====consent ready', +new Date());
				callback.call(window.adpushup || window, consentData);
			}
		});
		googlefc.controlledMessagingFunction = message => {
			//setup the consent message popup
			message.proceed();
			if (!consentRevokeButtonRendered) {
				consentRevokeButtonRendered = true;
				setTimeout(() => {
					renderConsentRevokeButton();
				}, 0);
			}
			return resolve();
		};
	});
};

module.exports = {
	loadAndInitiateCmp: function(consentAvailableCallback) {
		cmpFnWrapper();
		return waitForCmpLoad(consentAvailableCallback);
	}
};