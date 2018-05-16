// Pagegroup editing client-side module script

$(document).ready(function() {
	(function(w, d) {
		$('form').on('submit', function(e) {
			e.preventDefault();
			var toMatchInputs = $('input.to-match'),
				toNotMatchInputs = $('input.to-not-match'),
				toMatch = [],
				toNotMatch = [];

			$.each(toMatchInputs, function(key, input) {
				let url = input.value.trim();
				url.length ? toMatch.push(url) : null;
			});
			$.each(toNotMatchInputs, function(key, input) {
				let url = input.value.trim();
				url.length ? toNotMatch.push(url) : null;
			});
			if (!toMatch.length) {
				alert('No url found');
				return;
			}
			$.ajax({
				method: 'POST',
				url: '/user/site/' + window.siteId + '/settings/regexGenerator',
				headers: { 'Content-Type': 'application/json' },
				data: JSON.stringify({
					toMatch: toMatch,
					toNotMatch: toNotMatch
				}),
				contentType: 'json',
				dataType: 'json',
				success: function(response) {
					var output = response.error ? response.message : response.regex,
						outputBox = $('#output-box > pre'),
						toShow = '<p>' + output + '</p>';

					if (!response.error) {
						toShow += '<div class="additional-info matched-urls"><h3>Matched Urls</h3>';
						if (response.matchedUrls) {
							$.each(response.matchedUrls, function(key, url) {
								toShow += '<p>' + url + '</p>';
							});
						} else {
							toShow += 'Nothing here!';
						}
						toShow += '</div><div class="additional-info not-matched-urls"><h3>Not Matched Urls</h3>';
						if (response.notMatchedUrls) {
							$.each(response.notMatchedUrls, function(key, url) {
								toShow += '<p>' + url + '</p>';
							});
						} else {
							toShow += 'Nothing here!';
						}
						toShow += '</div>';
					}
					outputBox.html(toShow);
					$('#output-box').fadeIn();
				},
				error: function() {
					alert('Something went wrong');
				}
			});
		});
	})(window, document);
});

/*
http://www.rentdigs.com/pet-friendly/states.aspx?Ad=G_RDC_HFR_SLE
http://www.rentdigs.com/pet-friendly/pet-rentals.aspx?StateCD=CA
http://www.rentdigs.com/pet-friendly/states.aspx

http://www.rentdigs.com/newyork/states.aspx
*/
