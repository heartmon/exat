<?php
session_start();
if($_SESSION['open'])
{
	header("Content-type:application/pdf");
	header("Cache-Control:  maxage=1");
  header("Pragma: public");

//if(ae_detect_ie())
//{
	// It will be called downloaded.pdf
	header("Content-Disposition:attachment;filename=PrintPDF.pdf");
//}

// The PDF source is in original.pdf
readfile("ajax/pdftemp.pdf");

session_destroy();
}

function ae_detect_ie()
{
    if (isset($_SERVER['HTTP_USER_AGENT']) && 
    (strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE') !== false))
        return true;
    else
        return false;
}
?>