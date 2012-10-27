<?php
include("../_db.php");
include("_opz.php");
ini_set('display_errors', '1');
//$dbh = connect();
$d = "images"; // *
$tbl = "images"; // **
$imgcp_cols =  '("section","frameno","interlat","interlong","interalt","framenocal","subdis","measure","ref","lat","long","gps_po","filename")';
$img_cols = '("section","frameno","lat","long","filename","gid","the_geom","dummycol","code")';
//$csv_img = "C:/Program Files (x86)/PostgreSQL/EnterpriseDB-ApachePHP/apache/www/run_db/";
$csv_img = "C:/WAPP/apache2/htdocs/ddd/run_db/";

if($tbl == "images") {
	$qc = 'INSERT INTO images ("section","frameno","lat","long","filename","the_geom") 
  SELECT "section","frameno","lat","long","filename","the_geom"
    FROM images_copy';
    retrieve($qc);
}


?>
