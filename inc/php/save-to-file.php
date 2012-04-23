<?php
	$fileName=$_POST['fileName'];
	$json=$_POST['json'];
	$withBackupCopy=$_POST['withBackupCopy'];
	
	$f = fopen('../locations/'.$fileName, 'w');
	fputs($f, $json);
	fclose($f);
	
	if ($withBackupCopy){
		$today = getdate();
		$prefix = '(' . $today[mday] . '.' . $today[mon] . '.' . $today[year] . ' time-' . $today[hours] . '-' . $today[minutes] . '-' . $today[seconds] . ')';
		$f = fopen('../backup/' . $prefix . $fileName, 'w');
		fputs($f, $json);
		fclose($f);
	}
	
	echo $json;
?>