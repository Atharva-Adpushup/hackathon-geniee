(function (W, $) {
	var $dropDownFieldWrapper = $('.js-websiteRevenue-dropdown-wrapper'),
		$exactRevenueFieldWrapper = $('.js-websiteRevenue-exact-wrapper'),
		$exactRevenueField = $('#signup-exactRevenue', $exactRevenueFieldWrapper);

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
	}

	function toggleExactRevenueField($element) {
		var value = $element.val(),
			leastRevenueConstant = '999',
			isValue = !!(value),
			isMinimunRevenueMatch = !!(isValue && (leastRevenueConstant === value));

		if (isMinimunRevenueMatch) {
			$dropDownFieldWrapper
				.removeClass('col-md-12 pd-0')
				.addClass('col-md-6 u-padding-r15px');
			$exactRevenueFieldWrapper
				.removeClass('hide');
			$exactRevenueField
				.val('');
		} else {
			$dropDownFieldWrapper
				.removeClass('col-md-6 u-padding-r15px')
				.addClass('col-md-12 pd-0');
			$exactRevenueFieldWrapper
				.addClass('hide');
		}
	}

	function setInteractionHandlers() {
		var $dropdownField = $('#signup-websiteRevenue'),
			$urlField = $('#signup-website');

		$urlField.off('change').on('change', function() {
			if (this.value.indexOf('http://') !== 0 && this.value.indexOf('https://') !== 0) {
				this.value = 'http://' + this.value;
			}
		});

		$dropdownField.off('change').on('change', function () {
			var $el = $(this);

			toggleExactRevenueField($el);
		});
	}

	function showUiErrors(validatorRef, $form, errorsObj) {
		validatorRef.successList.forEach(function(elem) {
			var $errorElem = $('.js-' + elem.name + '-error', $form);

			$errorElem.empty();
		});

		Object.keys(errorsObj).forEach(function(val) {
			var errorMessage = errorsObj[val],
				$errorEl = $('.js-' + val + '-error', $form);

			$errorEl
				.empty()
				.html(errorMessage);
		});
	}

	function validateElement(element) {
		return $(element).valid();
	}

	function addValidationMethods() {
		$.validator.addMethod('isAdNetworksNull', function(value, element) {
			return (value && element.value) ? true : false;
		}, 'Please select atleast one ad network');
	}

	function getFormParams(form) {
		var json = {};
		$(form).serializeArray().forEach(function(obj) {
			if (json.hasOwnProperty(obj.name) && json[obj.name]) {
				(obj.name === 'adNetworks') ? json[obj.name].push(obj.value) : json[obj.name] = obj.value;
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
					'required': true,
					'rangelength': [1, 150]
				},
				email: {
					'required': true,
					'email': true
				},
				password: {
					'required': true,
					'rangelength': [6, 32]
				},
				site: {
					'required': true,
					'url': 'true'
				},
				pageviewRange: {
					'required': true
				},
				adNetworks: {
					'required': true,
					'isAdNetworksNull': true
				},
				termsPolicy: {
					'required': true
				},
				exactRevenue: {
					'required': true,
					'range': [0, 999]
				}
			},
			messages: {
				name: {
					'required': 'Please fill out name',
					'rangelength': 'Enter name between 1 and 150'
				},
				email: {
					'required': 'Please fill out email id',
					'email': 'Enter email in name@example.com format'
				},
				password: {
					'required': 'Please fill out password',
					'rangelength': 'Enter password between 6 and 32'
				},
				site: {
					'required': 'Please fill out site url',
					'url': 'Enter url in valid format'
				},
				pageviewRange: {
					'required': 'Please select a page view range'
				},
				adNetworks: {
					'required': 'Please select atleast one ad network'
				},
				termsPolicy: {
					'required': 'Please agree to our Terms of Service & Privacy Policy'
				},
				exactRevenue: {
					'required': 'Please enter your exact revenue amount',
					'range': 'Enter revenue amount between 0 and 999'
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
			invalidHandler: function() {
			}
		});
	}

	$(document).ready(function() {
		setUiData();
		setInteractionHandlers();
		validateTermsCheckbox();
		// addValidationMethods();
		validateSignupForm();
	});
})(window, jQuery);
