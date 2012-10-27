<!DOCTYPE HTML>
<html>
<head>
	<!--<meta name="viewport" content="width=device-width, initial-scale=1.0">-->
	<meta http-equiv="Content-Type" content="text/html; charset=win874" />
</head>
<?php
include_once('../_db.php');


$row = 1;
if (($handle = fopen("/home/asset/csv/hdm4/name.csv", "r")) !== FALSE) {
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        $num = count($data);
      //  echo "<p> $num fields in line $row: <br /></p>\n";
        $row++;
        if($row!=2)
       	{
       		$sql = "update hdm4_unlimited
				set expressway = '".str_replace('q','',$data[1])."'
				where abb_exp LIKE '%".$data[0]."%'";
			//echo $sql;
			//echo 'ky';
			$result = pg_query($sql);
       	 	//for ($c=0; $c < $num; $c++) {
        	 //  	 echo str_replace('q','',$data[$c]) . "<br />\n";
        	//}
    	}
    }
    fclose($handle);
}

/*$sql = "update hdm4_unlimited
set expressway = 'ทางขึ้นด่านบางเมือง'
where abb_exp LIKE '%401205%'";

$result = pg_query($sql);*/

?>