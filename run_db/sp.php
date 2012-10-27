<?php
include_once('../_db.php');

$infotype = $_GET['infotype'];

$sql = "SELECT DISTINCT section FROM {$infotype} ORDER BY section";
$result = pg_query($sql);
while($row = pg_fetch_assoc($result)) {
	$section = $row['section'];
	$code = sectionParser($section);

	$updatesql = "UPDATE {$infotype} set code='{$code}' WHERE section = '{$section}' AND code is null";
	$resultupdate = pg_query($updatesql);
}
echo 'updated';


function sectionParser($section)
{
	$first4_ew = substr($section,0,4);
	$inout = substr($section,-3,1);
	$lane_no = substr($section,-2);

	$code = expressAbb($first4_ew)."_";
	if($inout == "F")
		$code .= "O_";
	else
		$code .= "I_";
	$code .= laneCode($lane_no);
	return $code;
}

function expressAbb($c)
{
	switch($c){
		case "0101": return "FESDE"; break;
		case "0102": return "FESBN"; break;
		case "0103": return "FESDN"; break;
		case "0201": return "RAE"; break;
		case "0202": return "RAE"; break;
		case "0301": return "S1"; break;
		case "0401": return "SOBRR"; break;
		case "0501": return "BBE"; break;
	}
}

function laneCode($l)
{
	switch($l){
		case "01": return 'RL'; break;
		case "02": return 'ML'; break;
		case "03": return 'LL'; break;
	}
}
?>
