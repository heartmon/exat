<?php
include("../_db.php");
include("_opz.php");
ini_set('display_errors', '1');
//$dbh = connect();
$d = "skid"; // *
$tbl = "skid"; // **
$skid_cols = "(section,distance,subdistance,skid_avg,lat,long)";
//$csv_img = "C:/Program Files (x86)/PostgreSQL/EnterpriseDB-ApachePHP/apache/www/run_db/";
$csv_img = "C:/WAPP/apache2/htdocs/ddd/run_db/";

	$fp = "csv_iri/";
	$fs = d2a($fp,true);
	foreach($fs as $k => $v) {
		$q = "COPY " . $tbl . " " 
		. $skid_cols . // ***
		" FROM '" . $csv_img . $v . "' WITH DELIMITER ',' CSV HEADER";
		echo "+++ " . $q . "<br/>";
		retrieve($q);
		echo "<br/>";		
	}
	
	$q = "update {$tbl} set mark = 'start' where subdistance = 0";
	retrieve($q);
	$q = "update {$tbl} set type = '1' where type is null";
	retrieve($q);
	$q = "update {$tbl} set the_geom = ST_GeometryFromText('SRID=4326;POINT(' || long || ' ' || lat || ')') where the_geom is null";
	retrieve($q);



?>
