(function(W, $, Ck) {
	var $nameFieldWrapper = $('.js-signup-name-wrapper'),
		$emailFieldWrapper = $('.js-signup-emailId-wrapper'),
		$dropDownFieldWrapper = $('.js-websiteRevenue-dropdown-wrapper'),
		$exactRevenueFieldWrapper = $('.js-websiteRevenue-exact-wrapper'),
		$exactRevenueField = $('#signup-exactRevenue', $exactRevenueFieldWrapper),
		utils = {
			btoa: function(value) {
				return btoa(encodeURI(JSON.stringify(value)));
			},
			atob: function(value) {
				return JSON.parse(decodeURI(atob(value)));
			},
			rightTrim: function(string, s) {
				return string ? string.replace(new RegExp(s + '*$'), '') : '';
			},
			domanize: function(domain) {
				return domain
					? this.rightTrim(
							domain
								.replace('http://', '')
								.replace('https://', '')
								.replace('www.', ''),
							'/'
						)
					: '';
			}
		},
		isDocumentReferrer = !!W.document.referrer,
		utmParameters = {
			firstHit: utils.domanize(W.location.href),
			firstReferrer: isDocumentReferrer ? utils.domanize(W.document.referrer) : 'direct'
		},
		constants = {
			cookie: {
				firstHit: 'adp_fh'
			}
		};

	function getCookie(name) {
		return Ck.get(name);
	}

	function setCookie(name, value, expiryDays) {
		Ck.set(name, value, { expires: expiryDays, domain: 'adpushup.com' });
	}

	function getFirstHitCookieData() {
		var inputCookieData = getCookie(constants.cookie.firstHit),
			isCookie = !!inputCookieData,
			cookieName = constants.cookie.firstHit,
			cookieData,
			encodedData;

		if (!isCookie) {
			cookieData = {
				firstHit: utmParameters.firstHit,
				firstReferrer: utmParameters.firstReferrer
			};
			encodedData = utils.btoa(cookieData);
			setCookie(cookieName, encodedData, 30);
			return cookieData;
		}

		cookieData = utils.atob(inputCookieData);
		return cookieData;
	}

	function getFirstHitUtmParameters() {
		var cookieData = getFirstHitCookieData(),
			computedObj;

		if (!cookieData) {
			return false;
		}

		computedObj = {
			utm_firstHit: cookieData.firstHit,
			utm_firstReferrer: cookieData.firstReferrer
		};
		return computedObj;
	}

	function validateTermsCheckbox() {
		var termsStr = 'Please agree to our Terms of Service & Privacy Policy',
			$form = $('.js-signup-form'),
			$termsCheckbox = $('#signup-termsPolicy', $form);

		if ($termsCheckbox.get(0).validity && $termsCheckbox.get(0).setCustomValidity) {
			$termsCheckbox.get(0).setCustomValidity(termsStr);
		}

		$termsCheckbox.off('change').on('change', function() {
			var $el = $(this),
				el = this;

			if ((el.validity && el.validity.valueMissing) || !$el.is(':checked')) {
				el.setCustomValidity(termsStr);
			} else if ((el.validity && !el.validity.valueMissing) || $el.is(':checked')) {
				el.setCustomValidity('');
			}
		});
	}

	function setUiData() {
		$('#signup-adNetworks').multiselect({
			inheritClass: true,
			nonSelectedText: 'Ad Networks Used',
			onDropdownHidden: function() {
				return this.$select.valid();
			}
		});
		appendQueryParameters();
	}

	function toggleExactRevenueField($element) {
		var value = $element.val(),
			leastRevenueConstant = '999',
			isValue = !!value,
			isMinimunRevenueMatch = !!(isValue && leastRevenueConstant === value);

		if (isMinimunRevenueMatch) {
			$dropDownFieldWrapper.removeClass('col-md-12 pd-0').addClass('col-md-6 u-padding-r15px');
			$exactRevenueFieldWrapper.removeClass('hide');
			$exactRevenueField.val('');
		} else {
			$dropDownFieldWrapper.removeClass('col-md-6 u-padding-r15px').addClass('col-md-12 pd-0');
			$exactRevenueFieldWrapper.addClass('hide');
		}
	}

	function setInteractionHandlers() {
		var $dropdownField = $('#signup-websiteRevenue'),
			$urlField = $('#signup-website'),
			$window = $(W);

		$urlField.off('change').on('change', function() {
			if (this.value.indexOf('http://') !== 0 && this.value.indexOf('https://') !== 0) {
				this.value = 'http://' + this.value;
			}
		});

		$dropdownField.off('change').on('change', function() {
			var $el = $(this);

			toggleExactRevenueField($el);
			adjustLayoutForSmallScreens();
		});

		$window.off('resize').on('resize', adjustLayoutForSmallScreens);
	}

	function showUiErrors(validatorRef, $form, errorsObj) {
		validatorRef.successList.forEach(function(elem) {
			var $errorElem = $('.js-' + elem.name + '-error', $form);

			$errorElem.empty();
		});

		Object.keys(errorsObj).forEach(function(val) {
			var errorMessage = errorsObj[val],
				$errorEl = $('.js-' + val + '-error', $form);

			$errorEl.empty().html(errorMessage);
		});
	}

	function validateElement(element) {
		return $(element).valid();
	}

	function addValidationMethods() {
		$.validator.addMethod(
			'isAdNetworksNull',
			function(value, element) {
				return value && element.value ? true : false;
			},
			'Please select atleast one ad network'
		);
	}

	function getFormParams(form) {
		var json = {};
		$(form)
			.serializeArray()
			.forEach(function(obj) {
				if (json.hasOwnProperty(obj.name) && json[obj.name]) {
					obj.name === 'adNetworks' ? json[obj.name].push(obj.value) : (json[obj.name] = obj.value);
				} else if (obj.name === 'adNetworks') {
					json[obj.name] = [];
					json[obj.name].push(obj.value);
				} else {
					json[obj.name] = obj.value;
				}
			});

		return json;
	}

	function validateSignupForm() {
		var $form = $('.js-signup-form');

		$form.validate({
			rules: {
				name: {
					required: true,
					rangelength: [1, 150]
				},
				email: {
					required: true,
					email: true
				},
				password: {
					required: true,
					rangelength: [6, 32]
				},
				site: {
					required: true,
					url: 'true'
				},
				pageviewRange: {
					required: true
				},
				adNetworks: {
					required: true,
					isAdNetworksNull: true
				},
				termsPolicy: {
					required: true
				},
				exactRevenue: {
					required: true,
					range: [0, 999]
				}
			},
			messages: {
				name: {
					required: 'Please fill out name',
					rangelength: 'Enter name between 1 and 150'
				},
				email: {
					required: 'Please fill out email id',
					email: 'Enter email in name@example.com format'
				},
				password: {
					required: 'Please fill out password',
					rangelength: 'Enter password between 6 and 32'
				},
				site: {
					required: 'Please fill out site url',
					url: 'Enter url in valid format'
				},
				pageviewRange: {
					required: 'Please select a page view range'
				},
				adNetworks: {
					required: 'Please select atleast one ad network'
				},
				termsPolicy: {
					required: 'Please agree to our Terms of Service & Privacy Policy'
				},
				exactRevenue: {
					required: 'Please enter your exact revenue amount',
					range: 'Enter revenue amount between 0 and 999'
				}
			},
			onkeyup: validateElement,
			onfocusout: validateElement,
			showErrors: function(errorsObj) {
				return showUiErrors(this, $form, errorsObj);
			},
			submitHandler: function(form) {
				form.submit();
				return false;
			},
			invalidHandler: function() {}
		});
	}

	function adjustLayoutForSmallScreens() {
		var windowWidth = W.innerWidth,
			constants = {
				padding: {
					pxr15: 'u-padding-r15px',
					px0: 'u-padding-0px'
				},
				width: {
					breakPoint: 992
				}
			},
			hasNameWrapperPaddingClass = !!$nameFieldWrapper.hasClass(constants.padding.pxr15),
			hasEmailWrapperPaddingClass = !!$emailFieldWrapper.hasClass(constants.padding.pxr15),
			hasDropDownWrapperPaddingClass = !!$dropDownFieldWrapper.hasClass(constants.padding.pxr15),
			isWidthLessThanBreakPoint = !!(constants.width.breakPoint > windowWidth),
			isExactRevenueWrapperVisible = !!(
				$exactRevenueFieldWrapper.width() > 0 && $exactRevenueFieldWrapper.height() > 0
			),
			isExactRevenueVisible = isExactRevenueWrapperVisible && hasDropDownWrapperPaddingClass;

		if (!isWidthLessThanBreakPoint) {
			if (!hasNameWrapperPaddingClass) {
				$nameFieldWrapper.removeClass(constants.padding.px0).addClass(constants.padding.pxr15);
			}
			if (!hasEmailWrapperPaddingClass) {
				$emailFieldWrapper.removeClass(constants.padding.px0).addClass(constants.padding.pxr15);
			}
			if (isExactRevenueWrapperVisible) {
				$dropDownFieldWrapper.removeClass(constants.padding.px0).addClass(constants.padding.pxr15);
			}
			return;
		}

		$nameFieldWrapper.removeClass(constants.padding.pxr15).addClass(constants.padding.px0);
		$emailFieldWrapper.removeClass(constants.padding.pxr15).addClass(constants.padding.px0);
		if (isExactRevenueVisible) {
			$dropDownFieldWrapper.removeClass(constants.padding.pxr15).addClass(constants.padding.px0);
		}
	}

	function appendQueryParameters() {
		var utmParams = {
			utm_source: 'utmSource',
			utm_medium: 'utmMedium',
			utm_campaign: 'utmCampaign',
			utm_term: 'utmTerm',
			utm_name: 'utmName',
			utm_content: 'utmContent',
			utm_firstHit: 'utmFirstHit',
			utm_firstReferrer: 'utmFirstReferrer'
		};

		function mapKeyToParams(key) {
			return utmParams[key] || false;
		}

		function fetchQueryParams() {
			var match,
				queryParams = {},
				pl = /\+/g, // Regex for replacing addition symbol with a space
				search = /([^&=]+)=?([^&]*)/g,
				decode = function(s) {
					return decodeURIComponent(s.replace(pl, ' '));
				},
				query = window.location.search.substring(1),
				firstHitUtmParameters = getFirstHitUtmParameters(),
				isFirstHitValid = !!(
					firstHitUtmParameters &&
					firstHitUtmParameters.hasOwnProperty('utm_firstHit') &&
					firstHitUtmParameters.hasOwnProperty('utm_firstReferrer')
				);

			while ((match = search.exec(query))) {
				queryParams[decode(match[1])] = decode(match[2]);
			}

			if (isFirstHitValid) {
				queryParams = $.extend(true, {}, queryParams, firstHitUtmParameters);
			}

			return queryParams;
		}

		var queryParams = fetchQueryParams(),
			form = document.querySelector('.js-signup-form'),
			keys = Object.keys(queryParams);

		keys.forEach(function(param) {
			var ele = document.createElement('input'),
				name = mapKeyToParams(param);

			if (name) {
				ele.name = name;
				ele.type = 'hidden';
				ele.value = queryParams[param];
				form.appendChild(ele);
			}
		});
	}

	$(document).ready(function() {
		setUiData();
		setInteractionHandlers();
		validateTermsCheckbox();
		// addValidationMethods();
		validateSignupForm();
		adjustLayoutForSmallScreens();
	});
})(window, jQuery, Cookies);
