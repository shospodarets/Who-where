<?php
	$pvars   = array('image' => base64_encode(file_get_contents($_FILES["file"]["tmp_name"])), 'key' => '6528448c258cff474ca9701c5bab6927');
	$timeout = 30;
	$curl    = curl_init();
	
	curl_setopt($curl, CURLOPT_URL, 'http://imgur.com/api/upload.xml');
	curl_setopt($curl, CURLOPT_TIMEOUT, $timeout);
	curl_setopt($curl, CURLOPT_POST, 1);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($curl, CURLOPT_POSTFIELDS, $pvars);
	
	$Result = curl_exec($curl);
	$Result = preg_replace("/[\n]/",'',$Result);//str_replace('\t','',$Result);
	
	$xml = '<script language="javascript" type="text/javascript">window.top.window.whoWhere.editItems.uploadCallback(\'' . $Result . '\');</script>';
	echo $xml;
	
	curl_close ($curl);
?>