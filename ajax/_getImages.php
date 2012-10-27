<?php
include_once('../_db.php');

$section = $_GET['section'];
$length = $_GET['length'];
$reverse = $_GET['reverse'];
$first = $_GET['first'];

$last = $first + $length - 1;
if($first != null && $last !=null)
{
	//Select Images data of that range
	$sql = "select DISTINCT ON(frameno) * from images where frameno >= {$first} and frameno <= {$last} and section LIKE '{$section}' order by frameno";
	if($reverse == 'true')
		$sql .= " DESC";

	$result = pg_query($sql);
	$rows  = array();

	$num_rows = pg_num_rows($result);

	if($num_rows)
	{
	//$count = 0;
	//$index_freq = $kmfreq/5;
		while($row = pg_fetch_assoc($result)) {
			//if($count%$index_freq == 0)
				$rows[] = $row;
			//$count++;
		}
	}
	else
	{
		$rows['error'] = "ไม่เจอ\n"."ตอนควบคุม: ".$section.' '.$first.' '.$last;
	}
}
else
{
	$rows['error'] = "ไม่สามารถดึงข้อมูล image จากฐานข้อมูลได้\n"."ตอนควบคุม: ".$section;
}
	//echo pg_num_rows($result);

echo $_GET['callback'].'('.json_encode($rows).')';

?>