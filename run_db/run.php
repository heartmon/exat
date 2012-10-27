<?php
include("../_db.php");
include("_opz.php");
ini_set('display_errors', '1');
//$dbh = connect();
$d = "images"; // *
$tbl = "images"; // **
$type = "enex";
$iri_cols = "(section,distance,subdistance,iri_right,iri_left,iri_avg,iri_lane,iri_center_lane,speed,events,lat,long)";
$rut_cols = "(section,distance,subdistance,rut_right,rut_left,rut_lane,speed,events,lat,long)";
$skid_cols = "(section,distance,subdistance,skid_avg,lat,long)";
$imgcp_cols =  '("section","frameno","interlat","interlong","interalt","framenocal","subdis","measure","ref","lat","long","gps_po","filename")';
$img_cols = '("section","frameno","lat","long","filename","gid","the_geom","dummycol","code")';
$csv_img = "C:/Program Files (x86)/PostgreSQL/EnterpriseDB-ApachePHP/apache/www/run_db/";
/*
	$fp = "csv_images/";
		$fs = d2a($fp,true);
		foreach($fs as $k => $v) {
			//if(substr($v,0,15) == "csv_images/0000") {
				//echo $v . "<br />";
				$q = "COPY " . $tbl . " " 
				. $imgcp_cols . // ***
				" FROM '" . $csv_img . $v . "' WITH DELIMITER ',' CSV HEADER";
				echo "+++ " . $q . "<br/>";
				retrieve($q);
				echo "<br/>";		
			//}
		}
*/
//$q = "update {$tbl} set the_geom = ST_GeometryFromText('SRID=4326;POINT(' || long || ' ' || lat || ')') where the_geom is null";
//retrieve($q);
//include_once("_section_parser.php?infotype=".$tbl);

if($tbl == "images") {
	$qc = 'INSERT INTO images ("section","frameno","lat","long","filename","the_geom") 
  SELECT "section","frameno","lat","long","filename","the_geom"
    FROM images_copy';
    retrieve($qc);
}


?>
