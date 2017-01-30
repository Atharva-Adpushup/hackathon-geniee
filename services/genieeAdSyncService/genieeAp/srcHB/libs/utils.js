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


function hashCode(str){
    var hash = 0;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function createEmptyIframe() {
  var f = document.createElement('iframe');

  f.id = "_adp_frame_" + ((Math.random() * 1000) | 0);
  f.height = 0;
  f.width = 0;
  f.border = '0px';
  f.hspace = '0';
  f.vspace = '0';
  f.marginWidth = '0';
  f.marginHeight = '0';
  f.style.border = '0';
  f.scrolling = 'no';
  f.frameBorder = '0';
  f.src = 'about:blank';

  return f;
}

module.exports = {
	buildUrl: buildUrl,
	uniqueId: uniqueId,
  hashCode: hashCode,
  createEmptyIframe : createEmptyIframe
};