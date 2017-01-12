function buildUrl(url, parameters) {
    var qs = "";
    for (var key in parameters) {
        var value = parameters[key];
        qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
    }
    if (qs.length > 0) {
        qs = qs.substring(0, qs.length - 1); //chop off last "&"
        url = url + "?" + qs;
    }
    return url;
}


function uniqueId(appendNum) {
	var d = +new Date(),
		r, appendMe = ((!appendNum || (typeof appendNum === 'number' && appendNum < 0)) ? Number(1).toString(16) : Number(appendNum).toString(16));
	appendMe = ('0000000'.substr(0, 8 - appendMe.length) + appendMe).toUpperCase();
	return appendMe + '-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		r = ((d = Math.floor(d / 16)) + Math.random() * 16) % 16 | 0;
		return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}

module.exports = {
	buildUrl: buildUrl,
	uniqueId: uniqueId
};