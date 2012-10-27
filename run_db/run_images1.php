<?php
include("../_db.php");
include("_opz.php");
ini_set('display_errors', '1');
//$dbh = connect();
$d = "images"; // *
$tbl = "images_copy"; // **
$imgcp_cols =  '("section","frameno","interlat","interlong","interalt","framenocal","subdis","measure","ref","lat","long","gps_po","filename")';
$img_cols = '("section","frameno","lat","long","filename","gid","the_geom","dummycol","code")';
//$csv_img = "C:/Program Files (x86)/PostgreSQL/EnterpriseDB-ApachePHP/apache/www/run_db/";
$csv_img = "C:/WAPP/apache2/htdocs/ddd/run_db/";

	$fp = "csv_images/";
		$fs = d2a($fp,true);
		foreach($fs as $k => $v) {
				$q = "COPY " . $tbl . " " 
				. $imgcp_cols . // ***
				" FROM '" . $csv_img . $v . "' WITH DELIMITER ',' CSV HEADER";
				echo "+++ " . $q . "<br/>";
				retrieve($q);
				echo "<br/>";		
		}



?>
