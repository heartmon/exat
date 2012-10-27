<?php
if(isset($_POST['exceldata']))
{
	//echo '<link rel="stylesheet" type="text/css" href="css/style.css">';
	$file="report.xls";
	$exceldata= $_POST['exceldata'];
	$head = explode(";;",$_POST['head']);
	header("Content-type: application/vnd.ms-excel");
	header("Content-Disposition: attachment; filename=$file");
	//echo '<h1>HDM4 Result</h1>'
	echo '<h1>HDM4 Result</h1>
	<h3>สายทาง: <span class="expressway color-blue">'.$head[0].'</span></h3>
	<h3>Year: <span class="color-blue">'.$head[1].'</span></h3>
	<h3>Budget Scenario: <span class="hdm4type color-blue">'.$head[2].'</span></h3>';

	$exceldata = explode(";;", $exceldata);
	$tableheader = "<table border=1 cellpadding='5'><th width=60>ลำดับที่</th>";
	if($head[1] == 'ทุกปี')
		$tableheader .= "<th>ปี</th>";
    $tableheader .= "<th style='text-align:right;' width=68>กม.เริ่มต้น</th><th style='text-align:right;' width=68>กม.สิ้นสุด</th><th width=55>ทิศทาง</th><th width=76>ช่องจราจร</th><th width=232>ลักษณะการซ่อม</th><th width=85>ราคาซ่อมแซม(ลบ.)</th><th width=71>NPV/CAP</th></tr></thead>";
    echo $tableheader;

	$html = "";
	for($i=0;$i<sizeof($exceldata);$i++)
	{
		$temp = explode(",", $exceldata[$i]);
		$html .= '<tr>';
		$html .= '<td align="center">'.($i+1).'</td>';
		if($head[1] == 'ทุกปี')
			$html .= '<td align="center">'.($temp[0]+543).'</td>';
        $html .= '<td align="center">'.$temp[1].'</td>';
        $html .= '<td align="center">'.$temp[2].'</td>';
        $html .= '<td align="center">'.$temp[3].'</td>';
        $html .= '<td align="center">'.$temp[4].'</td>';
        $html .= '<td align="center">'.$temp[5].'</td>';
        $html .= '<td align="center">'.$temp[6].'</td>';
        $html .= '<td align="center">'.$temp[7].'</td>';
        //$html .= '<td align="center">'.$temp[5].'</td>';
        $html .= '</tr>';
	}
	//echo $exceldata;
	echo $html;
	echo '</table>';
	echo $head[4];
}
?>
