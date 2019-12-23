// Settings module script

$(document).ready(function() {
	(function(w, d) {
		var isAutoOptimiseChanged = false;
		// Settings module object
		var settingsModule = {
			// Settings templates
			templates: {
				headerCode:
					"(function(w, d) { var s = d.createElement('script'); s.src = '//cdn.adpushup.com/" +
					w.selectedSiteId +
					"/adpushup.js'; s.type = 'text/javascript'; s.async = true; (d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s); })(window, document);",
				closeBtn: '<span class="pull-right removeBlocklistItem"><i class="fa fa-close"></i></span>'
			},

			// Function to generate header code
			generateHeaderCode: function() {
				$('#header-code').text(
					'<script data-cfasync="false" type="text/javascript">' +
						this.templates.headerCode +
						'</script>'
				);
			},

			// Function to render block list items
			renderBlocklistItems: function() {
				var that = this;
				if (w.blocklist[0] !== '') {
					$('.blocklist').html('');
					w.blocklist.forEach(function(item) {
						$('.blocklist').append('<li>' + item + that.templates.closeBtn + '</li>');
					});
				}
			},

			// Function to add item to blocklist
			addToBlocklist: function(blocklistItem, input) {
				if (blocklistItem) {
					var alreadyAdded = w.blocklist.find(function(item) {
						return item === blocklistItem;
					});

					if (!alreadyAdded) {
						w.blocklist.push(blocklistItem);
						this.renderBlocklistItems();
						$('#blocklistErr').html('');
						$(input).val('');
					} else {
						$('#blocklistErr').html('This item has already been added to the blocklist');
					}
				}
			},

			// Function to remove item from blocklist
			removeFromBlocklist: function(item) {
				w.blocklist.splice(w.blocklist.indexOf(item), 1);
				this.renderBlocklistItems();
			},

			// Function to parse form data
			parseFormData: function(values, type) {
				switch (type) {
					case 'pageGroups':
						var pageGroupPatterns = [];

						for (var i = 0; i < values.length; i += 2) {
							if (values[i].name === 'pageGroupPattern') {
								if (!values[i + 2].value) {
									return '';
								}

								var parsedData = JSON.parse(values[i].value),
									pattern = values[i + 1].value;

								pageGroupPatterns.push({
									pageGroup: parsedData.pageGroup,
									platform: parsedData.platform,
									pattern: pattern
								});
							}
						}

						return pageGroupPatterns;
					case 'other':
						var otherSettings = {};
						for (var i = 0; i < values.length; i++) {
							if (values[i].name !== 'pageGroupPattern') {
								otherSettings[values[i].name] = values[i].value;
							}
						}

						return otherSettings;
				}
			},

			// Function to save site settings
			saveSiteSettings: function(formValues) {
				var $error = $('#error'),
					parsedPageGroups = this.parseFormData(formValues, 'pageGroups');

				if (!parsedPageGroups) {
					$error.html(
						'Pagegroup pattern cannot be blank. Please provide valid regex patterns for all the pagegroups.'
					);
				} else {
					var parsedFormValues = this.parseFormData(formValues, 'other'),
						poweredByBanner = parsedFormValues.poweredByBanner ? true : false,
						activeDFPNetwork = parsedFormValues.activeDFPNetwork,
						activeDFPCurrencyCode = parsedFormValues.activeDFPCurrencyCode,
						autoOpt = parsedFormValues.autoOptimise ? true : false,
						isSPA = parsedFormValues.isSPA ? true : false,
						isThirdPartyAdx = parsedFormValues.isThirdPartyAdx ? true : false,
						spaPageTransitionTimeout = parsedFormValues.spaPageTransitionTimeout,
						dfpInfo = activeDFPNetwork ? activeDFPNetwork.split('-') : [],
						activeDFPNetwork = dfpInfo.length ? dfpInfo[0] : '',
						activeDFPParentId = dfpInfo.length ? dfpInfo[1] : '',
						pageGroupPattern = JSON.stringify(parsedPageGroups),
						otherSettings = JSON.stringify(parsedFormValues),
						gdprCompliance = parsedFormValues.gdprCompliance ? true : false,
						cookieControlConfig = parsedFormValues.cookieControlConfig
							? parsedFormValues.cookieControlConfig
							: {};

					$error.html('');
					$.post(
						'saveSiteSettings',
						{
							pageGroupPattern: pageGroupPattern,
							otherSettings: otherSettings,
							autoOptimise: autoOpt,
							isSPA: isSPA,
							isThirdPartyAdx: isThirdPartyAdx,
							spaPageTransitionTimeout: spaPageTransitionTimeout,
							activeDFPNetwork: activeDFPNetwork,
							activeDFPParentId: activeDFPParentId,
							activeDFPCurrencyCode: activeDFPCurrencyCode,
							gdprCompliance: gdprCompliance,
							cookieControlConfig: cookieControlConfig,
							blocklist: JSON.stringify(w.blocklist),
							isAutoOptimiseChanged: isAutoOptimiseChanged,
							poweredByBanner: poweredByBanner
						},
						function(res) {
							if (res.success) {
								alert('Settings saved!');
							} else {
								alert('Some error occurred!');
							}
						}
					);
				}
			},

			// Copy header code to clipboard
			copyToClipboard: function(flag) {
				$('.clipboard-copy').fadeIn();
				setTimeout(function() {
					$('.clipboard-copy').fadeOut();
				}, 1500);
				if (flag) {
					$('#code-conversion-box').select();
				} else {
					$('#header-code').select();
				}
				d.execCommand('copy');
			},

			// Send header code to developer
			sendHeaderCode: function(data, btn) {
				$(btn)
					.prop('disabled', true)
					.html('Sending...');
				$.post('/user/sendCode', data, function(res) {
					if (res.success) {
						$('#sendCodeSubmit')
							.css('opacity', 1)
							.html('Code sent successfully!');
						setTimeout(function() {
							$('#sendToDevModal').modal('toggle');
							$(btn)
								.prop('disabled', false)
								.html('Send');
						}, 2000);
					} else {
						alert('Some error occurred!');
					}
				});
			},

			// Convert Ad Code Functions
			base64_encode: function(data) {
				try {
					if (window.btoa) {
						return window.btoa(data);
					}

					var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
					var o1,
						o2,
						o3,
						h1,
						h2,
						h3,
						h4,
						bits,
						i = 0,
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

						bits = (o1 << 16) | (o2 << 8) | o3;

						h1 = (bits >> 18) & 0x3f;
						h2 = (bits >> 12) & 0x3f;
						h3 = (bits >> 6) & 0x3f;
						h4 = bits & 0x3f;

						tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
					} while (i < data.length);

					enc = tmp_arr.join('');

					var r = data.length % 3;

					return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
				} catch (err) {
					alert('Unable to transform, Please contact our support team.');
					return false;
				}
			},
			randomString: function(len) {
				len = len && Number(len) && len > 1 ? len : 10;

				return Math.random()
					.toString(32)
					.substr(2, len);
			},
			getAdcode: function(data) {
				var encodedAd = this.base64_encode(data),
					randomControlId = this.randomString(5);

				if (!encodedAd) {
					return false;
				}

				var newAdCode = [
					'<ins class="adPushupAds" data-adpControl="' +
						randomControlId +
						'" data-ver="2" data-siteId="' +
						w.selectedSiteId +
						'" data-ac="' +
						encodedAd +
						'"></ins>' +
						'<script data-cfasync="false" type="text/javascript">(function (w, d) { for (var i = 0, j = d.getElementsByTagName("ins"), k = j[i]; i < j.length; k = j[++i]){ if(k.className == "adPushupAds" && k.getAttribute("data-push") != "1") { ((w.adpushup = w.adpushup || {}).control = (w.adpushup.control || [])).push(k); k.setAttribute("data-push", "1");} } })(window, document);</script>'
				];

				return newAdCode.join('\n');
			},
			isNonEmpty: function(val) {
				if (!val || typeof val == 'undefined' || val == null || (val.trim && val.trim() == ''))
					return false;
				return true;
			},
			runCode: function(data) {
				this.dom = $('<div>' + data + '</div>');
			},
			isCodeAdsense: function() {
				return this.dom.html().indexOf('pagead2.googlesyndication.com') != -1;
			},
			isSyncAdsense: function() {
				var script = this.dom.find('script[src]'),
					scriptTag = this.dom.find('script:not([src])');
				if (script.length == 1 && scriptTag.length == 1) {
					script = script.get(0);
					scriptTag = scriptTag.html();
					return (
						script.src.trim().indexOf('pagead2.googlesyndication.com/pagead/show_ads.js') > -1 &&
						scriptTag.indexOf('google_ad_client') > -1 &&
						scriptTag.indexOf('google_ad_slot') > -1
					);
				}
				return false;
			},
			isOldAdsenseCode: function() {
				var script = this.dom.find('script:not([src])');
				if (script.length == 1) {
					script = script.html();
					return (
						script.indexOf('google_color_border') > -1 &&
						script.indexOf('google_color_bg') > -1 &&
						script.indexOf('google_color_link') > -1
					);
				}
				return false;
			},
			isAsyncCode: function() {
				var scriptsWithoutSrc = this.dom.find('script:not([src])'),
					scriptsWithSrc = this.dom.find('script[src]'),
					ins = this.dom.find('ins.adsbygoogle');
				if (((scriptsWithoutSrc.length == scriptsWithSrc.length) == ins.length) == 1) {
					scriptsWithSrc = scriptsWithSrc.get(0);
					return (
						scriptsWithSrc.src.indexOf('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js') >
							-1 &&
						this.isNonEmpty(ins.attr('data-ad-client')) &&
						this.isNonEmpty(ins.attr('data-ad-slot'))
					);
				}
				return false;
			},
			getAdsenseAsyncCode: function(adConfig) {
				var adCode = [];
				adCode.push(
					'<scr' +
						'ipt async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></scr' +
						'ipt>'
				);
				adCode.push(
					'<ins class="adsbygoogle" style="display:inline-block;width:' +
						adConfig.width +
						'px;height:' +
						adConfig.height +
						'px" data-ad-client="' +
						adConfig.pubid +
						'" data-ad-slot="' +
						adConfig.adslot +
						'"></ins>'
				);
				adCode.push(
					'<scr' + 'ipt> (adsbygoogle = window.adsbygoogle || []).push({}); </scr' + 'ipt>'
				);
				return adCode.join('\n');
			},
			changeSyncToAsync: function() {
				var scriptsWithoutSrc = this.dom.find('script:not([src])');
				if (scriptsWithoutSrc.length == 1) {
					$.globalEval(scriptsWithoutSrc.get(0).textContent);
					if (google_ad_width && google_ad_height && google_ad_slot && google_ad_client)
						return this.getAdsenseAsyncCode({
							width: google_ad_width,
							height: google_ad_height,
							pubid: google_ad_client,
							adslot: google_ad_slot
						});
				}
				return false;
			},
			toggleTransform: function(data) {
				this.runCode(data);
				if (!this.isCodeAdsense()) {
					return {
						error: 1,
						message: 'We only support Adsense code as control.'
					};
				} else if (this.isAsyncCode()) {
					var code = this.getAdcode(data);
					return {
						error: 0,
						code: code
					};
				} else if (this.isOldAdsenseCode()) {
					return {
						error: 1,
						message: "We don't support Old Adsense code, please use async adsense code."
					};
				} else if (this.isSyncAdsense()) {
					var adCode = this.changeSyncToAsync();
					return !adCode
						? {
								error: 1,
								message: 'There was some issue in control conversion plz contact support'
						  }
						: { error: 0, code: adCode };
				} else {
					return {
						error: 1,
						message: 'Some error occurred.'
					};
				}
			},

			// Initialise settings module
			init: function(list) {
				this.renderBlocklistItems();
				this.generateHeaderCode();
			}
		};
		settingsModule.init();

		// Auto optimise check trigger
		var autoOptimise;
		$('#autoOptimise').on('change', function() {
			isAutoOptimiseChanged = true;
			autoOptimise = $(this).prop('checked');
			!autoOptimise
				? $('#autoOptimiseErr').html(
						'NOTE: AdPushup might be disabled right now for this site. Kindly set the traffic manually for each variation in all the page groups present for this site. Kindly, do save settings below. <br/><br/> To update the traffic, go to Editor > Load Page Group > Traffic Distribution.'
				  )
				: $('#autoOptimiseErr').html('');

			var autoOptimiseValues = $('td[data-identifier="autoptimise"]'),
				toAdd = autoOptimise ? 'green' : 'red';
			autoOptimiseValues.each(function(index, ele) {
				ele.innerText = autoOptimise ? 'Enabled' : 'Disabled';
				ele.classList.remove('green');
				ele.classList.remove('red');
				ele.classList.add(toAdd);
			});
		});

		// Active DFP Network change handler
		$('#activeDFPNetwork').on('change', function(e) {
			var $checkedOption = $('option:selected', this),
				currencyCode = $checkedOption.attr('data-currencyCode'),
				$currencyTable = $('.js-currency-table'),
				$currencyTd = $('#currencyValue'),
				$activeDFPCurrencyCodeHiddenInput = $('#activeDFPCurrencyCode'),
				$thirdPartyAdxWrapper = $('.js-thirdpartyadx-wrapper'),
				$thirdPartyAdxInput = $('#isThirdPartyAdx');

			if (!currencyCode) {
				$currencyTable.addClass('u-hide');
				$currencyTd.text('');
				$activeDFPCurrencyCodeHiddenInput.val('');

				$thirdPartyAdxWrapper.addClass('u-hide');
				$thirdPartyAdxInput.prop('checked', false);
				return;
			}

			$currencyTd.text(currencyCode);
			$activeDFPCurrencyCodeHiddenInput.val(currencyCode);
			$currencyTable.removeClass('u-hide');

			$thirdPartyAdxWrapper.removeClass('u-hide');
		});

		// Copy to clipboard trigger
		$(d).on('click', '#clipboardCopy, #header-code', function() {
			settingsModule.copyToClipboard();
		});

		// Send code to dev trigger
		$('#sendCodeForm').submit(function(e) {
			e.preventDefault();
			$('#headerCodeInput').val($('#header-code').val());

			var data = $(this).serialize(),
				btn = $('#sendCodeSubmit');
			settingsModule.sendHeaderCode(data, btn);
		});

		// Add to blocklist trigger
		$('#addBlocklistItem').on('click', function() {
			var blocklistItem = $('#blocklistItem').val();
			settingsModule.addToBlocklist(blocklistItem, '#blocklistItem');
		});

		// Remove from blocklist trigger
		$(d).on('click', '.removeBlocklistItem', function() {
			var itemToRemove = $(this)
				.closest('li')
				.text();
			settingsModule.removeFromBlocklist(itemToRemove);
		});

		// Save settings trigger
		$('#saveSiteSettings').on('submit', function(e) {
			e.preventDefault();

			var formValues = $(this).serializeArray();
			settingsModule.saveSiteSettings(formValues);
		});

		// Trigger code conversion
		$('#code-conversion-button').click(function(e) {
			e.preventDefault();
			var inputBox = $('#code-conversion-box'),
				inputBoxValue = inputBox.val(),
				convertedCode;
			if (!inputBoxValue || inputBoxValue == '') {
				alert('Please enter control ad code!');
				ap.apAlert('Please enter control ad code!', '#apdetect', 'inverted', 'slideDown');
				return;
			}
			resultObject = settingsModule.toggleTransform(inputBoxValue);
			if (resultObject.error == 0) {
				inputBox.val(resultObject.code);
			} else {
				alert(resultObject.message);
			}
		});

		$('#clipboard-copy-adcode').click(function(e) {
			e.preventDefault();
			settingsModule.copyToClipboard(1);
		});
	})(window, document);
});
