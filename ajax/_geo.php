<?php
	include_once('../_db.php');
	if ($dbh === null) {
		//Error
	} else {
		$expressway = $_GET['expressway'];
		$searchtype = $_GET['searchtype'];
		$infotype = $_GET['infotype'];
		$exptype = $_GET['exptype'];
		$kmstart = $_GET['kmstart'];
		$kmend = $_GET['kmend'];
		$section = $_GET['section'];
		
		$q = "SELECT ST_AsText(ST_Envelope(ST_Collect(the_geom))) as geo ".
			"FROM {$infotype} WHERE ST_IsEmpty(the_geom) is false ";
		if($exptype == 3) {
			$q .= "AND section LIKE '{$section}' ";
		} else if ($exptype == 2) {
			$q .= "AND section LIKE '{$section}' ";
		} else if ($exptype == 1) {
			$q .= "AND section LIKE '{$expressway}%' ";
		} 
		if(isset($_GET['exptype'])) {
			$q .= "AND type = '{$exptype}' ";
		}
		if(isset($kmstart) and $kmstart !='') {
			$q .= "AND subdistance >= {$kmstart} ";
		}
		if(isset($kmend) and $kmend !='') {
			$q .= "AND subdistance <= {$kmend} ";
		}
		$q .= "GROUP BY section";
		//echo $q;
		$result = retrieve($q);
		//$result = pg_query($q);
		//$row = pg_fetch_assoc($result);
		echo $_GET['callback'].'('.json_encode($result).')';
		
				
	}			
?>
