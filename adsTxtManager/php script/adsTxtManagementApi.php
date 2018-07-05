 <?php
	$request = explode("/", substr(@$_SERVER['PATH_INFO'], 1));
	$request_method=$_SERVER["REQUEST_METHOD"];	

	switch($request_method)	{
		case 'GET':
			if(!empty($_GET["test"])){
				header('Content-Type: application/json');
				$response=array(
					'status' => 1,
					'status_message' =>'connected to api'
				);
				echo json_encode($response);
			}else{
				get_adsTxt();
			}			
			break;
		case 'POST':
			if(!empty($_POST["data"]) && !empty($_POST["hash"]) && !empty($_POST["ts"])){
				$authenticated = doAuthentication($_POST["hash"], $_POST["ts"]);
				if($authenticated){
					if(!empty($_POST["data"])){
						set_adsTxt($_POST["data"]);
					} else {
						header('Content-Type: application/json');
						http_response_code(400);
						$response=array(
							'status' => 0,
							'status_message' =>'Bad Request. Can not update ads.txt'
						);
						echo json_encode($response);
					}
				}else{
					http_response_code(400);
						$response=array(
							'status' => 0,
							'status_message' =>'Authentication failed. Can not update ads.txt'
						);
						echo json_encode($response);
				}
			}else{
				http_response_code(400);
				$response=array(
					'status' => 0,
					'status_message' =>'Request not proper'
				);
				echo json_encode($response);				
			}
			break;
	}

	function get_adsTxt() {	
		$file_name = 'ads.txt';
		header('Content-Type: application/json');
		if(file_exists($file_name)){
			$handle = fopen($file_name, 'r') or die('Cannot open file:  '.$file_name);
			$data = '';
			if(filesize($file_name) > 0){
				$data = fread($handle,filesize($file_name));
			}
			fclose($handle);

			$response=array(
				'status' => 1,
				'data' =>$data
			);
			echo json_encode($response);
		}else{
			http_response_code(404);
			$response=array(
				'status' => 0,
				'status_message' =>'No Ads.txt File'
			);
			echo json_encode($response);
		}
	}
	
	function set_adsTxt($data){
		//$data= json_decode($data);
		$data = str_replace(Array('<', '>', '?'),Array('', '', ''), $data);
		$file_name = 'ads.txt';
		$handle = fopen($file_name, 'w') or die('Cannot open file:  '.$file_name);        
		fwrite($handle, $data);
		fclose($handle);
			
		header('Content-Type: application/json');
		$response=array(
			'status' => 1,
			'status_message' =>'Ads.txt Updated'
		);
		echo json_encode($response);
	}

	function encodeURIComponent($str) {
		$revert = array('%21'=>'!', '%2A'=>'*', '%27'=>"'", '%28'=>'(', '%29'=>')');
		return strtr(rawurlencode($str), $revert);
	}

	function doAuthentication($reqHash, $reqTime){
		$user_id = 'anil.panghal@adpushup.com';
		$key = 'ywetqiwe8780990wq98wq90e80qwe';
		$time = time();
		
		if($time-$reqTime > 5){
			return false;
		}else{			
			$hash_params = 'email=' . encodeURIComponent($user_id) . '&ts=' . $reqTime;
			$hash = hash_hmac("sha256", $hash_params, $key, false);		
			return $hash === $reqHash;
		}		
	}	
?> 