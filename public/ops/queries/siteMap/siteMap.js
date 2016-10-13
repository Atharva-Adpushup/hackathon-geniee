var url = '/ops/data/siteMap';

window.onload = function() {

};

function getSiteMapping(button) {
	var siteIdInputVal = $('#siteIdInput').val();

	if (empty(siteIdInputVal)) {
		alert('Please Enter site id'); return;
	}

	var siteKey = '' + siteIdInputVal;

	makeRequest(siteKey);
}

function makeRequest(siteKey) {
	var requestData = {
		options: {
			key: siteKey
		}
	}

	makeAjaxRequest(requestData, url, function(receivedData) { fillTable(receivedData) });
}

function getFullSiteMapping(button) {
	var data = {};

	makeAjaxRequest(data, url, function(receivedData) { fillTable(receivedData) });
}


function fillTable(receivedData) {
	if (receivedData.error == null) {
		$('#resultTable').html('<tr><th>siteId</th><th>siteDomain</th><th>ownerEmail</th><th>dateCreated</tr>');

		for (var i = 0; i < receivedData.length; i++) {

			var row = receivedData[i];
			try {

				var tr = getTr(row);

				$('#resultTable').append(tr);
			} catch (e) {
				console.log(e);
			}

		}
	}
	else {
		console.log('error : ' + receivedData.error);
		alert('error : ' + receivedData.error);
	}

}

function getTr(row) {
	var tr = document.createElement('tr');
	var tdKey = document.createElement('td');
	var tdVal = document.createElement('td');
	var tdEmail = document.createElement('td');
	var tdDateCreated = document.createElement('td');

	tdKey.innerHTML = row['key'];
	tdVal.innerHTML = row['value'].siteDomain.substring(0, 40);
	tdEmail.innerHTML = row['value'].ownerEmail;

	var dateCreated = row['value'].dateCreated;

	if (dateCreated == null) {
		tdDateCreated.innerHTML = '-';
	}
	else {
		var date = new Date(dateCreated);
		tdDateCreated.innerHTML = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
	}

	tr.appendChild(tdKey);
	tr.appendChild(tdVal);
	tr.appendChild(tdEmail);
	tr.appendChild(tdDateCreated);
	return tr;
}

function empty(str) {
	if (str == null || str == '') {
		return true;
	}
	return false;
}