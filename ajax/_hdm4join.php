<?php
include_once('../_db.php');
	
$exp = $_GET['exp'];
$dir = $_GET['dir'];
$lane = $_GET['lane'];
$kmstart = $_GET['kmstart'];
$year = $_GET['year'];
$type = $_GET['type'];

if($type == "unlimited")
	$typetable = "hdm4_unlimited";
elseif($type == "limited_half")
	$typetable = "hdm4_limited_half";
else
	$typetable = "hdm4_limited_full";

$sql = "SELECT year,workdes,cost from {$typetable} 
		WHERE 	abb_exp LIKE '{$exp}' AND 
				dir = '{$dir}' AND 
				lane = '{$lane}' AND
				year = {$year} AND 
				{$kmstart} >= kmstart AND {$kmstart} < kmend
		ORDER BY id
				";

$result = pg_query($sql);
$rows = array();
$num_rows = pg_num_rows($result);
if($num_rows > 0)
{
	$row = pg_fetch_assoc($result);
	$rows = $row;
}
else
{
	$rows['error'] = 'ไม่มีแผนการซ่อมบำรุง';
}

echo $_GET['callback'].'('.json_encode($rows).')';

?>