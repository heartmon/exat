<?php
include_once('../_db.php');

//Get value
$expressway = $_GET['expressway'];
$kmstart = $_GET['kmstart'];
$kmend = $_GET['kmend'];
$infotype = $_GET['infotype'];
$kmfreq = $_GET['kmfreq'];
$currentlane = $_GET['currentlane'];


//Select Column Name for each infotype
if($infotype == 'roughness')
	$column_info_name = 'iri_avg';
elseif($infotype == 'rutting')
	$column_info_name = 'rut_lane';

//Check if kmend is empty
if(!$kmend)
{
	$sql = "SELECT MAX(distance) FROM {$infotype}";
	$result = pg_query($sql);
	$row = pg_fetch_assoc($result);
	$kmend = $row['max'];
}

//Define offset for expanding the kmend range (Ex.search 13-14 with freq.=10, it has to include 14.012 for 13.992-14.012 range)
$kmendpadding = $kmend+($kmfreq/1000.0);

//CtrlSection Query
$sql = "SELECT * FROM {$infotype} WHERE section LIKE '{$expressway}%{$currentlane}'";
if($kmstart)
	$sql .= " AND distance >= {$kmstart}";
if($kmend)
	$sql .= " AND distance <= {$kmendpadding}";
$sql .= "ORDER BY section, distance";

$result = pg_query($sql);


$rows = array();
if ($result !== false) {
	$num_rows = pg_num_rows($result);
	if($num_rows)
	{
	if($num_rows > 800 && $kmfreq != 500)
		$kmfreq = 1000;

		$line_data = array();
		$count = 0;
		$index_freq = $kmfreq / 5;
		$sum = 0;
		$dataInSum = 0;
		while($row = pg_fetch_assoc($result)) {
			if($kmfreq != 5)
			{
				if($count%$index_freq == 0)
				{
					$rows[] = $row;
				}
				$sum += $row[$column_info_name];
				$dataInSum++;
				$count++;
				if($count%$index_freq == 0 && $rows[sizeof($rows)-1]['distance'] <= $kmend || $count == $num_rows)
				{
					//$new_avg = $sum*1.0 / $dataInSum;
					$new_avg = sprintf ("%.4f", $sum*1.0 / $dataInSum);
					$x_data = $rows[$count/$dataInSum-1];
					if($count == $num_rows)
					{
						$x_data = $rows[sizeof($rows)-1];
						$rows['max_distance'] = $row['distance'];
					}	
					$line_data[] = array($x_data['distance'],$new_avg);
					$sum = 0;
					$dataInSum = 0;
				}
			}
			else
			{
				$rows[] = $row;
				if($rows[sizeof($rows)-1]['distance'] <= $kmend)
					$line_data[] = array($row['distance'],$row[$column_info_name]);
			}
		}
		if($rows[sizeof($rows)-1]['distance'] > $kmend)
			array_pop($rows);

		$rows['line_data'] = $line_data;
		//print_r($rows);
		pg_free_result($result);
		pg_close($dbh);


	}
	else
		$rows['error'] = "Not Found";

}
else {
	echo "Problem with query " . $query . "<br/>"; 
    echo pg_last_error(); 
	pg_close($dbh);
}

echo $_GET['callback'].'('.json_encode($rows).')';

?>