<!DOCTYPE HTML>
<html>
<head>
	<!--<meta name="viewport" content="width=device-width, initial-scale=1.0">-->
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	
	<link rel="stylesheet" type="text/css" href="css/jquery-ui-1.8.16.custom.css">
	<link rel="stylesheet" type="text/css" href="css/bootstrap/css/bootstrap.css">
	<link rel="stylesheet" type="text/css" href="css/style.css">
	<link rel="stylesheet" type="text/css" href="css/tablesorter/style.css">	
	<link rel="stylesheet" href="js/jquery/fancybox/fancybox/jquery.fancybox-1.3.4.css" type="text/css" media="screen" />
	<!--[if IE]>
		<link rel="stylesheet" type="text/css" href="css/bootstrap/css/ie_bootstrap.css">
		<link rel="stylesheet" type="text/css" href="css/ie_style.css">
		<script type="text/javascript" src="js/indexOf_forIE.js"></script>
	<![endif]-->
	<!--[if lte IE 7]>
	<link rel="stylesheet" type="text/css" href="css/ie7.css">
	<![endif]-->

	<!--<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>-->
	<script type="text/javascript" src="js/jquery/jquery-1.7.2.min.js"></script>
	<script type="text/javascript" src="css/bootstrap/js/bootstrap.js"></script>
	<script type="text/javascript" src="js/jquery/jquery-ui.js"></script>
	<!--[if lte IE 8]>
		<script type="text/javascript" src="js/flashcanvas/flashcanvas.js"></script>
		<script type="text/javascript" src="js/flashcanvas/canvas2png.js"></script>
	<![endif]-->
	<script type="text/javascript" src="js/flot/jquery.flot.min.js"></script>
	<script type="text/javascript" src="js/flot/jquery.flot.legendoncanvas.js"></script>
	<script type="text/javascript" src="js/flot/jquery.flot.threshold-ab.js"></script>
	<script type="text/javascript" src="js/jquery/jquery.tablescroll.js"></script>
	<script type="text/javascript" src="js/jquery/jquery.tablesorter.js"></script>
	<script type="text/javascript" src="js/jquery/jquery.tablesorter.pager.js"></script>
	<script type="text/javascript" src="js/jquery/fancybox/fancybox/jquery.fancybox-1.3.4.pack.js"></script>
	<script type="text/javascript" src="js/openlayer/googlemap.js"></script>
	<script type="text/javascript" src="js/openlayer/OpenLayers.js"></script>
	<script defer="defer" type="text/javascript" src="js/gis.js"></script>
	<script type="text/javascript" src="js/display.js"></script>
	<script type="text/javascript" src="js/pdf.js"></script>
	<script type="text/javascript" src="js/jquery/jsmovie.1.4.3b.js"></script>
	<script type="text/javascript" src="js/jquery/jquery.mousewheel.js"></script>
	<script type="text/javascript" src="js/jquery/jquery.reel.js"></script>

	<script type="text/javascript" src="js/video.js"></script>
	
	<script type="text/javascript" src="js/qtip/jquery.qtip.js"></script>
	<link rel="stylesheet" type="text/css" href="js/qtip/jquery.qtip.css">
	<title>EXAT : GIS แผนที่ภูมิศาสตร์สารสนเทศ</title>
</head>
<body onLoad="init()">
<div id="header">
	<a href="#"><img id="logo" src="images/logo.png" alt="การทางพิเศษแห่งประเทศไทย"></img></a>
	<div id="header-dashboard">
		<!--<button class="btn">ลงชื่อออก</button>-->
	</div>
</div>
<div id="wrapper">

	<div id="videodialog">
		<div id="video-bg">
			<div id="videopreloader" class="progress progress-striped active">
			  	<div class="bar" style="width: 40%;"></div>
			</div>
			<div id="videoplayer">
			
			</div>
			<div id="videoinfo">
				รูปที่: <div id="frameno" class="infoblock small"></div>
				ความเร็ว: <div id="framerate" class="infoblock small"></div>
				ไฟล์รูป: <div id="current_image" class="infoblock small"></div> <a class="btn btn-mini btn" target="_blank" id="saveimage" title="เซฟรูปนี้"><i class="icon-download-alt"></i></a><br>
				ตอนควบคุม: <div id="video_section" class="infoblock medium">loading...</div>
				ช่วงกม. เริ่มต้น: <div id="video_kmstart" class="infoblock small">loading...</div>
				สิ้นสุด: <div id="video_kmend" class="infoblock small">loading...</div><br>
				กม.: <div id="video_km" class="infoblock small">loading...</div>
				<span id="video_infotype_title"></span>: <div id="video_infotype" class="infoblock small">loading...</div>
				Lat: <div id="video_lat" class="infoblock medium">loading...</div>
				Long: <div id="video_long" class="infoblock medium">loading...</div><br>
			</div>
		</div>
	</div>
	
	<div class="container">
		<div id="loading" class="alert">Loading <img src="css/img/ajax-loader.gif"></div>
		
		<div class="row" style="position:relative;">
			<div class="span12">	
				<div id="container_map" class="normal">
					<div id="map" ></div>
				</div>
				
			</div>
			<div id="maptoolbox">
				<div id="expnametype">
				</div>
				<div id="selectname">
					<select id="mainLane" name="mainLane" class="span3 mainLane"></select>
				</div>
				<div id="damage">
				</div>
			</div>
			<div id="mapstatus"></div>
			<div id="mapicon">
				<a class="btn btn-inverse normal" title="เก็บแผนที่" id="toggle-map-display" ><i class="icon-chevron-up icon-white"></i></a>
				<a class="btn btn-inverse normal" title="ขยายแผนที่" id="maximize-map-display" ><i class="icon-resize-full icon-white"></i></a>
				<a href="#videodialog" class="btn btn-inverse normal video_lightbox" title="ดูวิดีโอ" id="video-map-display" ><i class="icon-facetime-video icon-white"></i></a>
			</div>
		</div>

		<div class="row">
			<div class="span3">
				<ul id="toolbox" class="nav nav-list">
					<li class="active toolbox-topic">
						<a><i class="icon-road icon-white"></i> 1) เลือกสายทาง</a>
					</li>
					<select id="expressway" name="expressway" class="input-spanall">
							<!--<option value="nothing" id="เลือกสายทาง">เลือกสายทาง</option>-->
							<option value="05">บูรพาวิถี (บางนา - ตราด)</option>
							<option value="02">ฉลองรัช</option>
							<option value="0101">เฉลิมมหานคร ช่วงที่ 1 (ท่าเรือ-ดินแดง)</option>
							<option value="0102">เฉลิมมหานคร ช่วงที่ 2 (ท่าเรือ-บางนา)</option>
							<option value="0103">เฉลิมมหานคร ช่วงที่ 3 (ท่าเรือ-ดาวคะนอง)</option>
							<option value="04">กาญจนาภิเษก (บางพลี-สุขสวัสดิ์)</option>
							<option value="03" selected>ทางด่วนขั้นที่ 3 สายใต้ S1</option>
					</select>
						<select id="exptype" name="exptype" class="input-spanall">
								<option value="1">ทางหลัก</option>
								<option value="2">ทางขึ้นลง</option>
								<option value="3">ทางเชื่อม</option>
						</select>
						<div id="option1">
							<div id="fix_range">
								<li class="divider"></li>
								กำหนดช่วงกม.
								<div class="font16">
								เริ่ม <input placeholder="" type="text" id="kmstart" name="kmstart" class="span1 kmstart inline" >
								สิ้นสุด <input placeholder="" type="text" id="kmend" name="kmend" class="span1 kmend inline">
								</div>
								<span style="font-size:0.778em;" class="color-grey">(ช่วง กม. ที่กำหนด จะต้องมีระยะทางไม่เกิน 2 กม. เท่านั้น))</span>
							</div>
						</div>
						
						<div id="option2">
							<li class="divider"></li>
							<select style="width:100%" id="accessname" name="accessname" class="input-spanall accessname">
								
								<option value="0000421F01">ทางเชื่อม ฉลองรัช (ขาเข้า) เฉลิมมหานครช่วงท่าเรือ-บางนา (ขาเข้า) </option>
								<option value="0000421F06">ทางเชื่อม ฉลองรัช (ขาเข้า) เฉลิมมหานครช่วงท่าเรือ-บางนา (ขาออก) </option>
								<option value="0000412F01">ทางเชื่อม เฉลิมมหานครช่วงท่าเรือ-บางนา (ขาเข้า) ฉลองรัช (ขาออก)  </option>
								<option value="0000412F05">ทางเชื่อม เฉลิมมหานครช่วงท่าเรือ-บางนา (ขาออก) ฉลองรัช (ขาออก)  </option>
								<option value="0000413F01">ทางเชื่อม เฉลิมมหานคร S1</option>
								<option value="0000431F03">ทางเชื่อม S1 เฉลิมมหานคร</option>
								
								<option value="0000411F01">ทางเชื่อม เฉลิมมหานครช่วงท่าเรือ-ดินแดง (ขาเข้า) ฉลิมมหานครช่วงท่าเรือ-ดาวคะนอง (ขาออก)  </option>
								<option value="0000411F04">ทางเชื่อม เฉลิมมหานครช่วงท่าเรือ-บางนา (ขาเข้า) ฉลิมมหานครช่วงท่าเรือ-ดาวคะนอง (ขาออก)  </option>
								<option value="0000411R03">ทางเชื่อม เฉลิมมหานครช่วงท่าเรือ-ดาวคะนอง (ขาเข้า) ฉลิมมหานครช่วงท่าเรือ-ดินแดง (ขาออก)  </option>
								<option value="0000411R06">ทางเชื่อม เฉลิมมหานครช่วงท่าเรือ-ดาวคะนอง (ขาเข้า) ฉลิมมหานครช่วงท่าเรือ-บางนา (ขาออก)  </option>
								
								<option value="0000426F02">ทางเชื่อม ฉลองรัช (ขาเข้า) ศรีรัช (ขาเข้า) </option>
								<option value="0000426F07">ทางเชื่อม ฉลองรัช (ขาเข้า) ศรีรัช (ขาออก) </option>
								<option value="0000426F03">ทางเชื่อม ฉลองรัช (ขาออก) ศรีรัช (ขาเข้า) </option>
								<option value="0000426F05">ทางเชื่อม ฉลองรัช (ขาออก) ศรีรัช (ขาออก) </option>
								
								<option value="0000462F01">ทางเชื่อม ศรีรัช (ขาเข้า) ฉลองรัช (ขาเข้า) </option>
								<option value="0000462F07">ทางเชื่อม ศรีรัช (ขาเข้า) ฉลองรัช (ขาออก) </option>
								<option value="0000462F03">ทางเชื่อม ศรีรัช (ขาออก) ฉลองรัช (ขาเข้า) </option>
								<option value="0000462F05">ทางเชื่อม ศรีรัช (ขาออก) ฉลองรัช (ขาออก) </option>
								
														
								<option value="0000445F02">ทางเชื่อม กาญจนภิเษก (ขาเข้า) บูรพาวิถี (ขาเข้า)</option>
								<option value="0000445F03">ทางเชื่อม กาญจนภิเษก (ขาเข้า) บูรพาวิถี (ขาออก)</option>
								
								<option value="0000454F03">ทางเชื่อม บุรพาวิถี (ขาออก) กาญจนาภิเษก (ขาออก)</option>
								<option value="0000454F04">ทางเชื่อม บุรพาวิถี (ขาเข้า) กาญจนาภิเษก (ขาออก)</option>
								
								
								
							</select>
							<select id="enexname0101" name="enexname0101" class="input-spanall enexname">
								<option value="0101201F08">ทางขึ้น ด่านดินแดง</option>
								<option value="0101301R01">ทางลง ด่านดินแดง</option>
								<option value="0101202F02">ทางขึ้น ด่านเพชรบุรี</option>
								<option value="0101303R02">ทางลง ด่านเพชรบุรี</option>
								<option value="0101203R01">ทางขึ้น ด่านสุขุมวิท</option>
								<option value="0101305F01">ทางลง ด่านสุขุมวิท</option>
								
								<option value="0101204R01">ทางขึ้น ด่านพระราม 4 (ถ.พระราม 4 ขาออก)</option>
								<option value="0101205F04">ทางขึ้น ด่านพระราม 4 (ถ.พระราม 4 ขาเข้า)</option>
								<option value="0101306F03">ทางลง ด่านพระราม 4 (ถ.พระราม 4 ขาออก)</option>
								<option value="0101307R01">ทางลง ด่านพระราม 4 (ถ.พระราม 4 ขาเข้า)</option>
							</select>
							<select id="enexname0102" name="enexname0102" class="input-spanall enexname">
								<option value="0102206R02">ทางขึ้น ด่านท่าเรือ(ถ.เกษมราษฏร์ขาเข้า)</option>
								<option value="0102207F01">ทางขึ้น ด่านท่าเรือ (ถ.เกษมราษฏร์ขาออก)</option>
								<option value="0102308F01">ทางลง ด่านท่าเรือ (ถ.เกษมราษฏร์ขาเข้า)</option>
								<option value="0102309R01">ทางลง ด่านท่าเรือ (ถ.เกษมราษฏร์ขาออก)</option>
								<option value="0102208R01">ทางขึ้นด่านอาจณรงค์</option>
								<option value="0102310F01">ทางลงด่านอาจณรงค์</option>
								<option value="0102209R05">ทางขึ้น ด่านสุขุมวิท 62</option>
								<option value="0102311F01">ทางลง ด่านสุขุมวิท 62</option>
								<option value="0102313F01">ทางลง ด่านสรรพวุธ (สมุทรปราการ)</option>
								<option value="0102210R05">ทางขึ้น ด่านสรรพวุธ (สมุทรปราการ)</option>
								<option value="0102210R01">ทางขึ้น ด่านสรรพวุธ (บางนาตราด)</option>
								<option value="0102314F01">ทางลง ด่านสรรพวุธ (บางนาตราด)</option>
								<option value="0102312F01">ทางลง ด่านสรรพวุธ (ถ.สุขุมวิท)</option>
							</select>
							<select id="enexname0103" name="enexname0103" class="input-spanall enexname">
								<option value="0103212R04">ทางขึ้น ด่านเลียบแม่น้ำ</option>
								<option value="0103315F01">ทางลง ด่านเลียบแม่น้ำ</option>
								<option value="0103213F03">ทางขึ้น ขาออกด่านสาธุประดิษฐ์</option>
								<option value="0103317R01">ทางลง ขาเข้าด่านสาธุประดิษฐ์</option>
								<option value="0103316F01">ทางลง ขาออกด่านสาธุประดิษฐ์</option>
								<option value="0103318F01">ทางลง ด่านสุขสวัสดิ์</option>
								<option value="0103214R09">ทางขึ้น ด่านสุขสวัสดิ์</option>
								
								<option value="0103215R03">ทางขึ้น ด่านดาวคะนอง (ถ.พระราม2ขาออก)</option>
								<option value="0103216R01">ทางขึ้น ด่านดาวคะนอง (ถ.พระราม2ขาเข้า)</option>
								<option value="0103319F03">ทางลง ด่านดาวคะนอง (ถ.พระราม2ขาเข้า)</option>
								<option value="0103320F01">ทางลง ด่านดาวคะนอง (ถ.พระราม2ขาออก)</option>
							</select>
							<select id="enexname02" name="enexname02" class="input-spanall enexname">
								<option value="0201201F01">ทางขึ้นขาออกด่านพระโขนง</option>
								<option value="0201301R01">ทางลงขาเข้าด่านพระโขนง</option>
								<option value="0201201F03">ทางขึ้นขาออกด่านพระโขนง (ถ.สุขุมวิทขาออก)</option>
																
								<option value="0201202R01">ทางขึ้นขาเข้าด่านพัฒนาการ (ถ.พัฒนาการขาเข้า)</option>
								<option value="0201203F01">ทางขึ้นขาออกด่านพัฒนาการ (ถ.พัฒนาการขาเข้า)</option>
								<option value="0201303R01">ทางลงขาเข้าด่านพัฒนาการ (ถ.พัฒนาการขาออก)</option>
								<option value="0201302F01">ทางลงขาออกด่านพัฒนาการ (ถ.พัฒนาการขาเข้า)</option>
								
								
								<option value="0201205F01">ทางขึ้นขาเข้าด่านพระราม 9 (ถ.พระราม 9 ขาเข้า)</option>
								<option value="0201304F01">ทางลงขาออกด่านพระราม 9 (ถ.พระราม 9 ขาเข้า)</option>
								<option value="0201305R01">ทางลงขาเข้าด่านพระราม 9 (ถ.พระราม 9 ขาเข้า)</option>
								
								<option value="0201206R01">ทางขึ้นด่านประชาอุทิศ</option>
								<option value="0201306F01">ทางลงด่านประชาอุทิศ</option>
								
														
								<option value="0201207F01">ทางขึ้นด่านลาดพร้าว</option>
								<option value="0201307R01">ทางลงด่านลาดพร้าว</option>
								<option value="0201208R01">ทางขึ้นด่านโยธินพัฒนา</option>
								<option value="0201308F01">ทางลงด่านโยธินพัฒนา</option>
								
								<option value="0202210F04">ทางขึ้นขาออกด่านรามอินทรา (ถ.รามอินทราขาออก)</option>
								<option value="0202210F02">ทางขึ้นขาออกด่านรามอินทรา (ถ.รามอินทราขาเข้า) </option>
								<option value="0201209R01">ทางขึ้นขาเข้าด่านรามอินทรา (ถ.รามอินทราขาเข้า)</option>
								<option value="0201309F01">ทางลงขาออกด่านรามอินทรา (ถ.รามอินทราขาเข้า)</option>
								<option value="0202311R01">ทางลงขาเข้าด่านรามอินทรา (ถ.รามอินทราขาเข้า)</option>
								<option value="0202310R01">ทางลงขาเข้าด่านรามอินทรา (ถ.รามอินทราขาเข้า)</option>
								
								<option value="0202212F03">ทางขึ้นขาออกด่านสุขาภิบาล 5</option>
								<option value="0202211R04">ทางขึ้นขาเข้าด่านสุขาภิบาล 5</option>
								<option value="0202312F01">ทางลงขาออกสุขาภิบาล 5</option>
								<option value="0202313R01">ทางลงขาเข้าสุขาภิบาล 5</option>
								
								<option value="0202213R04">ทางขึ้นด่านจตุโชต (จากวงแหวนตะวันออกฝั่งขาออก)</option>
								<option value="0202213R01">ทางขึ้นด่านจตุโชต (จากวงแหวนตะวันออกฝั่งขาเข้า)</option>
								<option value="0202314F01">ทางลงด่านจตุโชต (สู่วงแหวนตะวันออกฝั่งขาเข้า)</option>
								<option value="0202314F02">ทางลงด่านจตุโชต (สู่วงแหวนตะวันออกฝั่งขาออก)</option>
								
							</select>
							<select id="enexname04" name="enexname04" class="input-spanall enexname">
								<option value="0401201F04">ทางขึ้นขาออกด่านบางพลี</option>
								<option value="0401301R01">ทางลงขาเข้าด่านบางพลี</option>
								<option value="0401302R01">ทางลงขาเข้าวงแหวนฝั่งตะวันออก</option>
								
								<option value="0401303F01">ทางลงขาออกด่านเทพารักษ์ (ถ.เทพารักษ์ขาออก)</option>
								<option value="0401202F01">ทางขึ้นขาออกด่านเทพารักษ์ (ถ.เทพารักษ์ขาเข้า)</option>
								<option value="0401305R01">ทางลงขาเข้าด่านเทพารักษ์ (ถ.เทพารักษ์ขาออก)</option>
								<option value="0401203R01">ทางขึ้นขาเข้าด่านเทพารักษ์ (ถ.เทพารักษ์ขาเข้า)</option>
								<option value="0401304F01">ทางลงขาออกด่านเทพารักษ์ (ถ.เทพารักษ์ขาเข้า)</option>
								<option value="0401202R03">ทางขึ้นขาเข้าด่านเทพารักษ์ (ถ.เทพารักษ์ขาออก)</option>
								<option value="0401203F05">ทางขึ้นขาออกด่านเทพารักษ์ (ถ.เทพารักษ์ขาเข้า)</option>
								<option value="0401306R01">ทางลงขาเข้าด่านเทพารักษ์ (ถ.เทพารักษ์ขาเข้า)</option>
								<option value="0401307F01">ทางลงขาออกด่านบางเมือง (ถ.ศรีนครินทร์ขาออก)</option>
								<option value="0401205F03">ทางขึ้นขาออกด่านบางเมือง (ถ.ศรีนครินทร์ขาออก)</option>
								<option value="0401308R01">ทางลงขาเข้าด่านบางเมือง (ถ.ศรีนครินทร์ขาออก)</option>
								<option value="0401204R01">ทางขึ้นขาเข้าด่านบางเมือง (ถ.ศรีนรินทร์ขาออก)</option>
								<option value="0401204R03">ทางขึ้นขาเข้าด่านบางเมือง (ถ.ศรีนรินทร์ขาเข้า)</option>
								<option value="0401205F01">ทางขึ้นขาออกด่านบางเมือง (ถ.ศรีนรินทร์ขาเข้า)</option>
								<option value="0401309R01">ทางลงขาเข้าด่านบางเมือง (ถ.ศรีนครินทร์ขาเข้า)</option>
								<option value="0401206R01">ทางขึ้นขาเข้าด่านปากน้ำ (ถ.สุขุมวิทขาเข้า)</option>
								<option value="0401206R03">ทางขึ้นขาเข้าด่านปากน้ำ (ถ.สุขุมวิทขาออก)</option>
								<option value="0401207F01">ทางขึ้นขาออกด่านปากน้ำ (ถ.สุขุมวิทขาเข้า)</option>
								<option value="0401207F02">ทางขึ้นขาออกด่านปากน้ำ (ถ.สุขุมวิทขาออก)</option>
								<option value="0401312R01">ทางลงขาเข้าด่านปากน้ำ (ถ.สุขุมวิทขาเช้า)</option>
								<option value="0401313R01">ทางลงขาเข้าด่านปากน้ำ (ถ.สุขุมวิทขาออก)</option>
								<option value="0401311F01">ทางลงขาออกด่านปากน้ำ (ถ.สุขุมวิทขาเข้า)</option>
								<option value="0401310F01">ทางลงขาออกด่านปากน้ำ (ถ.สุขุมวิทขาออก)</option>
								<option value="0401208R01">ทางขึ้นขาเข้าด่านบางครุ (ถ.สุขสวัสดิ์)</option>
								<option value="0401314F01">ทางลงขาออกด่านบางครุ (ถ.สุขสวัสดิ์)</option>
								
								
								
							</select>
							<select id="enexname05" name="enexname05" class="input-spanall enexname">
								<option value="0501201F01">ทางขึ้นด่านบางนา</option>
								<option value="0501302F01">ทางลงด่านบางแก้ว</option>
								<option value="0501501F06">ช่องเก็บเงินด่านบางนาขาออก</option>
								<option value="0501501R06">ช่องเก็บเงินด่านบางนาขาเข้า</option>
								<option value="0501202R03">ทางขึ้นด่านบางแก้ว</option>
								<option value="0501301R01">ทางลงบางนา</option>
								<option value="0501303F01">ทางลงขาออกสู่วงแหวนรอบนอกฝั่งตะวันออก</option>
								<option value="0501204F01">ทางขึ้นขาออกจากวงแหวนรอบนอกฝั่งตะวันออก</option>
								<option value="0501307F01">ทางลงขาออกสู่สุวรรณภูมิ</option>
								<option value="0501207R01">ทางขึ้นขาเข้าจากสุวรรณภูมิ</option>
								<option value="0501304R01">ทางลงขาเข้าสู่วงแหวนรอบนอกฝั่งตะวันออก</option>
								<option value="0501203R01">ทางขึ้นขาเข้าจากวงแหวนรอบนอกฝั่งตะวันออก</option>
								<option value="0501305F01">ทางลงด่านบางพลี 1</option>
								<option value="0501206F01">ทางขึ้นด่านบางพลี 2</option>
								<option value="0501309F01">ทางลงเมืองใหม่บางพลี</option>
								<option value="0501209R01">ทางขึ้นเมืองใหม่บางพลี</option>
								<option value="0501306R01">ทางลงด่านบางพลี 2</option>
								<option value="0501205R01">ทางขึ้นด่านบางพลี 1</option>
								<option value="0501308R01">ทางลงสุวรรณภูมิ</option>
								<option value="0501208F01">ทางขึ้นสุวรรณภูมิ</option>
								<option value="0501310F01">ทางลงบางเสาธง</option>
								<option value="0501211F01">ทางขึ้นด่านบางบ่อ</option>
								<option value="0501312F01">ทางลงด่านบางพลีน้อย</option>
								<option value="0501212R01">ทางขึ้นด่านบางพลีน้อย</option>
								<option value="0501311R01">ทางลงบางบ่อ</option>
								<option value="0501210R01">ทางขึ้นด่านบางเสาธง</option>
								<option value="0501313F01">ทางลงบางสมัคร</option>
								<option value="0501214F01">ทางขึ้นด่านบางวัว</option>
								<option value="0501315F01">ทางลงด่านบางปะกง 1</option>
								<option value="0501216F01">ทางขึ้นด่านบางปะกง 2</option>
								<option value="0501317F01">ทางลงด่านชลบุรี</option>
								<option value="0501217R01">ทางขึ้นด่านชลบุรี</option>
								<option value="0501316R01">ทางลงด่านบางปะกง 2</option>
								<option value="0501215R01">ทางขึ้นด่านบางปะกง 1</option>
								<option value="0501314R01">ทางลงด่านบางวัว</option>
								<option value="0501213R01">ทางขึ้นบางสมัคร</option>
							</select>
						</div>

						
					<li class="divider"></li>
					<li class="active toolbox-topic">
						<a><i class="icon-search icon-white"></i> 2.1) ข้อมูลที่ต้องการเรียกดู </a>
					</li>

					<li class="toolbox-content">
						<form class="">
						
						<label class="radio">
							<input name="infotype" id="ค่าความฝืด - Skid" value="skid" type="radio"><span>ค่าความฝืด - Skid</span>
						</label>						
						<label class="radio">
							<input checked name="infotype" id="ค่าความขรุขระ - IRI" value="roughness" type="radio"><span>ค่าความขรุขระ - IRI</span>
						</label>
						<label class="radio">
							<input name="infotype" id="ค่าร่องล้อ - Rutting" value="rutting" type="radio"><span>ค่าร่องล้อ - Rutting</span>
						</label>

						<div align="right"><button id="search" type="submit" class="btn btn-small btn-primary">เรียกดู</button></div>
						</form>
					</li>
					<li class="divider"></li>
					<li class="active toolbox-topic">
						<a><i class="icon-wrench icon-white"></i> 2.2) แผนการซ่อมบำรุง</a>
					</li>
					<li class="toolbox-content">
						<form class="">
						<select id="hdm4type" name="hdm4type" class="input-spanall">
							<option value="unlimited" >แบบไม่จำกัดงบ</option>
							<option value="limited_half">แบบครึ่งงบ</option>
							<option value="limited_full">แบบเต็มงบ</option>
						</select>
						<label class="radio">
							<input checked name="hdm4year" value="2013" type="radio">2556: HDM4 Plan
						</label>
						<label class="radio">
							<input name="hdm4year" value="2014" type="radio">2557: HDM4 Plan
						</label>
						<label class="radio">
							<input name="hdm4year" value="2015" type="radio">2558: HDM4 Plan
						</label>
						<label class="radio">
							<input name="hdm4year" value="2016" type="radio">2559: HDM4 Plan
						</label>
						<label class="radio">
							<input name="hdm4year" value="2017" type="radio">2560: HDM4 Plan
						</label>
						<label class="radio">
							<input name="hdm4year" value="all" type="radio">ทุกปี: HDM4 Plan
						</label>

						<div align="right"><button id="search_hdm4_button" type="submit" class="btn btn-small btn-primary">เรียกดู</button></div>
						</form>
					</li>	
				</ul>
				
			</div>

			<div id="placeholder" class="span9"></div>
			<!-- Main Content -->
			<div id="main_content" class="span9">
				
				<!-- HDM4 -->
				<div id="hdm4result">
					<h1>แผนการซ่อมบำรุง<div class="uline"></div></h1>
					<div id="yearbudget">
						<h3>สายทาง: <span class="expressway color-blue"></span></h3><br>
						<h3>ปี: <span class="color-blue"></span></h3>
						<div class="resultoptionchange" class="btn-group">
							  <a class="dropdown-toggle" data-toggle="dropdown" href="#">
							  <span class="hdm4year"></span>
							    <span style="vertical-align:middle;" class="caret"></span>
							  </a>
							  <ul id="hdm4yeardropdown" class="dropdown-menu">
							    <li><a href="">2556</a></li>
							    <li><a href="">2557</a></li>
							    <li><a href="">2558</a></li>
							    <li><a href="">2559</a></li>
							    <li><a href="">2560</a></li>
							    <li><a href="">ทุกปี</a></li>
							  </ul>
						</div>
						<br>
						<h3>Budget Scenario: <span class="hdm4type color-blue"></span></h3>	
						<div class="right" id="totalcost">
						
						</div>

						<div id="hdm4buttongroup">
							<a href="#" id="hdm4graph" class="fancyimage btn btn-small"><img src="images/icon_chart.png" title="ดูกราฟ" width=18> กราฟ</a>
							<form id="genpdf" method="POST" style="display:inline-block;" action="topdf.php">
								<a href="#" target="blank" id="hdm4pdf" class="btn btn-small"><img src="images/icon_pdf.png" title="export pdf file" width=18> PDF</a>
								<input type="hidden" name="pdffilename" value="">
							</form>
							<form id="genexcel" target="_blank" method="POST" style="display:inline-block;" action="excel.php">
								<a href="#" id="hdm4excel" class="btn btn-small"><img src="images/icon_excel.png" title="export excel file" width=18> Excel</a>
								<input type="hidden" name="head" value="">
								<input type="hidden" name="exceldata" value="">
							</form>
						</div>
					</div>
					
					<table id="hdm4table" class="table table-condensed table-bordered">
					</table>

					
					<div id="hdm4pager" class="pager">
						<form>
							<img src="css/tablesorter/first.png" class="first"/>
							<img src="css/tablesorter/prev.png" class="prev"/>
							<input type="text" class="pagedisplay span1"/>
							<img src="css/tablesorter/next.png" class="next"/>
							<img src="css/tablesorter/last.png" class="last"/>
							<select class="pagesize span1" style="display:none;">
								<option selected="selected"  value="20">20</option>
							</select>
						</form>
					</div>

				</div>

				<!-- Damage Search -->
				<div id="damagesearch">
				<div id="search-input" class="alert alert-info font16">
					<span class="expressway"></span> • <span class="fullname"></span> • <span class="infotype"></span> • กม.<span class="rangekm"></span>
				</div>
				<div class="row" style="margin-bottom:25px;">
					<div id="center_container" class="span6">
						<div id="current_linedata">
							<span class="ydata"></span>ม. / กม.<br>
							กม. <span class="selectedkm"></span>
						</div>
						<div class="row" id="center_container-toolbox">
							<div class="span3" style="padding-top:10px;"> 
								เลือกช่วงกม. : <span id="range" class="color-blue"></span><div id="slider-range"></div>
							</div>
							<div class="span3">
								<div id="search-detail" class="center">
									แสดงผล ทุกๆ <br>
									<div class="input-prepend input-append">
                						<button class="btn button-once"><i class="icon-arrow-left"></i></button><span style="width:30px;" id="kmfreq" class="center input uneditable-input kmfreq">5</span><button class="btn button-once"><i class="icon-arrow-right"></i></button> ม.
              						</div>
								</div>
								<div id="center-button" class="center">
									<a href="#" id="exportPDF" style="margin-bottom:3px;" class="btn btn-small"><i class="icon-print"></i> พิมพ์</a>
									<a href="#videodialog" class="btn btn-small video_lightbox"><i class="icon-facetime-video"></i> วีดีโอ</a>
								</div>
							</div>
						</div>
						<div id="line-chart" >LINE CHART</div>

						
						
					</div>
					<div class="span3">
						<table id="table1" class="table table-condensed table-bordered table-detailed">
						 	<thead>
						    	<tr>
								    <th >กม.</th>
								    <th >ความเสียหาย <br>(ม./กม.)</th>
						    	</tr>
						  	</thead>
						  	<tbody>
						    	
						    	
						  	</tbody>
						</table>
					</div>
				</div>
			
				<div class="row">
					<div class="span4">
						<div id="lane_selection">

						</div>	
						<table id="section_table" class="table table-condensed table-bordered table-detailed">
						
						</table>
						<div id="pager" class="pager">
							<form>
								<img src="css/tablesorter/first.png" class="first"/>
								<img src="css/tablesorter/prev.png" class="prev"/>
								<input type="text" class="pagedisplay span1"/>
								<img src="css/tablesorter/next.png" class="next"/>
								<img src="css/tablesorter/last.png" class="last"/>
								<select class="pagesize span1" style="display:none;">
									<option selected="selected"  value="30">30</option>
								</select>
							</form>
						</div>
					&nbsp;
					</div>
					<div class="span5">
						<div class="thumbnail" id="video_container">
							
								<!--<div id="video_container-titlebar">&nbsp;</div>-->
								
							
							<div id="video-player">
								<div id="thumbnail">
									<img src="images/imgerror.gif" />
								</div>
								<div id="reel_container" >
								</div>
							</div>
							<div id="video-detail">
							<table class="table-condensed table">
									<tbody>
										<tr>
											<td>รหัสตอนควบคุม</td>
											<td>: <span class="control-section color-blue"></span></td>
										</tr>
										<tr>
											<td>ชื่อย่อการทาง</td>
											<td>: <span class="code-section color-blue"></span></td>
										</tr>
										<tr>
											<td>ช่วง กม. </td>
											<td>: <span class="color-blue selectedkm"></span>
											</td>
										</tr>
										<tr>
											<td>Lat/Long</td>
											<td>: <span class="latitute color-blue"></span>
											&nbsp;<span class="longtitute color-blue"></span>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div> <!-- END DAMAGE SEARCH-->
			</div>
		</div>
	</div>
</div>
<div id="footer">พัฒนาโดย สำนักวิจัยและให้คำปรึกษา มหาวิทยาลัยธรรมศาสตร์ :: พบข้อผิดพลาดของโปรแกรม โปรดติดต่อ iamnotkorr@gmail.com</div>
</body>
</html>
