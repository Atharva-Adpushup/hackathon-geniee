$(document).ready(function () {
	(function (w, d) {
        // Settings module object
		var toolsModule = {
				siteId: '',
				isViewMode: false,
				// Settings templates
				templates: {
					headerCode: "<script data-cfasync='false' type='text/javascript'>(function(w, d) { var s = d.createElement('script'); s.src = '//cdn.adpushup.com/__siteId__/adpushup.js'; s.type = 'text/javascript'; s.async = true; (d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s); })(window, document);</script>"
				},

				// Function to generate header code
				generateHeaderCode: function (siteId) {
					var headerCodeStr = this.templates.headerCode.replace(/__siteId__/g, siteId);

					return headerCodeStr;
				},

				// Copy header code to clipboard
				copyToClipboard: function ($targetEl, $clipboardEl) {
					$clipboardEl.fadeIn();

					setTimeout(function () {
						$clipboardEl.fadeOut();
					}, 1500);

					$targetEl.select();
					d.execCommand('copy');
				},

				// Send header code to developer
				sendHeaderCode: function (data, btn) {
					$(btn).prop('disabled', true).html('Sending...');
					$.post('/user/sendCode', data, function (res) {
						if (res.success) {
							$('#sendCodeSubmit').css('opacity', 1).html('Code sent successfully!');
							setTimeout(function () {
								$('#sendToDevModal').modal('toggle');
								$(btn).prop('disabled', false).html('Send');
							}, 2000);
						} else {
							alert('Some error occurred!');
						}
					});
				},


				// Convert Ad Code Functions
				base64_encode: function (data) {
					try {
						if (window.btoa) {
							return window.btoa(data);
						}

						var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
						var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
							ac = 0,
							enc = '',
							tmp_arr = [];

						if (!data) {
							return data;
						}

						do {
							o1 = data.charCodeAt(i++);
							o2 = data.charCodeAt(i++);
							o3 = data.charCodeAt(i++);

							bits = o1 << 16 | o2 << 8 | o3;

							h1 = bits >> 18 & 0x3f;
							h2 = bits >> 12 & 0x3f;
							h3 = bits >> 6 & 0x3f;
							h4 = bits & 0x3f;

							tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
						} while (i < data.length);

						enc = tmp_arr.join('');

						var r = data.length % 3;

						return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
					}
					catch (err) {
						alert("Unable to transform, Please contact our support team.");
						return false;
					}
				},
				randomString: function (len) {
					len = (len && Number(len) && (len > 1)) ? len : 10;

					return Math.random().toString(32).substr(2, len);
				},
				getAdcode: function (data) {
					var encodedAd = this.base64_encode(data),
						randomControlId = this.randomString(5),
						siteId = this.siteId;

					if (!encodedAd) { return false; }

					var newAdCode = ['<ins class="adPushupAds" data-adpControl="' + randomControlId + '" data-ver="2" data-siteId="' + siteId + '" data-ac="' + encodedAd + '"><\/ins>' + '<script data-cfasync="false" type="text/javascript">(function (w, d) { for (var i = 0, j = d.getElementsByTagName("ins"), k = j[i]; i < j.length; k = j[++i]){ if(k.className == "adPushupAds" && k.getAttribute("data-push") != "1") { ((w.adpushup = w.adpushup || {}).control = (w.adpushup.control || [])).push(k); k.setAttribute("data-push", "1");} } })(window, document);</script>'];

					return newAdCode.join('\n');
				},
				isNonEmpty: function (val) {
					if (!val || typeof val == "undefined" || val == null || (val.trim && val.trim() == ""))
						return false
					return true
				},
				runCode: function (data) {
					this.dom = $("<div>" + data + "</div>");
				},
				isCodeAdsense: function () {
					return this.dom.html().indexOf("pagead2.googlesyndication.com") != -1
				},
				isSyncAdsense: function () {
					var script = this.dom.find("script[src]"),
						scriptTag = this.dom.find("script:not([src])");
					if (script.length == 1 && scriptTag.length == 1) {
						script = script.get(0);
						scriptTag = scriptTag.html();
						return script.src.trim().indexOf("pagead2.googlesyndication.com/pagead/show_ads.js") > -1 && scriptTag.indexOf('google_ad_client') > -1 && scriptTag.indexOf('google_ad_slot') > -1
					}
					return false;
				},
				isOldAdsenseCode: function () {
					var script = this.dom.find("script:not([src])");
					if (script.length == 1) {
						script = script.html();
						return (script.indexOf('google_color_border') > -1 && script.indexOf('google_color_bg') > -1 && script.indexOf('google_color_link') > -1)
					}
					return false;
				},
				isAsyncCode: function () {
					var scriptsWithoutSrc = this.dom.find("script:not([src])"),
						scriptsWithSrc = this.dom.find("script[src]"),
						ins = this.dom.find("ins.adsbygoogle");
					if (scriptsWithoutSrc.length == scriptsWithSrc.length == ins.length == 1) {
						scriptsWithSrc = scriptsWithSrc.get(0);
						return (scriptsWithSrc.src.indexOf('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js') > -1 && this.isNonEmpty(ins.attr("data-ad-client")) && this.isNonEmpty(ins.attr("data-ad-slot")))
					}
					return false;
				},
				getAdsenseAsyncCode: function (adConfig) {
					var adCode = [];
					adCode.push('<scr' + 'ipt async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></scr' + 'ipt>');
					adCode.push('<ins class="adsbygoogle" style="display:inline-block;width:' + adConfig.width + 'px;height:' + adConfig.height + 'px" data-ad-client="' + adConfig.pubid + '" data-ad-slot="' + adConfig.adslot + '"></ins>');
					adCode.push('<scr' + 'ipt> (adsbygoogle = window.adsbygoogle || []).push({}); </scr' + 'ipt>');
					return adCode.join("\n");
				},
				changeSyncToAsync: function () {
					var scriptsWithoutSrc = this.dom.find("script:not([src])");
					if (scriptsWithoutSrc.length == 1) {
						$.globalEval(scriptsWithoutSrc.get(0).textContent);
						if (google_ad_width && google_ad_height && google_ad_slot && google_ad_client)
							return this.getAdsenseAsyncCode({ width: google_ad_width, height: google_ad_height, pubid: google_ad_client, adslot: google_ad_slot })
					}
					return false;
				},
				toggleTransform: function (data) {
					this.runCode(data);
					if (!this.isCodeAdsense()) {
						return {
							error: 1,
							message: "We only support Adsense code as control."
						};
					} else if (this.isAsyncCode()) {
						var code = this.getAdcode(data);
						return {
							error: 0,
							code: code
						}
					} else if (this.isOldAdsenseCode()) {
						return {
							error: 1,
							message: "We don't support Old Adsense code, please use async adsense code."
						};
					} else if (this.isSyncAdsense()) {
						var adCode = this.changeSyncToAsync();
						return !adCode ? { error: 1, "message": "There was some issue in control conversion plz contact support" } : { error: 0, code: adCode };
					} else {
						return {
							error: 1,
							message: "Some error occurred."
						}
					}
				},

				isSiteIdNotValid: function (siteId) {
					var siteIdValue = siteId || this.siteId,
						isNotValid = !(siteIdValue && Number(siteIdValue)),
						isSiteIdInput = !!($userSiteIdInput.length);

					if (isNotValid) {
						alert('Please enter a valid site id for code generation');
						if (isSiteIdInput) { $userSiteIdInput.val('').focus(); }
					}

					return isNotValid;
				},

				setHiddenParamData: function () {
					var $viewModeHiddenInput = $('.js-input-hidden-viewMode'),
						$siteIdHiddenInput = $('.js-input-hidden-siteId'),
						isViewMode = Number($viewModeHiddenInput.val()),
						siteId = Number($siteIdHiddenInput.val()),
						isViewModeValid = !!(isViewMode && siteId);

					if (!isViewModeValid) { return; }
					this.isViewMode = isViewMode;
					this.siteId = siteId;
				},

				// checkViewMode refers to whether user session is currently active (user has logged in or not)
				// and 'siteid' is present as a query parameter or not
				checkViewMode: function () {
					var isValid = !!(this.isViewMode && this.siteId);

					return isValid;
				},

				scrollToCodeSection: function (isScroll) {
					if (!isScroll) { return false; }

					var adCodeWrapperOffsets = $adCodeWrapperRow.offset(),
						adCodeWrapperTop = adCodeWrapperOffsets.top,
						headerHeight = $headerDiv.height(),
						heightOffset = 15,
						computedScrollTop = (adCodeWrapperTop - (headerHeight + heightOffset));

						$body.stop().animate({scrollTop: 170}, '500', 'swing');
				},

				enableViewMode: function () {
					var isMode = this.checkViewMode(),
						siteId = this.siteId;

					if (!isMode) { return; }

					$userSiteIdInput
						.val(siteId)
						.attr('disabled', true)
						.prop('disabled', true)
						.addClass('disabled');
					$initCodeButton
						.trigger('click')
						.addClass('hide disabled')
						.attr('disabled', true);
					this.scrollToCodeSection(isMode);
				},

				// Initialise tools module
				init: function () {
					this.setHiddenParamData();
					this.enableViewMode();
				}
			},
			$initCodeTextArea = $('.js-header-code-textarea'),
			$userSiteIdInput = $('.js-user-siteId'),
			$initCodeWrapper = $('.js-header-code-wrapper'),
			$adCodeConversionTextArea = $('.js-textarea-adcode-conversion'),
			$initCodeButton = $('.js-init-code-btn'),
			$adCodeWrapperRow = $('.js-adcode-wrapper-row'),
			$headerDiv = $('.js-site-header'),
			$body = $('body');

		$userSiteIdInput.off('change').on('change', function () {
			var $el = $(this),
				siteIdValue = $el.val(),
				isSiteIdNotValid = toolsModule.isSiteIdNotValid(siteIdValue);

			if (isSiteIdNotValid) { return; }

			siteIdValue = Number(siteIdValue);
			toolsModule.siteId = siteIdValue;
		});

        // Send code to dev trigger
        $('#sendCodeForm').submit(function (e) {
            e.preventDefault();
            $('#initCodeInput').val($('#header-code').val());

            var data = $(this).serialize(),
                btn = $('#sendCodeSubmit');
            toolsModule.sendHeaderCode(data, btn);
        });

        // Trigger code conversion
        $('#code-conversion-button').click(function (e) {
            e.preventDefault();
            var inputBox = $adCodeConversionTextArea,
				inputBoxValue = inputBox.val(),
				siteIdValue = toolsModule.siteId,
				isSiteIdNotValid = toolsModule.isSiteIdNotValid(),
				convertedCode;

			if (isSiteIdNotValid) { return; }

            if (!inputBoxValue || inputBoxValue === '') {
				alert('Please enter control ad code!');
				inputBox.focus();
                return;
			}

            resultObject = toolsModule.toggleTransform(inputBoxValue);
            if (resultObject.error == 0) {
                inputBox.val(resultObject.code);
            } else {
                alert(resultObject.message);
            }
        });

		// Generic clipboard copy button click event handler
		$('.js-clipboard-copy-btn').off('click').on('click', function (e) {
			var $el = $(e.target),
				$targetEl = $el.closest('.js-snippet-wrapper').find('.js-code-textarea'),
				$clipBoardEl = $targetEl.prev();

            e.preventDefault();
            toolsModule.copyToClipboard($targetEl, $clipBoardEl);
		});

		// Generic Code textarea click event handler
		$('.js-code-textarea').off('click').on('click', function (e) {
			var $targetEl = $(e.target),
				$clipBoardEl = $targetEl.prev();

			e.preventDefault();
			toolsModule.copyToClipboard($targetEl, $clipBoardEl);
		});

		$initCodeButton.off('click').on('click', function () {
			var siteIdValue = toolsModule.siteId,
				isSiteIdNotValid = toolsModule.isSiteIdNotValid(),
				generatedHeaderCode;

			if (isSiteIdNotValid) {
				$initCodeWrapper.addClass('hide');
				$initCodeTextArea.val('');
				return;
			}

			siteIdValue = Number(siteIdValue);
			generatedHeaderCode = toolsModule.generateHeaderCode(siteIdValue);
			$initCodeTextArea.val('').val(generatedHeaderCode);
			$initCodeWrapper.removeClass('hide');
		});

		toolsModule.init();
	})(window, document);
});
