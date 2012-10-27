<?php
include_once('../_db.php');
$section = $_GET['section'];
$latstart = $_GET['latstart'];
$longstart = $_GET['longstart'];
$latend = $_GET['latend'];
$longend = $_GET['longend'];
$exptype = $_GET['exptype'];

if($exptype != 2 and $exptype != 3) {
	if(strrpos($section, 'R') === false)
	{
		$sql = "select * from images where section LIKE '{$section}'
		order by (lat-{$latstart})^2 + (long-{$longstart})^2 limit 1";
		$result = pg_query($sql);
		$row = pg_fetch_assoc($result);
		$first = $row['frameno'];
	}
	else
	{
		//Find first match from last subdistance
		$sql = "select * from images where section LIKE '{$section}'
		order by (lat-{$latend})^2 + (long-{$longend})^2 limit 1";
		$result = pg_query($sql);
		$row = pg_fetch_assoc($result);
		$first = $row['frameno'];
	}
} else {
		$sql = "select * from images where section = '{$section}' order by frameno limit 1";
		//echo $sql;
		$result = pg_query($sql);
		$row = pg_fetch_assoc($result);
		$first = $row['frameno'];
}

$first += 0;
//echo $first;
if($first != null && $first != 0)
{

	//$first = $row['frameno'];
	//$rows['num_rows'] = $num_rows + 0;
	$rows['first_image'] = $first + 0;
}
else
{
	$rows['error'] = "ไม่สามารถดึงข้อมูล image จากฐานข้อมูลได้\n"."ตอนควบคุม: ".$section." (getFirstImage.php)";
}


echo $_GET['callback'].'('.json_encode($rows).')';

?>