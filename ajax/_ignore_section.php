<?php
include_once('../_db.php');

//Get value
$expressway = $_GET['expressway'];
$kmstart = $_GET['kmstart'];
$kmend = $_GET['kmend'];
$infotype = $_GET['infotype'];
$kmfreq = $_GET['kmfreq'];
$section = $_GET['section'];
$exptype = $_GET['exptype'];

//Get HDM4 value
$year = $_GET['year'];
$type = $_GET['hdm4type'];
if($type == "unlimited")
	$typetable = "hdm4_unlimited";
elseif($type == "limited_half")
	$typetable = "hdm4_limited_half";
else
	$typetable = "hdm4_limited_full";

//Extract value for hdm4 (dir lane )

if($exptype == "1")
{
	$hdm4abbexp = $expressway;
	if($expressway == "0102")
		$hdm4abbexp = "0101";
	$dir = substr($section,-3,1);
	$laneno = substr($section,-2);
	//Extract dir and lane
	if($dir == 'R')
		$dir = 'ขาเข้า';
	else
		$dir = 'ขาออก';
	$lane = "ช่องจราจร";
	switch($laneno){
		case '01': $lane .= 'ขวา'; break;
		case '02': $lane .= 'กลาง'; break;		
		case '03': $lane .= 'ซ้าย'; break;
	}
}
else
{
	$hdm4abbexp = substr($section,0,-3);
	$dir = '-';
	$lane = '-';
}

$GLOBALS["lasthdm4kmend"] = 0;
/*echo $typetable;
echo $hdm4abbexp;
echo $dir;
echo $lane;*/

//Select Column Name for each infotype
if($infotype == 'roughness')
	$column_info_name = 'iri_avg';
elseif($infotype == 'rutting')
	$column_info_name = 'rut_lane';
elseif($infotype == 'skid')
	$column_info_name = 'skid_avg';


if(!$kmend)// || (!$kmstart))
{
	$findkm = true;
	$cond = " WHERE section LIKE '{$section}'";
	if($kmstart)
		$cond .= " AND subdistance >= {$kmstart}";
	if($kmend)
	{	
		$kmendpadding = $kmend+1;
		$cond .= " AND subdistance <= {$kmendpadding}";
	}
	//MAX-MIN calculation
	$sql = "SELECT MIN(subdistance), MAX(subdistance) FROM {$infotype}".$cond;
	$result = pg_query($sql);
	$row = pg_fetch_assoc($result);
	$max = $row['max'];
	$min = $row['min'];

	if($kmstart < $min || !$kmstart)
		$kmstart = $min;
	if($kmend > $max || !$kmend)
		$kmend = $max;

}

$rangefix = 5;

if($max != null || $min != null || !$findkm)
{
	if(strrpos($section, '0101100') !== false)
	{
		/*$suffix = substr($section,-3);
		$s = '0101100'.$suffix;
		$sql2 = "select max(subdistance) from roughness
		where section = '{$s}'";
		$result2 = pg_query($sql2);
		$r = pg_fetch_assoc($result2);*/
		$maxFromFirstSection = 1;//$r['max'] ;
		//echo $maxFromFirstSection ;
		$GLOBALS['kmstart'] += $maxFromFirstSection;
		$GLOBALS['kmend'] += $maxFromFirstSection;

	}	
	if(strrpos($section, '0102100') !== false )
	{
		/*$suffix = substr($section,-3);
		$s = '0101100'.$suffix;
		$sql2 = "select max(subdistance) from roughness
		where section = '{$s}'";
		$result2 = pg_query($sql2);
		$r = pg_fetch_assoc($result2);*/
		$maxFromFirstSection = 10.0;//$r['max'] ;
		//echo $maxFromFirstSection ;
		$GLOBALS['kmstart'] += $maxFromFirstSection;
		$GLOBALS['kmend'] += $maxFromFirstSection;

	}	
	if(strrpos($section, '0103100') !== false || strrpos($section, '0103%') !== false)
	{
	//	$suffix = substr($section,-3);
	//	$s = '0101100'.$suffix;
		// $sql2 = "select min(subdistance) from roughness
		// where section = '{$section}'";
		// $result2 = pg_query($sql2);
		// $r = pg_fetch_assoc($result2);
		$maxFromFirstSection = 19.5 ;
		//echo $maxFromFirstSection ;
		$GLOBALS['kmstart'] += $maxFromFirstSection;
		$GLOBALS['kmend'] += $maxFromFirstSection;
	}

		$sql = "SELECT rn.section, rn.distance, rn.subdistance, rn.iri_avg , rn.lat, rn.long , rn.code,  rt.rut_lane, s.skid_avg 
				FROM (roughness rn LEFT JOIN rutting rt on rn.subdistance = rt.subdistance and rn.section = rt.section)
						LEFT JOIN skid s on  rt.subdistance = s.subdistance and rt.section     = s.section 
				WHERE   ";
		
		if(strrpos($section, '01b') !== false)
		{
			$suffix = substr($section,-3);
			$sect_cond = " (rn.section LIKE '0101%".$suffix."' OR rn.section LIKE '0102%".$suffix."')";
		}
		else
			$sect_cond = " rn.section LIKE '{$section}'";

		$sql .= $sect_cond;

		$sql .= " AND rn.type = '{$exptype}'";
		//Determine frequency
		$subdistance = $kmend - $kmstart;
		if($subdistance <= 2)
			$rangefix = 5;
		else if($subdistance > 2 && $subdistance <= 4)
		{
			$rangefix = 50;
		}
		else
		{
			$rangefix = 500;
		}
		if(!$kmfreq)
			$kmfreq = $rangefix;

	//Define offset for expanding the kmend range (Ex.search 13-14 with freq.=10, it has to include 14.012 for 13.992-14.012 range)
//	$kmendpadding = $kmend;
	//if($kmfreq != 5)
	$kmendpadding = $kmend+1;

	$sql .= " AND rn.subdistance >= {$kmstart} AND rn.subdistance <= {$kmendpadding} ORDER BY subdistance ,section";
	//echo $sql;
	$result = pg_query($sql);
	$rows = array();
	$max_distance = 0;
	if ($result !== false) {
		$num_rows = pg_num_rows($result);
		//echo $num_rows;
		if($num_rows)
		{
			$c = 0;
			while($row = pg_fetch_assoc($result)) {
			if(!(strrpos($section, '0101%') !== false && ($row['subdistance'] > 7.6 )))
				{
					$section = $row['section'];
					if($row['subdistance'] <= $GLOBALS['kmend'])
						$rows['indexsearch'] = $c;
					//Add HDM4 Result
					//echo $GLOBALS["lasthdm4kmend"];
					if($GLOBALS["lasthdm4kmend"] <= $row['subdistance'])
						$hdm4result = hdm4join($typetable, $hdm4abbexp, $dir, $lane,$row['subdistance']);
					////if($GLOBALS["lasthdm4kmend"] <= $row['subdistance']-19.5 && (strrpos($section, '0103100') !== false))
						//$hdm4result = hdm4join($typetable, $hdm4abbexp, $dir, $lane,$row['subdistance']);
					$row['hdm4result'] = $hdm4result;				
					//new
					if(strrpos($section, '0101100') !== false || strrpos($section, '0102100') !== false || strrpos($section, '0103100') !== false)
						$row['subdistance'] = round($row['subdistance'],3)  - round($maxFromFirstSection,3);

					$rows[] = $row;
					if($max_distance < $row['subdistance'])
						$max_distance = $row['subdistance'];
					
					$c++;
				}
			else
				{
					break;
				}
			}

			$rows['num_rows'] = $num_rows;
			$rows['rangefix'] = $rangefix;
			$rows['lastkm'] = $max_distance;
			$rows['specialcase'] = $maxFromFirstSection;
		}
		else
		{
			$type = exptypeToFull($exptype);
			$rows['error'] = "ระบบไม่ค้นพบข้อมูล: \nประเภทสายทาง: ".$type." \nตอนควบคุม: ".$section." \nความเสียหาย: ".$infotype."\nช่วงกม.: ".$kmstart." - ".$kmend;
		}
	}

	/*else {
		echo "Problem with query " . $query . "<br/>"; 
	    echo pg_last_error(); 
		pg_close($dbh);
	}*/
}
else
{
	$type = exptypeToFull($exptype);
	$rows['error'] = "ระบบไม่ค้นพบข้อมูล \nประเภทสายทาง: ".$type." \nตอนควบคุม: ".$section." \nความเสียหาย: ".$infotype;
}

echo $_GET['callback'].'('.json_encode($rows).')';

function exptypeToFull($exptype)
{
	switch($exptype)
	{
		case 1: $type = "ทางหลัก" ; break; 
		case 2: $type = "ทางขึ้นลง" ; break;
		case 3: $type = "ทางเชื่อม" ; break;
	}
	return $type;
}

function hdm4join($typetable, $hdm4abbexp, $dir, $lane, $kms){
	//year = {$year} AND
	if($hdm4abbexp == "0103")
	{
		$kms = $kms-19.5;
	}
	$hdm4sql = "SELECT year,workdes,cost,kmend from {$typetable} 
			WHERE 	abb_exp LIKE '{$hdm4abbexp}' AND 
					dir = '{$dir}' AND 
					lane = '{$lane}' AND
					{$kms} >= kmstart AND {$kms} < kmend
			ORDER BY id";
	//echo $hdm4sql;
	$sqlresult = pg_query($hdm4sql);
	$hdm4result = array();
	if(pg_num_rows($sqlresult))
	{
		while($row = pg_fetch_assoc($sqlresult)) {
			$hdm4result[] = $row;
			$GLOBALS["lasthdm4kmend"] = $row['kmend'];
		}
	}
	else
	{
		$hdm4result[] = 'ไม่มีแผนการซ่อมบำรุง';
	}
	return $hdm4result;
}
?>
