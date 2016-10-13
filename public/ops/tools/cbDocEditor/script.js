var URL = '/ops/data/cbDocEditor';

$(document).ready(function(){
	var container = document.getElementById("id_json");

	var options = {
	    mode: 'tree',
	    modes: ['code', 'form', 'text', 'tree', 'view'], // allowed modes
	    error: function (err) {
	      alert(err.toString());
	    }
 	 };

 	
	window.editor =  new JSONEditor(container, options);

	$('#id_pullDoc').attr('disabled',false);
	$('#id_pushDoc').attr('disabled',false);
});

function pullDoc(button)
{
	var bucketName = $('#id_bucketName').val();
	var docId = $('#id_docId').val();

	if(empty(bucketName)) {setMsg('enter bucket name', true); return;}
	if(empty(docId)) {setMsg('enter doc id', true); return;}

	var data = {bucketName:bucketName, docId:docId, push:false};

	$('#id_pullDoc').disabled = true;
	setMsg('pulling doc... please wait..');

	var done = function(receivedData){
		try{
			if(receivedData.msg)
			{
				if(receivedData.response_type == 'good')
				{					
					editor.set(receivedData.msg);
					setMsg('doc loaded');
				}
				else
				{
					setMsg(receivedData.msg,true);
				}
			}
			else
			{
				throw JSON.stringify(receivedData);
			}
		}
		catch(e){setMsg("Error in pulled document : " + e,true);}
	}

	var fail = function(receivedData)
	{
		setMsg(JSON.stringify(receivedData),true);		
	}

	var always = function(){
		$('#id_pullDoc').disabled = false;
	}

	makeAjaxRequestWithPromises(data, URL, done, fail, always);
}

function pushDoc(button)
{
	if(confirm('Confirm Push?'))
	{
		setMsg('processing push...',false);

		var bucketName = $('#id_bucketName').val();
		var docId = $('#id_docId').val();

		if(empty(bucketName)) {setMsg('enter bucket name', true); return;}
		if(empty(docId)) {setMsg('enter doc id', true); return;}

		button.disabled = true;

		try {

			var jsonText = editor.get();
			
			// if valid json..

			var data = {bucketName:bucketName, docId:docId, push:true, doc:jsonText};	

			var done = function(receivedData)
			{
				try{
					if(receivedData.msg)
					{
						if(receivedData.response_type == 'good')
						{	
							setMsg('push successful',false);
						}
						else
						{
							setMsg(receivedData.msg,true);
						}
					}
					else
					{
						throw JSON.stringify(receivedData);
					}
				}
				catch(e){setMsg("Error: " + e,true);}
			}

			var fail = function(receivedData)
			{
				setMsg(receivedData.toString(),true);		
			}

			var always = function(){
				button.disabled = false;
			}

			makeAjaxRequestWithPromises(data, URL, done, fail, always);
		}
		catch (e) {
	       setMsg("Error while pushing : " + e, true); 
	       button.disabled = false;
	    }
	}
}


function empty(str)
{
	if(str == null || str=='')
	{
		return true;
	}
	return false;
}

function setMsg(str,bad)
{	
	$('#msg').text(str);

	if(bad===true)
		$('#msg').attr('class', 'red');
	else
		$('#msg').attr('class', 'green');

}