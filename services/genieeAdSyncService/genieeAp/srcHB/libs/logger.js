function shouldLog(){
	if(  window.location.hash && window.location.hash === "#adpdebug" ) {
		return true;
	}
}

function info(){
	if( shouldLog() ) {
		var arrArgs = [].slice.call(arguments);
		arrArgs[0] = "adphb: " + arrArgs[0];

		console.info.apply(this, arrArgs);
	}
}

function table( object ){
	if( shouldLog() ) {
		console.table(object);
	}
}

function log(){
	if( shouldLog() ) {
		var arrArgs = [].slice.call(arguments);
		arrArgs[0] = "adphb: " +  arrArgs[0];

		console.info.apply(this, arrArgs);
	}
}

function warn(){
	if( shouldLog() ) {
		var arrArgs = [].slice.call(arguments);
		arrArgs[0] = "adphb: " +  arrArgs[0];

		console.warn.apply(this, arrArgs);
	}
}

function group(groupName){
	if( console.group && shouldLog() ) {
		console.group(groupName);
	}
}

function groupEnd(){
	if( console.groupEnd && shouldLog() ) {
		console.groupEnd();
	}
}

function warn(){
	if( shouldLog() ) {
		var arrArgs = [].slice.call(arguments);
		arrArgs[0] = "adphb: " +  arrArgs[0];

		console.warn.apply(this, arrArgs);
	}
}

function initPrebidLog(){
  if( shouldLog() ) {
  	pbjs.logging = true;
  }
}
module.exports = {
	info  : info,
	log   : log,
	table : table,
	warn  : warn,
	shouldLog : shouldLog,

	group  : group,
	groupEnd : groupEnd,

	initPrebidLog: initPrebidLog
};