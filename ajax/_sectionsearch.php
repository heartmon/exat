<?php
include_once('../_db.php');

//Get value
$expressway = $_GET['expressway'];
$searchtype = $_GET['searchtype'];
$infotype = $_GET['infotype'];
$exptype = $_GET['exptype'];



//Select Distinct Section For display choices to user to select lane in the range
$sql = "SELECT DISTINCT section,code FROM {$infotype} WHERE section LIKE '{$expressway}%' AND type = '{$exptype}'";

//For notoverlap search
if($searchtype == "notoverlap" || !$searchtype)
{
	$kmstart = $_GET['kmstart'];
	$kmend = $_GET['kmend'];
	if(!$kmend)
	{
		$sqlmax = "SELECT MAX(subdistance) FROM {$infotype} WHERE section LIKE '{$expressway}%' AND type = '{$exptype}'";
		$result = pg_query($sqlmax);
		$max = pg_fetch_assoc($result);
		$kmend = $max['max'];
	}

	if($kmstart)
		$sql .= " AND subdistance >= {$kmstart}";
	if($kmend)
		$sql .= " AND subdistance <= {$kmend}";
}

$sql .= " ORDER BY section";

$result = pg_query($sql);
$num_rows = pg_num_rows($result);
if($num_rows)
{
	$sections = array();
	while($row = pg_fetch_assoc($result)) {
			$sections[] = $row;
		}
	$data = array();
	for($i=0; $i<sizeof($sections); $i++) {
		$temp = $sections[$i]['section'];

		//02 Case
		if($expressway == "02")
		{
			$lane = substr($temp, -3);
			$tempcr = "02%".$lane;
			$sql = "SELECT MIN(subdistance),MAX(subdistance) FROM {$infotype} where section LIKE '{$tempcr}'";
			if($i>2)
			{
				$temp = "0202100".$lane;
			}
		}
		else
		{
			$sql = "SELECT MIN(subdistance),MAX(subdistance) FROM {$infotype} where section LIKE '{$temp}'";
		}
		
		$result = pg_query($sql);
		$row = pg_fetch_assoc($result);

		if(strrpos($expressway, '0102') !== false)
		{
			$suffix = substr($temp,-3);
			$s = '0101100'.$suffix;
			$sql2 = "select max(subdistance) from roughness
			where section = '{$s}'";
			$result2 = pg_query($sql2);
			$r = pg_fetch_assoc($result2);
			$maxFromFirstSection = $r['max'];// + 0.005;
			//echo $s;
			$data[] = array('section'=>$temp, 'code'=>$sections[$i]['code'] ,'min'=>$row['min'], 'max'=>$row['max'], 'specialcase'=>$maxFromFirstSection);
		}	
		else
		{
			if(!($expressway == "02" && $i>5))
			$data[] = array('section'=>$temp, 'code'=>$sections[$i]['code'] ,'min'=>$row['min'], 'max'=>$row['max']);
		}
		
	}
	//$data['specialcase'] = $maxFromFirstSection;
}
else 
	$data['error'] = "Not Found";

echo $_GET['callback'].'('.json_encode($data).')';
?>