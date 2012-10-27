<?php
include_once('../_db.php');

//Get value
$expressway = $_GET['expressway'];
$kmstart = $_GET['kmstart'];
$kmend = $_GET['kmend'];
$infotype = $_GET['infotype'];

//CtrlSection Query
$sql = "SELECT DISTINCT ON (section) section,distance FROM {$infotype} WHERE section LIKE '{$expressway}%' AND distance >= {$kmstart} AND distance <= {$kmend}";

$result = pg_query($sql);
if ($result !== false) {
	$rows = array();
	while($row = pg_fetch_assoc($result)) {
		$rows[] = $row;
	}
	pg_free_result($result);
	pg_close($dbh);

	echo $_GET['callback'].'('.json_encode($rows).')';
}
else {
	echo "Problem with query " . $query . "<br/>"; 
    echo pg_last_error(); 
	pg_close($dbh);
}

?>