module.exports = function(){
	var gptScriptEl = document.createElement('script');
	gptScriptEl.src = "//www.googletagservices.com/tag/js/gpt.js";
	gptScriptEl.async = true;

	document.head.appendChild(gptScriptEl);
};