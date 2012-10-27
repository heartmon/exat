<?php
include_once('../_db.php');

//Get value
$expressway = $_GET['expressway'];
$kmstart = $_GET['kmstart'];
$kmend = $_GET['kmend'];
$infotype = $_GET['infotype'];
$kmfreq = $_GET['kmfreq'];
//$currentlane = $_GET['currentlane'];
$section = $_GET['section'];
$exptype = $_GET['exptype'];


//Select Column Name for each infotype
if($infotype == 'roughness')
	$column_info_name = 'iri_avg';
elseif($infotype == 'rutting')
	$column_info_name = 'rut_lane';
elseif($infotype == 'skid')
	$column_info_name = 'skid_avg';


//if(!$kmend || !$kmstart)
{
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

	//SQL for getting data
	//	$sql = "SELECT * FROM {$infotype} WHERE section LIKE '{$section}'";


}
//Section Search (kmstart kmend are always defined)
//else
{
	//$sql = "SELECT * FROM {$infotype} WHERE section LIKE '{$section}'";
	$rangefix = 5;
}
/*
//Validation
$sql_rn = "SELECT section FROM 'roughness' WHERE section = '{$section}'";
$sql_s =  "SELECT section FROM 'skid'      WHERE section = '{$section}'";
$sql_rt = "SELECT section FROM 'rutting'   WHERE section = '{$section}'";

$result_rn = pg_num_rows(pg_query($sql_rn));
$result_rt = pg_num_rows(pg_query($sql_rt));
$result_s  = pg_num_rows(pg_query($sql_s));

$have_rn = ($result_rn > 0 ? true : false);
$have_rt = ($result_rt > 0 ? true : false);
$have_s  =  ($result_s > 0 ? true : false);*/


	/*$sql = "SELECT rn.section, rn.distance, rn.subdistance, rn.iri_avg , rn.lat, rn.long , rn.code,  rt.rut_lane, s.skid_avg 
			FROM roughness rn, rutting rt, skid s 
			WHERE rn.subdistance = rt.subdistance and rt.subdistance = s.subdistance and 
			  rn.section = rt.section         and rt.section     = s.section     and
			  rn.section LIKE '{$section}'";*/

	$sql = "SELECT rn.section, rn.distance, rn.subdistance, rn.iri_avg , rn.lat, rn.long , rn.code,  rt.rut_lane, s.skid_avg 
			FROM (roughness rn LEFT JOIN rutting rt on rn.subdistance = rt.subdistance and rn.section = rt.section)
					LEFT JOIN skid s on  rt.subdistance = s.subdistance and rt.section     = s.section 
			WHERE   rn.section LIKE '{$section}'";
			
	//Determine frequency
	$subdistance = $kmend - $kmstart;
	if($subdistance <= 2)
		$rangefix = 5;
	else if($subdistance > 2 && $subdistance <= 4)
	{
		$rangefix = 50;
	//	if($kmfreq < 50)
	//		$kmfreq = 50;
	}
	else
	{
		$rangefix = 500;
	//	if($kmfreq < 500)
	//		$kmfreq = 500;	
	}
	if(!$kmfreq)
		$kmfreq = $rangefix;

//Define offset for expanding the kmend range (Ex.search 13-14 with freq.=10, it has to include 14.012 for 13.992-14.012 range)
$kmendpadding = $kmend;
//if($kmfreq != 5)
$kmendpadding = $kmend+1;

//echo $kmendpadding+' ';
//echo $kmfreq;


$sql .= " AND rn.subdistance >= {$kmstart} AND rn.subdistance <= {$kmendpadding} ORDER BY subdistance,section";

$result = pg_query($sql);
$rows = array();
$max_distance = 0;
if ($result !== false) {
	$num_rows = pg_num_rows($result);
	//echo $num_rows;
	if($num_rows)
	{
		while($row = pg_fetch_assoc($result)) {
			$rows[] = $row;
			if($max_distance < $row['subdistance'])
				$max_distance = $row['subdistance'];
		}

		$rows['num_rows'] = $num_rows;
		$rows['rangefix'] = $rangefix;
		$rows['lastkm'] = $max;
	}
	else
		$rows['error'] = "Not Found";
}

/*else {
	echo "Problem with query " . $query . "<br/>"; 
    echo pg_last_error(); 
	pg_close($dbh);
}*/

echo $_GET['callback'].'('.json_encode($rows).')';

?>