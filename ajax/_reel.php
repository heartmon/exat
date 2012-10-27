<?php
include_once('../_db.php');


//Get value
$latstart = $_GET['latstart'];
$longstart = $_GET['longstart'];
//$latend = $_GET['latend'];
//$longend = $_GET['longend'];
$section = $_GET['section'];
$kmfreq = $_GET['kmfreq'];
$length = $_GET['length'];

$step = $kmfreq/5;

$imgpath = "../asset_images/".$section."/";
echo $latstart;
echo $longstart;
echo $section;
echo $kmfreq;
echo $length;
//Find first match
$sql = "select * from images where section = '{$section}'
order by (lat-{$latstart})^2 + (long-$longstart)^2 limit 1";
$result = pg_query($sql);
$row = pg_fetch_assoc($result);
$first = $row['frameno'];

//Create Sprite
include("css_sprite.class.php");
$sprite = new spritify();

for($i = $first ; $i <= $first+$length ; $i+=$step) {
	$sprite->add_image($imgpath. $i . ".jpg", "jpeg");
	//echo $i;
}

//retrieving error
$arr = $sprite->get_errors();
//if there are any then output them
if(!empty($arr))
{
	foreach($arr as $error)
	{
		echo "<p>".$error."</p>";
	}
	
}
else
{
	$sprite->safe_image($path = $imgpath."1-reel.jpg");
	return true;
}


?>




