<?php
include_once('../_db.php');

//Get value
$expressway = $_GET['expressway'];
$kmstart = $_GET['kmstart'];
$kmend = $_GET['kmend'];
$infotype = $_GET['infotype'];
$exptype = $_GET['exptype'];
//$kmfreq = $_GET['kmfreq'];
//$currentlane = $_GET['currentlane'];

//Check if kmend is empty

if(!$kmend)
{
	$sql = "SELECT MAX(subdistance) FROM {$infotype}";
	$result = pg_query($sql);
	$row = pg_fetch_assoc($result);
	$kmend = $row['max'];
}

//Select Distinct Lane For display choices to user to select lane in the range
$sql = "SELECT DISTINCT section, code FROM {$infotype} WHERE section LIKE '{$expressway}%' AND type = '{$exptype}'";
if($kmstart)
	$sql .= " AND subdistance >= {$kmstart}";
if($kmend)
	$sql .= " AND subdistance <= {$kmend}";
$sql .= "ORDER BY section ASC";

$result = pg_query($sql);
$lanes = array();
$crlanes = array('F01'=>0,'F02'=>0,'F03'=>0,'R01'=>0,'R02'=>0,'R03'=>0);
$num_rows = pg_num_rows($result);
if($num_rows)
{
	while($row = pg_fetch_assoc($result)) {
		$lane = substr($row['section'],-3);

		if($expressway == '02')
		{
			$crlanes[$lane] += 1;
			if($crlanes[$lane] == 1)
				$lane .= ' ช่วงที่ 1';
			else
				$lane .= ' ช่วงที่ 2';	
		}

		$lanes[] = array('lane' => $lane, 'code' => $row['code'], 'section' => $row['section']);
	}
}
else
	$lanes['error'] = "Not Found";

//$lanes[''] = '';
echo $_GET['callback'].'('.json_encode($lanes).')';


?>

