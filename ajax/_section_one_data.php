<?php
include_once('../_db.php');

//Get value
$section_name = $_GET['section_name'];
$infotype = $_GET['infotype'];

//CtrlSection Query
$sql = "SELECT * FROM {$infotype} WHERE section = '{$section_name}'";

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