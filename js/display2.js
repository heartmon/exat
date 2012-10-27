//GLOBAL VAR
var plot;
var startIndex;
var endIndex;
//keep kmstart and kmend data only for graph,slider adjusting
var g_data = { kmstart: "", kmend: "" };

var selectedIndex = -1;
var g_linedata = [];
var g_all_result;
var g_options;
var g_search_info = {expressway: "", 
					kmstart: "",
					kmend: "",
					infotype: "",
					searchtype: "",
					exptype:""
					};
var g_search_info_level2 = {kmstart: "", kmend: "", kmfreq: 5, currentlane: "", currentsection: "", currentcode: ""};
var g_hdm4_search = {expressway:"", year: "", type: "", prevyear:""};
var g_hdm4_data_result = [];
var _kmfreq = [5,10,50,100,500,1000];
var _rangefix = 5;
var g_imageset;
var finish_getimage = false;

var g_current_var = {index:0, kmstart:0, kmend:0, section:"" ,rangekmstart:0, rangekmend:0, lat:0, longi:0, skid_avg:0, iri_avg:0, rut_lane:0, hdm4:""};
var g_video = {first_image :"", length: ""};


$(function() {

	init();

	$("#hdm4excel").bind('click',function(){
		var head = $("#yearbudget .expressway").html()+";;"+$("#yearbudget .hdm4year").html()+";;"+$("#yearbudget .hdm4type").html()+";;"+$("#totalcost").html();
		$("#genexcel input[name=head]").val(head);
		$("#genexcel input[name=exceldata]").val(g_hdm4_data_result.join(";;"));
		$("#genexcel").submit();
		return false;
	});

	$("#exportPDF").bind('click',exportPDF);
	$("#hdm4pdf").bind('click',exportPDFhdm4);
	function exportPDFhdm4(){
		//Prepare data
		var year = $("#yearbudget .hdm4year").html();
		var expressway = g_hdm4_search['expressway'];
		var hdm4type = $("#yearbudget .hdm4type").html();
		var totalcost = $("#totalcost").html();
		//Retrieve data from table
		showLoading();
		$.ajax({
            url:'ajax/_export_pdf.php',
            type: 'POST',
            data: {
            	expressway: expressway,
            	year: year,
            	hdm4type: hdm4type,
            	hdm4data:g_hdm4_data_result,
            	totalcost: totalcost
            },
            success: function(data) {
            	if(!data['error'])
				{
					//alert('pdf saved');
					$("#genpdf").submit();
            	}   
            	else
            	{
            		alert('Search not found');
            	}	
     		    hideLoading();
            }
        });
        return false;
	}

	function exportPDF() {
		//Prepare data
		var expressway = g_search_info['expressway'];
		var infotype = g_search_info['infotype'];
		var currentsection = g_search_info_level2['currentsection'];
		var currentcode = g_search_info_level2['currentcode'];
		var fullName = toFullName(currentcode);
		var kmrange = $("#search-input .rangekm").html();
		var kmfreq = g_search_info_level2['kmfreq'];

		var yaxis = [];
		var ygridpx =  "";
		$("div.yAxis .tickLabel").each(function(index){
			yaxis.push($(this).html());
			if(!ygridpx)
			{
				var s1 = $("div.yAxis .tickLabel").eq(index).css('top');
				var a1 = s1.substr(0,s1.indexOf("px"));
				var s2 = $("div.yAxis .tickLabel").eq(index+1).css('top');
				var a2 = s2.substr(0,s2.indexOf("px"));
				a1 = parseFloat(a1.replace("+","."));
				a2 = parseFloat(a2.replace("+","."));
				ygridpx = Math.abs(a2-a1);
			}
		});

		var xaxis = [];
		var xgridpx =  "";
		$("div.xAxis .tickLabel").each(function(index){
			xaxis.push($(this).html());
			if(!xgridpx)
			{
				xgridpx = [];
				var s1 = $("div.xAxis .tickLabel").eq(index).css('left');
				var a1 = s1.substr(0,s1.indexOf("px"));
				var s2 = $("div.xAxis .tickLabel").eq(index+1).css('left');
				var a2 = s2.substr(0,s2.indexOf("px"));
				a1 = parseFloat(a1.replace("+","."));
				a2 = parseFloat(a2.replace("+","."));
				xgridpx.push(a1);
				xgridpx.push(a2);
			}
		});

		var tabledata = [];
		var tempindex = selectedIndex;
		selectedIndex = -1;
		drawGraph();
		
		var canvasData = chartCanvas.toDataURL("image/jpg");

		//Retrieve data from table
		for(var i = startIndex; i<= endIndex; i++)
		{
			var temp = [];
			$("#table1 tbody tr").eq(i).find('td').each(function(index){
				temp.push($(this).html());
			});
			tabledata.push(temp);
		}
		
		var data_inrange = tabledata;
		showLoading();
		$.ajax({
            url:'ajax/_export_pdf.php',
            type: 'POST',
            data: {
            	expressway: expressway,
            	infotype: infotype,
            	section: currentsection,
            	code: currentcode,
            	fullname: fullName,
            	kmrange: kmrange,
            	kmfreq: kmfreq,
            	data_inrange: data_inrange,
            	canvasData: canvasData,
            	yaxis: yaxis,
            	ygridpx: ygridpx,
            	xaxis: xaxis,
            	xgridpx: xgridpx
            },
            success: function(data) {
            	if(!data['error'])
				{
					//alert('pdf saved');
					$("#genpdf").submit();
					if(tempindex >= 0)
						updateVertical(tempindex);
					//$("#exportPDF").prop('href',"")
            	}   
            	else
            	{
            		alert('Search not found');
            	}	
     		    hideLoading();
            }
        });
		return false;
	}

	function init()
	{
		//Hide Result Interface
		$('#main_content').hide();
		$('#lane_selection').hide();
		$('#pager').hide();
		$('#damagesearch').hide();
		$('#section_table').hide();
		$('#hdm4result').hide();
		$("#fix_range").hide();

		$("a.video_lightbox").fancybox({
			'transitionIn'	:	'none',
			'transitionOut'	:	'none',
			'width' : 640,
			'height': 480,
			'autoScale' : false,
			//'type' : 'iframe'
			onStart: function(){
            	$("#videodialog").css('display','block');       
            	if(finish_getimage)
            		openVideo();
        	},
        	onClosed: function(){
            	$("#videodialog").css('display','none');
            	$('#videoplayer').jsMovie("destroy");
        	}
        
	
		});

		$("a.fancyimage").click(function() { 
			$.fancybox({ 
				'autoDimensions': false, 
				'autoscale' : true,
				'content': '<img src="'+this.href+'" width="620" />"',
				'scrolling'   : 'no'
				}); 
			return false; 
		}); 

	}

	function showHDM4()
	{
		if($('#hdm4result').is(':hidden'))
			$('#hdm4result').show();
		$('#damagesearch').hide();
		//$('#section_table').hide();
	}

	function showDamage()
	{
		$('#hdm4result').hide();
		if($('#damagesearch').is(':hidden'))
			$('#damagesearch').show();
	}

	//1st Level Search
	function search1()
	{
		var valid = true;

		//Form Validation
		var temp_ex = $('#expressway').val();
		var temp_kms = $('#kmstart').val();
		var temp_kme = $('#kmend').val();
		if(temp_kms != '')
			temp_kms = parseFloat(temp_kms.replace('+','.')).toFixed(3);
		if(temp_kme != '')
			temp_kme = parseFloat(temp_kme.replace('+','.')).toFixed(3);	
		var temp_info = $('input:radio[name=infotype]:checked').attr('id');
		//var temp_freq = parseInt($('#kmfreq').html());
		if($("#option2").is(":visible"))
			var temp_option2 = $('#specificname').val();

		if(temp_ex == "nothing")
		{	alert('โปรดเลือกสายทาง'); valid=false; }
		if(isNaN(temp_kms) || isNaN(temp_kme) && valid)
		{	alert('ช่วง กม. ต้องเป็นตัวเลขเท่านั้น'); valid = false; }
		if(temp_kms >= temp_kme && valid && temp_kms !== '' && temp_kme !== '')
		{	alert('ช่วง กม. เริ่มต้น ต้องน้อยกว่า ช่วง กม. สิ้นสุด'); valid=false; }
		if(temp_info == undefined && valid)
		{	alert('โปรดเลือกข้อมูลที่ต้องการเรียกดู'); valid=false ;}
		
		if(valid)
		{

		//SetUp Value
		g_search_info.expressway = temp_ex;
		g_search_info.kmstart =  temp_kms;
		g_search_info.kmend = temp_kme;
		g_search_info.infotype = temp_info
		g_search_info.searchtype = $('input:radio[name=searchtype]:checked').val();
		g_search_info['exptype'] = $('#exptype').val();
		//console.log(g_search_info);

		//if($("#option2").is(":visible"))
		// g_search_info_level2['currentsection'] = temp_option2;
		//else
		sectionSearch();

		}
		return false;
	}
	function setupLevel2(){
		//Setup value used for 2nd level search (not click เรียกดู button)
		g_search_info_level2['kmstart'] = g_search_info.kmstart;
		g_search_info_level2['kmend'] = g_search_info.kmend;
		//g_search_info_level2['kmfreq'] = temp_freq;

		//Reset
		g_search_info_level2['currentlane'] = '';
		g_search_info_level2['currentsection'] = '';
		g_search_info_level2['kmfreq'] = '';
		g_imageset = null;
	}
	function setUpCurrentVar()
	{
		g_current_var['section'] 		= g_search_info_level2['currentsection'];
		g_current_var['rangekmstart'] 	= g_all_result['mindis'];
		g_current_var['rangekmend'] 	= g_all_result['maxdis'];
	}
	function updateCurrentVar(index)
	{
		//Math.floor(g_current_var['index']/parseInt(g_all_result['offset'])) When the map is clicked used this index's formula to update plot and table

		index = index * g_all_result['offset'];
		g_current_var['index'] 			= index;
		g_current_var['kmstart'] 		= parseFloat(g_all_result[index]['subdistance']);
		if(g_current_var['kmstart'] ==  parseFloat(g_all_result[g_all_result['last_consider_row']-1-Math.ceil((g_all_result['maxdis'] - g_current_var['kmstart'])*1000/5)]['subdistance']))
			g_current_var['kmend'] 		= parseFloat(g_all_result[g_all_result['last_consider_row']-1]['subdistance']);
		else
			g_current_var['kmend'] 		= parseFloat(g_all_result[index]['subdistance']) + g_search_info_level2['kmfreq']/1000.0;
		g_current_var['lat'] 			= parseFloat(g_all_result[index]['lat']);
		g_current_var['longi'] 			= parseFloat(g_all_result[index]['long']);
		g_current_var['skid_avg'] 		= parseFloat(g_all_result[index]['skid_avg']).toFixed(4);
		g_current_var['iri_avg'] 		= parseFloat(g_all_result[index]['iri_avg']).toFixed(4);
		g_current_var['rut_lane'] 		= parseFloat(g_all_result[index]['rut_lane']).toFixed(4);

		hdm4JoinFunction(g_current_var['kmstart']);


	}

	//1st level search
	function sectionSearch(){
		$('#lane_selection').hide();
		zoomCoor();
		showLoading();
		$.ajax({
            url:'ajax/_sectionsearch.php',
            type: 'GET',
            data: {
            	expressway: toExpresswayCode(g_search_info.expressway), //only value number of expressway are sent.
                kmstart:g_search_info.kmstart,
                kmend:g_search_info.kmend,
                infotype: $('input[name="infotype"][id="'+g_search_info.infotype+'"]').val(),
                exptype: g_search_info['exptype'],
                searchtype: g_search_info['searchtype']
            },
            dataType: 'jsonp',
            dataCharset: 'jsonp',
            success: function(data) {
            	if(!data['error'])
				{
					if(g_search_info['searchtype'] == "overlap")
					{
						setupLevel2();
						//console.log(data);
                		createSectionTable(data);
                		//g_search_info_level2.kmfreq = 5;
            			$('#section_table tbody tr').eq(0).click(); 
            		}
            		else
            		{
            			$('#section_table').hide();
            			setupLevel2();
            			$('#lane_selection').html('');
            			$('#lane_selection').html('<label class="radio inline">เลือกตอนควบคุม: </label>');
							
						var htmlcode = ' <select id="currentlane" name="currentlane" class="input span2">';
						var c = 0;
						for(x in data)
	                	{
	                		c++;
	                		//if(data[x]['specific_name'] != null)
	                		// var sname = data[x]['specific_name'];
	                		//else
	                			var sname = toFullName(data[x]['code']);
	                			sname = sname.substr(sname.indexOf("ฝั่ง")+4);
		                		if(data[x]['section'].indexOf('020') != -1)
		                		{
		                			if(c<=6)
		                				sname += " ช่วงที่ 1";
		                			else
		                				sname += " ช่วงที่ 2";
		                		}

	                		htmlcode += '<option value="'+data[x]['section']+'" title="'+data[x]['code']+'">'+sname+'</option>';
	                	}
	                	htmlcode += '</select>';
	                	$('#lane_selection').append(htmlcode);
	                	if($('#lane_selection').is(':hidden'))
	                		$('#lane_selection').show();
	                //	g_search_info_level2.currentlane = data[0]['lane'];
	                	g_search_info_level2.currentsection = data[0]['section'];
	                	g_search_info_level2.currentcode = data[0]['code'];
	                	ajaxSearch1();
            		}
            	}   
            	else
            	{
            		alert('Search not found');
            	}	
     		    hideLoading();
            }
        });
	}

	//Section Table Click Event
	$('#section_table tbody tr').live('click', function(index){
		if(!$(this).hasClass('table_highlight'))
		{
			var index = $(this).parent().children().index($(this));
			g_search_info_level2['kmstart'] = parseFloat($(this).children().eq(0).html().replace('+','.'));
			g_search_info_level2['kmend'] = parseFloat($(this).children().eq(1).html().replace('+','.'));
			g_search_info_level2['currentsection'] = $(this).children().eq(4).html();
			g_search_info_level2['currentcode'] = $(this).children().eq(3).html();

			$('#section_table tbody tr.table_highlight').removeClass("table_highlight");
			$('#section_table tbody tr').eq(index).addClass('table_highlight');
		
			g_imageset = "";

			ajaxSearch1();
		}
	});



	//1st level search
	function laneSearch(){

		showLoading();

		$.ajax({
            url:'ajax/_lanesearch.php',
            type: 'GET',
            data: {
            	expressway: toExpresswayCode(g_search_info.expressway), //only value number of expressway are sent.
                kmstart:g_search_info.kmstart,
                kmend:g_search_info.kmend,
                infotype: $('input[name="infotype"][id="'+g_search_info.infotype+'"]').val(),
                exptype: g_search_info['exptype']
            },
            dataType: 'jsonp',
            dataCharset: 'jsonp',
            success: function(data) {	          	
				if(!data['error'])
				{
					setupLevel2();
					//console.log(data);
                	$('#lane_selection').html('<label class="radio inline">เลือกเลน: </label>');
						
					var htmlcode = ' <select id="currentlane" name="currentlane" class="input span2">';
                	for(x in data)
                	{
                		htmlcode += '<option value="'+data[x]['section']+'" title="'+data[x]['code']+'">'+data[x]['lane']+'</option>';
                		//var htmlcode = '<label class="radio inline"><input name="currentlane" title="'+data[x]['code']+'" value="'+data[x]['lane']+'" type="radio">'+data[x]['lane']+'</label>';
                		//console.log(data[x]['code']);
                	}
                	htmlcode += '</select>';
                	$('#lane_selection').append(htmlcode);
					//$('input:radio[name=currentlane]:first').attr('checked','checked');
					if($('#lane_selection').is(':hidden'))
                		$('#lane_selection').show();
                	//var htmlcode = '<div class="right"><a href="#" class="btn btn-small"><i class="icon-video"></i> แสดงวีดีโอ</a></div>';
                	//$('#lane_selection').append(htmlcode);
                	
                //	g_search_info_level2.currentlane = data[0]['lane'];
                	g_search_info_level2.currentsection = data[0]['section'];
                	g_search_info_level2.currentcode = data[0]['code'];
                	ajaxSearch1();
                }
				else
				{
				   alert('Search not found');
				}
			 // hideLoading();
            }
        });
	}
	function hdm4JoinFunction(kmstart)
	{
		var section = g_search_info_level2['currentsection'];
		var code = g_search_info_level2['currentcode'];
		var year = $('input:radio[name=hdm4year]:checked').val()-0;
		var type = $('#hdm4type').val();
		//0101-0102

		//02

		//Extraction
		var exp 	= section.substr(0,2);
		//var lane 	= section.substr(-2) ;
		//var dir 	= section.substr(-3,1);

		//var exp = code.substr(0,code.indexOf("_"));
		var lane = code.substr(-2);
		var dir = code.substr(-4,1);

		if(dir == 'O')
			dir = 'ขาออก';
		else
			dir = 'ขาเข้า';

		if(lane == 'LL')
			lane = 'ช่องจราจรซ้าย';
		else if(lane == 'RL')
			lane = 'ช่องจราจรขวา';
		else
			lane = 'ช่องจราจรกลาง';

		$.ajax({
            url:'ajax/_hdm4join.php',
            type: 'GET',
            data: {
            	exp: exp, //only value number of expressway are sent.
                dir: dir,
                lane: lane,
                kmstart:kmstart,
                year: year,
                type: type
            },
            dataType: 'jsonp',
            dataCharset: 'jsonp',
            success: function(data) {
            	//console.log(data);
            	g_current_var['hdm4'] 	= data;
            }
        });

	}

	function calculatePlotData()
	{
		//Reset
		g_linedata = [];

		var count = 0;
		var index_freq = g_search_info_level2.kmfreq / 5;
		var kmfreq = g_search_info_level2.kmfreq;
		var sum = {iri_avg:0,rut_lane:0,skid_avg:0};
		var dataInSum = 0;
		var ymax = 0;
		var maxdis = 0;
		var num_rows = g_all_result['num_rows'];
		var sub =  Math.ceil((parseFloat(g_all_result[num_rows-1]['subdistance'])*1000-g_search_info_level2['kmend']*1000)/5);
		var last_consider_row = num_rows;
		var endbound = false;
		var infotype = getInfoType($('input[name="infotype"][id="'+g_search_info.infotype+'"]').val());
		if(sub > 0)
		{
			last_consider_row = num_rows - sub + index_freq ;
			if(last_consider_row > num_rows)
				last_consider_row = num_rows;
		}	
		if(last_consider_row == num_rows)
			var endbound = true;
	
		for(var row = 0; row < last_consider_row ; row++) {
			var temp ;
			if(kmfreq != 5)
			{
				if(count%index_freq == 0 && parseFloat(g_all_result[row]['subdistance']) <= g_search_info_level2['kmend'])
				{
					temp = g_all_result[row]['subdistance'];
					//console.log("temp:"+temp);
				}
				
				sum['iri_avg']  += parseFloat(g_all_result[row]['iri_avg']);
				sum['rut_lane'] += parseFloat(g_all_result[row]['rut_lane']);
				sum['skid_avg'] += parseFloat(g_all_result[row]['skid_avg']);
				dataInSum++;
				count++;
				if((count%index_freq == 0 || ((count == last_consider_row)&& endbound)) && temp)
				{// || g_search_info_level2['kmend']  == parseFloat(g_all_result['lastkm']) 
					var new_avg = (sum[infotype]*1.0/dataInSum).toFixed(4);
					//console.log("avg:"+new_avg);
						g_linedata.push([temp,new_avg]);
						var sum = {iri_avg:0,rut_lane:0,skid_avg:0};
						dataInSum = 0;

						if(ymax < new_avg)
							ymax = new_avg;
					temp = 0;
					//if(maxdis < g_all_result[row]['subdistance'])
					if(count == last_consider_row)
						maxdis = g_all_result[row]['subdistance'];
					else
						maxdis = g_all_result[row+1]['subdistance'];
				}
			}
			else
			{
				count++;
				if(count != last_consider_row || endbound)
				{
					g_linedata.push([g_all_result[row]['subdistance'],parseFloat(g_all_result[row][infotype]).toFixed(4)]);
					maxdis = g_all_result[row]['subdistance'];
				}
				else
					maxdis = g_all_result[row]['subdistance'];

				if(ymax < parseFloat(g_all_result[row][infotype]))
					ymax = g_all_result[row][infotype];
			}
		}
		g_all_result['ymax'] = ymax;
		g_all_result['mindis'] = parseFloat(g_all_result[0]['subdistance']);
		g_all_result['maxdis'] = parseFloat(maxdis);
		g_all_result['offset'] = index_freq;
		g_all_result['last_consider_row'] = last_consider_row;

		//Reset Some Value			
		selectedIndex = -1;

		g_current_var = {index:0, kmstart:0, kmend:0, section:"" ,rangekmstart:0, rangekmend:0, lat:0, longi:0, skid_avg:0, iri_avg:0, rut_lane:0, hdm4:""};
		setUpCurrentVar();

		$('#current_linedata').hide();					
 		setStartEndIndex(0,g_linedata.length-1);
 		createSlider('slider-range','range');
 		
 		createGraph();
 		createDataTable();

 		//Temporary
 		$('#search-input .expressway').html(g_search_info['expressway']);
 		$('#search-input .infotype').html(g_search_info['infotype']);
 		$('#search-input .rangekm').html(toKm(g_data['kmstart'])+' - '+toKm(g_data['kmend']));
		//updateBinding(['expressway','infotype','rangekm','kmstart','kmend']);
		$('.fullname').html(toFullName(g_search_info_level2['currentcode']));
		hideLoading();


   		settingImage();

   		if(!g_imageset)
   			getImageSet();
   		g_video['length'] = Math.ceil((g_all_result['maxdis']*1000 - g_all_result['mindis']*1000)/5) ;
	}
	//2nd level search
	function ajaxSearch1()
	{
		//Reset Some Value			
		selectedIndex = -1;

		showLoading();
		if(g_search_info['searchtype'] == "notoverlap")
		{
			g_search_info_level2['kmstart'] = g_search_info['kmstart'];
			g_search_info_level2['kmend'] = g_search_info['kmend'];
		}
		$.ajax({
            url:'ajax/_ignore_section.php',
            type: 'GET',
            data: {
            	expressway: toExpresswayCode(g_search_info.expressway), //only value number of expressway are sent.
                kmstart: g_search_info_level2['kmstart'],
                kmend: g_search_info_level2['kmend'],
                infotype: $('input[name="infotype"][id="'+g_search_info.infotype+'"]').val(),
                //kmfreq: g_search_info_level2.kmfreq,
                kmfreq: 5,
                //currentlane: g_search_info_level2.currentlane,
                section: g_search_info_level2.currentsection,
                exptype: g_search_info['exptype']
            },
            dataType: 'jsonp',
            dataCharset: 'jsonp',
            success: function(data) {
             //console.log(data);
               if(!data['error'])
               {
                   	if($('#main_content').is(':hidden'))
					{
						$('#main_content').show();	
					}
					if($('#damagesearch').is(':hidden'))
						showDamage();

                   	_rangefix = data['rangefix'];
                   	if(!g_search_info_level2.kmfreq)
                   		g_search_info_level2.kmfreq = _rangefix;
                   	disableFreq();		                   	

                   	g_all_result = data;

                   	//PKor Function
                   var feature = [];
            var colors = ["green","orange","red"];
                        var context = {
                            getColor: function(feature) {
                                console.log(feature);
                                if(feature.attributes['iri'] < 2.68) {
                                        var region = 1;
                                } else if (feature.attributes['iri'] >= 2.68 &&
feature.attributes['iri'] < 3.5) {
                                        var region = 2;
                                } else if (feature.attributes['iri'] >= 3.5) {
                                        var region = 3;
                                }
                                return colors[region];
                            },
                            getSize: function(feature) {
                                return 2;
                            }
                        };
                        var template = {
                            pointRadius: "${getSize}", // using context.getSize(feature)
                            fillColor: "${getColor}" // using context.getColor(feature)
                        };
                        var style = new OpenLayers.Style(template, {context: context});

           $.each(g_all_result, function(index, value) {
                        console.log(value);
                feature = new OpenLayers.Feature.Vector(
                    new OpenLayers.Geometry.Point(
                        value['long'], value['lat']),
                                            {
                                                iri: value['iri_avg'],
                                                rutting: value['rut_lane'],
                                                skid: value['skid_avg']
                                            });
                qtip_poi.addOptions(style);
                       qtip_poi.addFeatures(features);
           });


                   	//========================

                   	if(g_search_info_level2['kmend'] > g_all_result['lastkm'] || !g_search_info_level2['kmend'] )
                   		g_search_info_level2['kmend'] = parseFloat(g_all_result['lastkm']);
                   	if(!g_search_info_level2['kmstart'])
                   		g_search_info_level2['kmstart'] = parseFloat(g_all_result[0]['subdistance']);

                   	calculatePlotData();
			   }
			   else
			   {
			   	 alert('Search not found');
			   } 
     	   }
 		});
	}

	function getImageSet()
	{
		finish_getimage = false;

		$.ajax({
            url:'ajax/_getImages.php',
            type: 'GET',
            data: {
            	latstart: g_all_result[0]['lat'],
            	longstart: g_all_result[0]['long'],
            	latend: g_all_result[(g_linedata.length-1)*g_all_result['offset']]['lat'],
            	longend: g_all_result[(g_linedata.length-1)*g_all_result['offset']]['long'],
            	section:g_search_info_level2.currentsection,
            	kmfreq:g_search_info_level2.kmfreq
            },
            dataType: 'jsonp',
            dataCharset: 'jsonp',
            success: function(data) {
            	g_imageset = data;
            	//console.log(data);
            	finish_getimage = true;
            	prepareVideoData();
            }
        });
	}

	$.tablesorter.addParser({ 
	        // set a unique id 
	        id: 'kmplus', 
	        is: function(s) { 
	            // return false so this parser is not auto detected 
	            return false; 
	        }, 
	        format: function(s) { 
	            // format your data for normalization 
	            return s.replace('+','.'); 
	        }, 
	        // set type, either numeric or text 
	        type: 'numeric' 
	    }); 

	function createSectionTable(row)
	{
		if($('#main_content').is(':hidden'))
			$('#main_content').show();	
		if($('#section_table').is(':hidden'))
			$('#section_table').show();
		$('#section_table').html('');
	//	console.log($('#section_table').html());
		
		var htmlcode = "<thead><tr><th>เริ่ม</th><th>สิ้นสุด</th><th>ระยะทาง(กม.)</th><th>ชื่อย่อการทาง</th><th>รหัส</th><th>วีดีโอ</th></tr></thead>"
		$('#section_table').html(htmlcode);
		$('#section_table').append('<tbody></tbody>');

		for(var i =0 ; i<row.length; i++)
		{
			var code = row[i]['code'];
			var section = row[i]['section'];
			var min = parseFloat(row[i]['min']);
			var max = parseFloat(row[i]['max']);
			var st = (min);
			//var en = (min)+2;
			var en = (max);
			//while(st < max)
		//	{
			//	if(en >= max)
			//		en = max;
				var htmlcode = "<tr title='คลิ๊กเพื่อดูข้อมูล'><td>"+toKm(st)+"</td><td>"+toKm(en)+"</td><td>"+toKm(en-st)+"</td><td title='"+toFullName(code)+"'>"+code+"</td><td>"+section+"</td><td><a><i class='icon-facetime-video'></i></a></td></tr>"
			//	st += 2;
			//	en += 2;
				$('#section_table tbody').append(htmlcode);
			//}
		}
		
		$("#section_table") 
		.tablesorter({widthFixed: true, 
						headers:{ 
        					0: { sorter:'kmplus' },
        					1: { sorter:'kmplus' }
    						},
    					sortList: [[4,0]]  
    				})
		.tablesorterPager({container: $("#pager"),size:30}); 

	//	console.log($('#section_table').html());
		
	}
	function updateBinding(element)
	{
		var range_element = ['kmstart','kmend'];
		for(x in element)
		{
			if(element[x] == 'rangekm')
				$('.rangekm').each(function() {
					$(this).html(toKm(g_data['kmstart'])+' - '+toKm(g_data['kmend']));
				});
			else if($.inArray(element[x],range_element) >= 0)
			{
				$('.'+element[x]).each(function() {
					if($(this).is("input"))
					{

						$(this).val(toKm(g_data[element[x]]));
					}
					//else
					//	$(this).html(toKm(g_data[element[x]]));	
				});
			}
			else {
				$('.'+element[x]).each(function() {
					$(this).html(g_search_info[element[x]]);
				});
			}
		}
	}

	//Setting Image metadata to default
	function settingImage()
	{
		
			$('.control-section').html(g_search_info_level2.currentsection);
			$('.code-section').html(g_search_info_level2.currentcode);
			$('.kmstart').html(g_search_info.kmstart);
			$('.kmend').html(g_search_info.kmend);
			$('#video-detail .selectedkm').html('');
			$('.latitute').html('');
			$('.longtitute').html('');
			$('#video-player').html('');

			//getImageSet();
	}

	//Update image data when clicked
	function updateVideo(index)
	{
		var latitute = g_all_result[index*g_all_result['offset']]['lat'];
		var longtitute = g_all_result[index*g_all_result['offset']]['long'];
		var selectedkm = $('#table1 tbody tr.table_highlight td:first').html();
		var ctrlSection = g_all_result[index*g_all_result['offset']]['section'];

		$('.latitute').html(latitute);
		$('.longtitute').html(longtitute);
		$('#video-detail .selectedkm').html(selectedkm);
		$('.control-section').html(ctrlSection);
		var index_image = index*g_search_info_level2.kmfreq/5;

		$('#video-player').empty();	
		$('#video-player').html('<img src="" />');
		$('#video-player img').attr("src","images/imgloading.gif").attr("width","290").attr("height","194");
		
		var wait = setInterval(function() {
			if(finish_getimage) {
				clearInterval(wait);
				var imgpath = "asset_images/"+g_search_info_level2.currentcode+"/"+g_imageset[index_image]['filename'].replace("\\",'');
				$('#video-player img').attr("src",imgpath);
			//	console.log(imgpath);
			}
		}, 200);
		
		$("#video-player img").error(function () {
			$(this).attr("src", "images/imgerror.gif");
		});
		
	}

	//Setting start/end index for array g_linedata use for plot graph
	function setStartEndIndex(start_i,end_i)
	{
		startIndex = start_i;
		endIndex = end_i;
		g_data['kmstart'] = g_linedata[startIndex][0];
		g_data['kmend'] = g_linedata[endIndex][0];
	}
	//Prepare Video Slider
	function prepareVideoData()
	{
		g_video['length'] = Math.ceil((g_all_result['maxdis']*1000 - g_all_result['mindis']*1000)/5) ;
		g_video['first_image'] = g_imageset[0]['frameno'];
	}

	//Create slider
	function createSlider(container,range_container)
	{
		var container = $("#"+container);
		var rangeInfo = $("#"+range_container)
		container.slider({
			range: true,
			min: startIndex,
			max: endIndex,
			values: [ startIndex, endIndex ],
			slide: function( event, ui ) {
				updateRange(ui,rangeInfo);
				updateChartAxis();
				updateDataTable();
			}
		});
		rangeInfo.html(toKm( g_data['kmstart']) + " - " + toKm(g_data['kmend']));
	}

	//Update range of jquery slider
	function updateRange(ui,rangeInfo)
	{
		if(ui.values[1] - ui.values[0] >= 2)
		{
			setStartEndIndex(ui.values[0],ui.values[1]);
			rangeInfo.html(toKm( g_data['kmstart']) + " - " + toKm(g_data['kmend']));

			$('#search-input .rangekm').html(toKm(g_data['kmstart'])+' - '+toKm(g_data['kmend']));
		//	updateBinding(['rangekm','kmstart','kmend']);
			//updateLinkVideoLightBox()
		}
	}

	//Change Size of Point in chart
	function someFunc(ctx, x, y, radius, shadow) 
	{
	  someFunc.calls++;
	    ctx.arc(x, y, radius / 3, 0, shadow ? Math.PI : Math.PI * 2, false);
	}
	someFunc.calls = 0;

	function createGraph()
	{
		//Setting max
		var ymax = parseInt(g_all_result['ymax']);
		if(ymax <= 3)
			var max = ymax*2;
		else
			var max = ymax+5;
		//Set Graph option
		g_options = {
		    series: { lines: { show: true, lineWidth: 2 },  points: { show: false , symbol: someFunc}},
		    xaxis: { min: g_data['kmstart'], max: g_data['kmend'], tickFormatter: toKm },
		    yaxis: { min: 0, max: max},
		   // grid: { clickable: true},	
		    grid: { clickable: true, canvasText: {show: true, font: "sans 9px"}},	
		    legend: { position: 'nw', backgroundOpacity: 0 }
		 };
		 //Draw
		drawGraph();
	}

	function drawGraph()
	{
		//Threshold:: Color: Green ,Yellow, Red
		switch($('input[name="infotype"][id="'+g_search_info.infotype+'"]').val()) {
			case "roughness": var threshold1 = 2.68; var threshold2 = 3.5; var color1="#00bb00" ; var color2="#FFCC00"; var color3="#DC0000"; break;
			case "rutting": var threshold1 = 100; var threshold2 = 100; var color1="#00bb00" ; var color2="#FFCC00"; var color3="#DC0000"; break;
			case "skid": var threshold1 = 2.5; var threshold2 = 3.5; var color1="#00bb00" ; var color2="#FFCC00"; var color3="#DC0000"; break;
		}
		//Vertical  Line Setting
		var vertical_line = [[-1,-1],[-1,999]];

		if(selectedIndex>=0)
			vertical_line = [[g_linedata[selectedIndex][0],-1],[g_linedata[selectedIndex][0],999]];
		//Cutting infotype string Ex From **** - Skid to only Skid
		var typecut = g_search_info.infotype.substr(g_search_info.infotype.indexOf("-")+2);
		//Plot Graph
		if(threshold1 < 100)
		{
		plot = $.plot($("#line-chart"), [
			{ data:g_linedata, color:color2, threshold: {above: {limit: threshold2, color:color3} }},
			{ data: vertical_line, color:'#1B9BE0'},
			{ data:g_linedata, color:color2, threshold: {below: {limit: threshold1, color:color1} }},
			{ label: typecut+" > "+threshold2, data: [[-1,-1],[-1,-1]], color:color3 },
			{ label: threshold1+" >= "+typecut+" <= "+threshold2, data: [[-1,-1],[-1,-1]], color:color2 },
			{ label: typecut+" < "+threshold1, data: [[-1,-1],[-1,-1]], color:color1 },
			{ data:g_linedata, color:color2, lines:{show:false}, points:{show:true}, threshold: {below: {limit: 2.5, color:color1}, above: {limit: 3.5, color:color3}  }}
			]
			,g_options);
		}
		else //no threshold
		{
			plot = $.plot($("#line-chart"), [
			{ data:g_linedata, color:color1, points:{show:true}},
			{ data: vertical_line, color:'#1B9BE0'},
			{ data: [[-1,-1],[-1,-1]], color:color2},
			{ label: typecut, data: [[-1,-1],[-1,-1]], color:color1 }
			]
			,g_options);
		}
		$('canvas.base').attr('id','chartCanvas');
		$('canvas.overlay').attr('id','chartCanvasOverlay');
	}

	function updateVertical(index)
	{
		selectedIndex = index;
		//console.log(selectedIndex);
		var y = plot.getData()[1].datapoints.points;
		y[0] = y[2] = g_linedata[index][0];
		plot.draw();
	}

	function nearestIndex(xpos)
	{
		var begin = 0;
		var fin = g_linedata.length-1;
		var middle;
		while(begin<fin)
		{
			middle = Math.floor((begin + fin) / 2);
			if(g_linedata[middle][0] < xpos) 
				begin = middle+1;
			else
				fin = middle;
		}
		var nearest = 0;
		if(fin!=0)
			nearest = xpos - g_linedata[fin - 1][0] < g_linedata[fin][0] - xpos ? fin - 1 : fin;
		return nearest;
	}

	function updateChartAxis(serie_id)
	{
		g_options.xaxis.min = g_data['kmstart'];
		g_options.xaxis.max = g_data['kmend'];	
		drawGraph();
	}

	function highlightTable(index)
	{
		$('#table1 tbody tr.table_highlight').removeClass("table_highlight");
		$('#table1 tbody tr').eq(index).addClass('table_highlight');
		
		if($('#current_linedata').is(':hidden'))
			$('#current_linedata').show();
		var ydata = g_search_info.infotype.substr(g_search_info.infotype.indexOf("-")+2)+": "+$('#table1 tbody tr.table_highlight td:last').html()+" ";
		var selectedkm = $('#table1 tbody tr.table_highlight td:first').html();
		$('#current_linedata span.selectedkm').html(selectedkm);
		$('#current_linedata span.ydata').html(ydata);

		updateVideo(index);
	}

	function highlightChart(serie_id , index)
	{
		plot.unhighlight();
		plot.highlight(serie_id,index);
	}

	function showLoading(){
		$('#loading').show();
		$('#loading').css('top',$('body').scrollTop()-100);
	}

	function hideLoading(){
		$('#loading').hide();
	}

	function createDataTable()
	{
		$('#table1 tbody').html('');
		for(var i =0; i<g_linedata.length; i++)
		{
			var x = g_linedata[i][0];
			var y = g_linedata[i][1];
			if(i == g_linedata.length-1)
				var dataTo = toKm(g_all_result['maxdis']);
			else
				var dataTo = toKm(parseFloat(g_linedata[i+1][0]));
				//var dataTo = toKm(parseFloat(x)+g_search_info_level2.kmfreq/1000.0);
			var htmlcode = "<tr><td>"+toKm(x)+" - "+dataTo+"</td><td width=65>"+y+"</td></tr>";
			$('#table1 tbody').append(htmlcode);
		}
		//console.log($('.tablescroll_head'));
		if($('.tablescroll').length === 0)
			$('#table1').tableScroll({height:234, width:203});
	}

	function hdm4Search()
	{
		var valid = true;
		//Form Validation
		var temp_ex = $('#expressway').val();
		if(temp_ex == "nothing")
		{	alert('โปรดเลือกสายทาง'); valid=false; }
		if(valid)
		{
			//SetUp Value
			g_hdm4_search['expressway'] = temp_ex;
			g_hdm4_search['type'] = $('#hdm4type').val();
			var temp = $('input:radio[name=hdm4year]:checked').val();
			g_hdm4_search['year'] = temp;
			g_hdm4_search['prevyear'] = temp;

			ajaxhdm4();
		}	
		return false;
	}

	function ajaxhdm4()
	{
		showLoading();
		$.ajax({
            url:'ajax/_hdm4search.php',
            type: 'GET',
            data: {
            	expressway: toExpresswayCode(g_hdm4_search['expressway']), //only value number of expressway are sent.
                type: g_hdm4_search['type'],
                year: g_hdm4_search['year']
            },
            dataType: 'jsonp',
            dataCharset: 'jsonp',
            success: function(data) {
            	if(!data['error'])
				{
					if($('#main_content').is(':hidden'))
						$('#main_content').show();	
					showHDM4();
					var totalcost = data['totalcost'];
					delete data['totalcost'];
					updateHDM4metadata();
					g_hdm4_result = data;
                   	createHDM4table(data,totalcost);
                   	$('input:radio[name=hdm4year][value='+g_hdm4_search['year']+']').prop('checked',true);
            	}   
            	else
            	{
            		g_hdm4_search['year'] = g_hdm4_search['prevyear'];
            		alert(data['error']);
            	}	
     		    hideLoading();
            }
        });
	}
	function updateHDM4metadata()
	{
		if(toExpresswayCode(g_hdm4_search['expressway']) == "0101" || toExpresswayCode(g_hdm4_search['expressway']) == "0102")
		{
			$("#hdm4result .expressway").html('เฉลิมมหานคร ช่วงที่ 1 - 2 (ดินแดง - บางนา)');
		}
		else
		{
			$("#hdm4result .expressway").html(g_hdm4_search['expressway']);
		}

		if(g_hdm4_search['year'] == 'all')
			$("#hdm4result .hdm4year").html('ทุกปี');
		else
			$("#hdm4result .hdm4year").html(parseInt((g_hdm4_search['year']))+543);


		//Type Conversion
		var type = "";
		if(g_hdm4_search['type'] == "unlimited")
			type = "ไม่จำกัดงบ";
		else if(g_hdm4_search['type'] == "limited_half")
			type = "ครึ่งงบ";
		else
			type = "เต็มงบ";

		$("#hdm4result .hdm4type").html(type);
		//Update Src of Graph
		$('#hdm4graph').prop('href','asset_images/hdm4/hdm4graph_'+toExpresswayCode(g_hdm4_search['expressway'])+'.png');
	}

	function createHDM4table(row,totalcost)
	{
		$('#hdm4table').html('');
		var htmlcode = "<thead><tr>";
		htmlcode += "<th width=60>ลำดับที่</th>";
		if(g_hdm4_search['year'] == 'all')
			htmlcode += "<th>ปี</th>";
		htmlcode += "<th width=72>กม.เริ่มต้น</th><th width=72>กม.สิ้นสุด</th><th width=60>ทิศทาง</th><th width=122>ช่องจราจร</th><th width=208>ลักษณะการซ่อม</th><th width=105>ราคาซ่อมแซม</th><th></th></tr></thead>";

		$('#hdm4table').html(htmlcode);
		$('#hdm4table').append('<tbody></tbody>');
		g_hdm4_data_result = [];
		var count = 0;
		for(i in row)
		{
			count++;
			var year = row[i]['year'];
			var exp = row[i]['expressway'];
			var dir = row[i]['dir'];
			var lane = row[i]['lane'];
			var kmstart = toKm(parseFloat(row[i]['kmstart']).toFixed(3));
			var kmend =   toKm(parseFloat(row[i]['kmend']).toFixed(3));
			//var rangekm = row[i]['kmstart']+'-'+row[i]['kmend'];
			var workdes = row[i]['workdes'];
			var cost = parseFloat(row[i]['cost']).toFixed(3);
			var htmlcode = "<tr>";

			htmlcode += "<td>"+count+"</td>";
			if(g_hdm4_search['year'] == 'all')
				htmlcode += "<td>"+(parseInt(year)+543)+"</td>";
			htmlcode += "<td style='text-align:left;'>"+kmstart+"</td><td style='text-align:left;'>"+kmend+"</td><td>"+dir+"</td><td style='text-align:left;'>"+lane+"</td><td style='text-align:left;'>"+workdes+"</td><td>"+cost+"</td><td><i class='icon-video'></i></td></tr>";

			$('#hdm4table').append(htmlcode);

			//For PDF Data
			g_hdm4_data_result.push([year,kmstart,kmend,dir,lane,workdes,cost]);
		}
		var text = 'จำนวนเงินทั้งหมดที่ใช้ ';
		if(g_hdm4_search['year'] != 'all')
			text += "ในปี "+(parseInt(g_hdm4_search['year'])+543);
		text += ' : <span class="color-blue">'+totalcost+'</span> ล้านบาท';

		//Total Cost Display
		$("#totalcost").html(text);
		
		//Set Pager using tablesorter plugin
        var myHeaders = {};
        $("#hdm4table").find('th').each(function (i, e) {
            myHeaders[$(this).index()] = { sorter: false };
        });

        $('.pager .first').unbind(); 
        $('.pager .last').unbind(); 
        $('.pager .prev').unbind(); 
        $('.pager .next').unbind(); 
           
		$("#hdm4table")
		.tablesorter({headers: myHeaders}) 
		.tablesorterPager({container: $("#hdm4pager"), size: 20}); 
	}

	//when click video button of HDM4 table
	$("hdm4table icon-video").bind('click',function(){
		showLoading();
		var hdm4kmstart;
		var hdm4kmend;
		var section;

	});

	function updateDataTable()
	{
		  var allrow = $('#table1 tbody tr');
		  allrow.slice(0, startIndex).hide();
		  allrow.slice(startIndex, endIndex + 1).show();
		  allrow.slice(endIndex + 1).hide();		  
	}

	function mapResize(){
		if($('#container_map').hasClass('maximize'))
		{
			var windowWidth = $(window).width();
			var windowHeight = $(window).height();
			$('#container_map, #map').width(windowWidth-40+'px');
			$('#container_map, #map').height(windowHeight-40+'px');
			map.updateSize();
		}
	}

	//MapResize
	$(window).resize(function() { 
		mapResize();
	});

	//Maximize map
	$('#maximize-map-display').toggle(function(){
		if($('#container_map').hasClass('mapclose'))
			$('#toggle-map-display').addClass('fromClose').click();
		$('#container_map, #maximize-map-display, #toggle-map-display').addClass('maximize');
		$('#container_map').parent().css('height', '368px');
		$(this).children().removeClass('icon-resize-full').addClass('icon-resize-small')	
		$(this).attr('title','ย่อแผนที่');
		mapResize();

	}, function(){
		$('#container_map, #maximize-map-display, #toggle-map-display').removeClass('maximize');
		$('#container_map, #map').css('width', '');
		$('#container_map, #map').css('height', '');
		$(this).children().removeClass('icon-resize-small').addClass('icon-resize-full')	
		$('#container_map').parent().css('height', '');
		$(this).attr('title','ขยายแผนที่');
	});

	$('#container_map, #toggle-map-display, #maximize-map-display').hover(function(){
		if($('#toggle-map-display i').hasClass('icon-chevron-up'))
			$('#toggle-map-display').stop().animate({opacity: 0.8});
		$('#maximize-map-display').stop().animate({opacity: 0.8});
	}, function(){
		if($('#toggle-map-display i').hasClass('icon-chevron-up'))
			$('#toggle-map-display').stop().animate({opacity: 0});
		$('#maximize-map-display').stop().animate({opacity: 0});
	});

	//Minimize map
	$('#toggle-map-display').toggle(function(){
		if($('#container_map').hasClass('maximize'))
			$('#maximize-map-display').click();
		$('#container_map').addClass('mapclose');
		$('#container_map').stop().animate({height: 5, 'margin-bottom':35, 'padding-bottom':0},'fast');
		$('#map').stop().animate({top: -325},'fast');
		$('#toggle-map-display, #maximize-map-display').css('bottom','15px');
		$(this).attr('title','เปิดแผนที่');
		$(this).children().removeClass('icon-chevron-up').addClass('icon-chevron-down')	
	}, function(){
		$('#container_map').removeClass('mapclose');
		if($(this).hasClass('fromClose'))
		{
			$('#container_map').css('height','').css('margin-bottom','').css('padding-bottom','');
			$('#map').css('top','');	
			$(this).removeClass('fromClose');
		}
		else
		{
			$('#container_map').stop().animate({height: 330, 'margin-bottom':20,'padding-bottom':8},'fast');
			$('#map').animate({top: 8},'fast');
		}		
		$(this).children().removeClass('icon-chevron-down').addClass('icon-chevron-up');
		$(this).attr('title','เก็บแผนที่');
		$('#toggle-map-display, #maximize-map-display').css('bottom','');
	});

	//HDM4 year dropdown
	$('#hdm4yeardropdown a').bind('click',function(){
		var y = $(this).html();
		if(y != 'ทุกปี')
			y = parseInt(y)-543;
		else 
			y = 'all';
		g_hdm4_search['year'] = y;
		//$('input:radio[name=hdm4year][value='+y+']').prop('checked',true);
		ajaxhdm4();
		return false;
	});

	//กำหนดช่วง Collapsible
	$("input[name=searchtype]").bind('change',function(){
		if($(this).val() == "notoverlap")
			$("#fix_range").show();
		else
			$("#fix_range").hide();
	});

	//option ทางหลัก กับ ทางเชื่อม/ทางขึ้นลง
	$("select[name=exptype]").bind('change',function(){
		if($(this).val() == "ทางหลัก")
		{
			$("#option1").show();
			$("#option2").hide();
		}
		else
		{
			$("#option2").show();
			$("#option1").hide();
			//select section list from database
		}
	});


	//HDM4 budget scene dropdown
	/*$('#budgetscenario ul li a').bind('click',function(){
		var st = $(this).prop('id');
		g_hdm4_search['subtype'] = st;
		ajaxhdm4();
		return false;
	});*/

	//Plot Click
	$("#line-chart").bind("plotclick", function (event, pos, item) {
			plot.unhighlight();
			var nearest = nearestIndex(pos.x);
			updateVertical(nearest);
			highlightTable(nearest);
			updateCurrentVar(nearest);

			//Update Scroll Bar of Data Table No.1
			var tablehl = $('.table_highlight');
			var tableWrapper = $('#table1').parent();
			tableWrapper.scrollTop(tableWrapper.scrollTop() + tablehl.position().top - tablehl.height()*4 - tableWrapper.position().top);
		});
	
	//Datatable(Table1) Click
	$('#table1 tbody tr').live('click', function (){
			var index = $(this).parent().children().index($(this));
			highlightTable(index);
			updateVertical(index);
			updateCurrentVar(index);
		});
	
	//When First choose the expressway
	$('#expressway').one('change',function(){
		$(this).find('option').eq(0).remove();
	});

	//When change expressway clear kmrange
	$('#expressway').bind('change',function(){
		$('#kmstart, #kmend').val('');
	});

	//Select Lane for ignore search
	$('select[name=currentlane]').live('change', function(){
	//	g_search_info_level2['currentlane'] = $(this).val();
		g_search_info_level2['currentsection'] = $(this).val();
		g_search_info_level2['currentcode'] = $(this).find('option:selected').prop('title');
		g_imageset = "";
		ajaxSearch1();
	});

	/*$('.video_lightbox').live('click',function(){
		$(this).attr('href','video.php');

	});*/

	$('#search').bind('click',search1);
	$('#search_hdm4_button').bind('click',hdm4Search);

	var freq_prev = $('#kmfreq').prev();
	var freq_next = $('#kmfreq').next();

	freq_prev.bind('click',function(){
		if(!$(this).hasClass('disabled'))
		{
			var i = _kmfreq.indexOf(parseInt($('#kmfreq').html()));
			if(i-1 >= 0)
			{
				$('#kmfreq').html(_kmfreq[i-1]);
				g_search_info_level2.kmfreq = parseInt($('#kmfreq').html());
			}
			if(i-1 == _kmfreq.indexOf(_rangefix))
				$('#kmfreq').prev().addClass('disabled');

			$('#kmfreq').next().removeClass('disabled');
			//ajaxSearch1();
			calculatePlotData();

			return false;
		}
	});
	freq_next.bind('click',function(){
		if(!$(this).hasClass('disabled'))
		{
			var i = _kmfreq.indexOf(parseFloat($('#kmfreq').html()));
			if(i+1 < _kmfreq.length){
				$('#kmfreq').html(_kmfreq[i+1]);
				g_search_info_level2.kmfreq = parseInt($('#kmfreq').html());
			}
			if(i+1 == _kmfreq.length-1)
				$(this).addClass('disabled');
			$('#kmfreq').prev().removeClass('disabled');
			calculatePlotData();
			return false;
		}
	});

	function disableFreq()
	{
		$('#kmfreq').html(g_search_info_level2.kmfreq);
		var index = _kmfreq.indexOf(parseFloat($('#kmfreq').html()));
		//if(index < _kmfreq.indexOf(_rangefix))
		//	$('#kmfreq').html(_rangefix);
		if(index <= _kmfreq.indexOf(_rangefix))
		{
			$('#kmfreq').prev().addClass('disabled');
			$('#kmfreq').html(_rangefix);
			g_search_info_level2.kmfreq = _rangefix;
		}
		else 
			$('#kmfreq').prev().removeClass('disabled');
		if(index == _kmfreq.length-1)
			$('#kmfreq').next().addClass('disabled');
		else
			$('#kmfreq').next().removeClass('disabled');
	}


});

//Global Function
	function toExpresswayCode(str){
		if(str=="เฉลิมมหานคร ช่วงที่ 1 (ท่าเรือ-ดินแดง)")
			return "0101";
		else if(str=="เฉลิมมหานคร ช่วงที่ 2 (ท่าเรือ-บางนา)")
			return "0102";
		else if(str=="เฉลิมมหานคร ช่วงที่ 3 (ท่าเรือ-ดาวคะนอง)")
			return "0103";
		else if(str=="ฉลองรัช")
			return "02";
		else if(str=="ทางด่วนขั้นที่ 3 สายใต้ S1")
			return "03";
		else if(str=="กาญจนาภิเษก (บางพลี-สุขสวัสดิ์)")
			return "04";
		else if(str=="บูรพาวิถี (บางนา - ตราด)")
			return "05";
	}

function toFullName(code)
{
	fullname = "รอชื่อย่อ";
	if(g_search_info['exptype'] == "ทางหลัก")
	{
		var eachcode = code.split("_");
		var fullname = "ทางหลัก";
		if(eachcode[1] == "O")
			fullname += "ฝั่งขาออก";
		else
			fullname += "ฝั่งขาเข้า";
		switch(eachcode[2]){
			case "RL": fullname += "ช่องจราจรขวา"; break;
			case "ML": fullname += "ช่องจราจรกลาง"; break;
			case "LL": fullname += "ช่องจราจรซ้าย"; break;
		}
	}
	return fullname;
}

function toKm(val)
{
	return new String(new Number(val).toFixed(3)).replace('.', '+');
}

function getInfoType(infotype)
{
	var column_info_name;
	if(infotype == 'roughness')
		column_info_name = 'iri_avg';
	else if(infotype == 'rutting')
		column_info_name = 'rut_lane';
	else if(infotype == 'skid')
		column_info_name = 'skid_avg';
	return column_info_name;
}

function getAbbInfoType(infotype)
{
	var column_info_name;
	if(infotype == 'roughness')
		column_info_name = 'IRI';
	else if(infotype == 'rutting')
		column_info_name = 'Rutting';
	else if(infotype == 'skid')
		column_info_name = 'Skid';
	return column_info_name;
}

function zoomCoor(){
		$.ajax({
                url:'ajax/_geo.php',
                type: 'GET',
                data: {
                    expressway: toExpresswayCode(g_search_info.expressway), //only value number of expressway are sent.
		            kmstart:g_search_info.kmstart,
		            kmend:g_search_info.kmend,
		            infotype: $('input[name="infotype"][id="'+g_search_info.infotype+'"]').val(),
		            exptype: g_search_info['exptype'],
		            searchtype: g_search_info['searchtype']
                },
                dataType: 'jsonp',
                dataCharset: 'jsonp',
                success: function(data) {
                    zoomMap(data.geo);
                }
        });
}