<?php
include_once('../_db.php');

//Get value
$expressway = $_GET['expressway'];
$type =  $_GET['type'];
$year =  $_GET['year'];
$exptype = $_GET['exptype'];


if($expressway == "0102")
	$expressway = "0101";

if($type == "unlimited")
	$typetable = "hdm4_unlimited";
elseif($type == "limited_half")
	$typetable = "hdm4_limited_half";
else
	$typetable = "hdm4_limited_full";

$sql = "SELECT * FROM {$typetable} WHERE abb_exp LIKE '{$expressway}' AND type = {$exptype}";
if($year != 'all')
	$sql .= " AND year = {$year}";
$sql .= " ORDER BY id";


$result = pg_query($sql);
$rows = array();
$totalcost = 0;
if(pg_num_rows($result) > 0)
{
	while($row = pg_fetch_assoc($result)) {
		//echo utf8_decode($row[])
		$rows[] = $row;
		$totalcost += $row['cost'];
	}
	$rows['totalcost'] = $totalcost;
}
else
{
	if($year != 'all')
		$rows['error'] = "ไม่มี HDM4 Plan สำหรับปี ".($year+543)." ในสายทางนี้";
	else
		$rows['error'] = "ไม่มี HDM4 Plan แบบที่เลือกในสายทางนี้";
}

echo $_GET['callback'].'('.json_encode($rows).')';

?>