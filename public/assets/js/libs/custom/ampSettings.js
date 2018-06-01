$(document).ready(function() {
	(function(w, d) {
		var settingsModule = {
			parseFormData: function(values) {
				var data = {
					selectors: {},
					social: {
						apps: [],
						include: false
					},
					customCSS: {
						value: ''
					},
					toDelete: []
				};

				for (var i = 0; i < values.length; i++) {
					if (values[i].value) {
						if (w.ampSettingsConfig.selectors[values[i].name]) {
							data.selectors[values[i].name] = values[i].value;
						} else if (w.ampSettingsConfig.socialApps[values[i].name] && values[i].value == 'on') {
							data.social.apps.push(values[i].name);
						} else if (values[i].name == 'includeSocialLinks' && values[i].value == 'on')
							data.social.include = true;
						else if (values[i].name == 'placementSocial') data.social.placement = values[i].value;
						else if (values[i].name == 'customCss') data.customCSS.value = values[i].value;
						else if (values[i].name == 'toDelete') {
							data.toDelete = values[i].value ? values[i].value.split(',') : [];
						} else data[values[i].name] = values[i].value;
					}
				}
				return data;
			}
		};
		$('#saveAmpSettings').on('submit', function(e) {
			e.preventDefault();

			var formValues = $(this).serializeArray();
			var parsedSelectors = settingsModule.parseFormData(formValues);
			var siteId = w.selectedSiteId;
			var pageGroupPattern = JSON.parse($('#pageGroupPattern').val());
			console.log(parsedSelectors);
			$.ajax({
				url: '/user/site/' + siteId + '/pagegroup/saveAmpSettings',
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify({
					ampData: parsedSelectors,
					...pageGroupPattern
				}),
				dataType: 'json',
				success: function() {
					alert('AMP Settings saved!');
				}
			});
		});
	})(window, document);
});
