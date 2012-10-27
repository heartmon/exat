//current frame   		$('#videoplayer').data("currentFrame").index();	
var startframe;
var endframe;

function sliderSyncWithVideo(ui)
{
	var l = ui.values[1]*g_all_result['offset']+1;
	l += g_search_info_level2['kmfreq']/5;
   	if(l > g_video['length']+1)
   		l = g_video['length']+1;
   	if(reverse)
   	{
   		$('#videoslider').slider( "values" , 0, $( "#videoslider" ).slider( "option", "max" ) - l + 1);
		$('#videoslider').slider( "values" , 1, $( "#videoslider" ).slider( "option", "max" ) - ui.values[0]*g_all_result['offset'] - 1);
   	}
   	else
   	{
		$('#videoslider').slider( "values" , 0, ui.values[0]*g_all_result['offset']+1);
		$('#videoslider').slider( "values" , 1, l);
	}
	updateVideoData();
	updateRange();
	startframe = $('#videoslider').slider( "values" , 0);
	endframe = $('#videoslider').slider( "values" , 1);
}

function updateVideoData() {
		if(g_video['first_image'])
		{
			if(g_hdm4search_click)
				var index = g_all_result['usedlength'] - $('#videoslider').slider( "values" , 0);
			else if(reverse)
				var index = g_all_result['usedlength'] - $('#videoslider').slider( "values" , 0) + 1;
			else
				var index = $('#videoslider').slider( "values" , 0)-1;
			var damage = parseFloat(g_all_result[index][getInfoType($('input[name="infotype"][id="'+g_search_info.infotype+'"]').val())]).toFixed(4);
			var lat = g_all_result[index]['lat'];
			var longi = g_all_result[index]['long']; 
			var km = g_all_result[index]['subdistance'];

			var filename = g_video['first_image'] + index + '.jpg';
		//	var numPic = index;

			$('#videoinfo #video_km').html(toKm(km));
			if(!g_hdm4search_click)
			{
				$('#videoinfo #video_infotype').html(damage);	
			}
			$('#videoinfo #video_lat').html(lat);	
			$('#videoinfo #video_long').html(longi);	

			$('#videoinfo #current_image').html(filename);		
			$('#videoinfo #frameno').html(index);			
			$('#videoinfo #saveimage').prop('href',"asset_images/"+g_search_info_level2['currentsection']+"/"+filename);
		}
}

function updateRange()
{
	var start = $('#videoslider').slider( "values" , 0)-1;
	var end = $('#videoslider').slider( "values" , 1)-1;
	if(reverse)
	{
		start =  g_all_result['usedlength']  - start;
		end =  g_all_result['usedlength']  - end;
		$('#videoinfo #video_kmstart').html(toKm(g_all_result[start]['subdistance']));
		$('#videoinfo #video_kmend').html(toKm(g_all_result[end]['subdistance']));	
	}
	else
	{
		$('#videoinfo #video_kmstart').html(toKm(g_all_result[start]['subdistance']));
		$('#videoinfo #video_kmend').html(toKm(g_all_result[end]['subdistance']));		
	}
}

	function openVideo()
	{
		var ctrlSection = g_search_info_level2['currentsection'];

		var fromImage = parseInt(g_video['first_image']);
		var toImage = fromImage+g_video['length'];
	
		var folderImage = "asset_images/"+g_search_info_level2['currentsection']+"/";

		var step = 1;
		

		startUp();
		resetVideoData();

		//StartUp
		function startUp()
		{
			//Create Video Control
			var htmlcode = '<div id="videocontrol"><div id="videoslider"></div><div class="btn-group"><button id="backward" class="btn btn-mini btn-primary"><i class="icon-backward icon-white"></i></button><button id="step-backward" class="btn btn-mini btn-primary"><i class="icon-step-backward icon-white"></i></button><button id="play" class="btn btn-mini btn-primary"><i class="icon-play icon-white"></i></button><button id="step-forward" class="btn btn-mini btn-primary"><i class="icon-step-forward icon-white"></i></button><button id="forward" class="btn btn-mini btn-primary"><i class="icon-forward icon-white"></i></button><button id="stop" class="btn btn-mini btn-primary"><i class="icon-stop icon-white"></i></button></div></div>';
			$("#videoplayer").append(htmlcode);

			//Setting Initial Video Info
			$('#videoinfo #video_section').html(ctrlSection);
			$('#videoinfo #video_section').prop('title',toFullName(g_search_info_level2['currentcode']));
			$('#videoinfo #video_kmstart').html(toKm(g_data['kmstart']));
			$('#videoinfo #video_kmend').html(toKm(g_data['kmend']));
			//$('#videoinfo #video_lat').html(latstart);
			//$('#videoinfo #video_long').html(longstart);
			if(g_hdm4search_click)
			{
				$('#videoinfo #video_infotype_title').html('แผนการซ่อมบำรุง');
				$('#videoinfo #video_infotype').css('width','250px');
				//$('#videoinfo #video_infotype').html(g_current_var['hdm4']['workdes']);	
			}
			else
				$('#videoinfo #video_infotype_title').html(getAbbInfoType($('input[name="infotype"][id="'+g_search_info.infotype+'"]').val()));
			$('#videoinfo #current_image').html('Loading');		
			$('#videoinfo #frameno').html('Loading');	
		}



		function resetVideoData()
		{
			$('#videoinfo #video_km').html('Loading...');
			if(!g_hdm4search_click)
			{
				$('#videoinfo #video_infotype').html('Loading...');	
				$('#videoinfo #video_infotype').css('width','');
			}
			$('#videoinfo #video_lat').html('Loading...');	
			$('#videoinfo #video_long').html('Loading...');	
			$('#videoinfo #saveimage').prop('href','');
		}

		//Initialize video player
	    $('#videoplayer').jsMovie({
	        sequence: '#.jpg',
	        from: fromImage,
	        to: toImage,
	        folder : folderImage,
	        height:320,
	        width:480,
	        playOnLoad: false,
	        repeat:false,
	        fps:3,
	        myoption:'test'
	       // showPreLoader:true,
	       // loader: {path:"images/loader.png",height:50,width:50,rows:2,columns:4} 
	    });

	  //	$('#videoplayer').jsMovie('stop');
	  	$('#videoinfo #saveimage').click(function(){
	  		if($(this).prop('href').indexOf('asset_images') == -1)
	  			return false;
	  		return true;
	  	});

	    $('#framerate').html($('#videoplayer').jsMovie("option","fps"));

	    //Backward
	    $('#backward').click(function(){
	    	var stat = $('#videoplayer').data("currentStatus");
	    	var op = $('#videoplayer').jsMovie("option","fps");
	    	if(op-2 >= 1)
	    	{
	    		$('#videoplayer').jsMovie("option","fps",op-2);
	    		if(stat == 'playing' || stat == 'play')
	    			$('#videoplayer').jsMovie('play');
	    		//console.log('backward');
	    		$('#framerate').html($('#videoplayer').jsMovie("option","fps"));
	    	}
	    });

	    //Forward
	    $('#forward').click(function(){
	    	var stat = $('#videoplayer').data("currentStatus");
	    	var op = $('#videoplayer').jsMovie("option","fps");
	    	if(op+2 <= 10)
	    	{
	    		$('#videoplayer').jsMovie("option","fps",op+2);
	    		if(stat == 'playing' || stat == 'play')
	    			$('#videoplayer').jsMovie('play');
	    		//console.log('forward');
	    		$('#framerate').html($('#videoplayer').jsMovie("option","fps"));
	    	}
	    });

	    //Step-Backward
		var moving;
	     $('#step-backward').bind('mousedown',function(){
	    	var stat = $('#videoplayer').data("currentStatus");
	    	$('#videoplayer').jsMovie('pause');
	     moving = setInterval(function(){
	       		var currentslider = $('#videoslider').slider( "values" , 0);
		    	$('#videoslider').slider( "values" , 0, currentslider-1);
		    	$("#videoplayer").jsMovie("gotoFrame",currentslider-1);
		    	updateVideoData();
    		}, 100);
	    	
	    }).bind('mouseup', function(event) {
		    clearInterval(moving);
		    var currentslider = $('#videoslider').slider( "values" , 0);
	    	$('#videoslider').slider( "values" , 0, currentslider-1);
	    	$("#videoplayer").jsMovie("gotoFrame",currentslider-1);
	    	updateVideoData();
			}).bind('mouseleave',function(){ clearInterval(moving);});

		//Step-Forward
		var moving;
	     $('#step-forward').bind('mousedown',function(){
	    	var stat = $('#videoplayer').data("currentStatus");
	    	$('#videoplayer').jsMovie('pause');
	     moving = setInterval(function(){
	       		var currentslider = $('#videoslider').slider( "values" , 0);
		    	$('#videoslider').slider( "values" , 0, currentslider+1);
		    	$("#videoplayer").jsMovie("gotoFrame",currentslider+1);
		    	updateVideoData();
    		}, 100);
	    	
	    }).bind('mouseup', function(event) {
		    clearInterval(moving);
		    var currentslider = $('#videoslider').slider( "values" , 0);
	    	$('#videoslider').slider( "values" , 0, currentslider+1);
	    	$("#videoplayer").jsMovie("gotoFrame",currentslider+1);
	    	updateVideoData();
			}).bind('mouseleave',function(){ clearInterval(moving);});	
	      
	     

	     //Scroll
	   $('#videodialog').bind('mousewheel',function(event,delta){
			//console.log(delta);
			if(delta > 0)
			{
				$('#step-forward').mouseup();
			}
			else
			{
				$('#step-backward').mouseup();
			}
	    });
	    
	    $('#videoplayer').bind('play', function(){
	   		var currentframe = $('#videoplayer').data("currentFrame").index();
	   		$('#videoslider').slider( "values" , 0 ,  currentframe );
	   		updateVideoData();
	   	});

	   	$('#videoplayer').bind('playing',function(e, fromFrame, toFrame, repeat){
	   		var currentframe = $('#videoplayer').data("currentFrame").index();
	   		if(currentframe == endframe)
	   		{
	   			$('#videoplayer').jsMovie('stop');
	   			if(startframe-1 > 0)
	   				$("#videoplayer").jsMovie("gotoFrame",startframe-1);
	   			else
	   				$("#videoplayer").jsMovie("previousFrame");
	   			currentframe = startframe;
	   			$('#videoslider').slider( "values" , 0 ,  currentframe);
	   		}
	   		else
	   		{
	   			$('#videoslider').slider( "values" , 0 ,  currentframe+1);
	   		}
	   		updateVideoData();

	   		imageurl = currentframe+1+fromImage+".jpg";
	   		
	   		$('#frameno').html(currentframe+1);
	   		$('#current_image').html(imageurl);
	    });



	   	$('#videoplayer').bind('stop', function(){
	   		$("#videoplayer").jsMovie("gotoFrame",startframe);
	   		$('#videoslider').slider( "values" , 0 ,  startframe );
	   		updateVideoData();
	   		$('#pause i').removeClass('icon-pause').addClass('icon-play');
	   		$('#pause').prop('id','play');
	   	});

		$('#videoplayer').bind('pause', function(){
			//console.log('pause');
			$('#pause i').removeClass('icon-pause').addClass('icon-play');
	   		$('#pause').prop('id','play');

	   	});


	    $('#play').live('click',function(){
        	$('#videoplayer').jsMovie('play');

        	//toggle
        	$(this).prop('id','pause');
        	$(this).find('i').removeClass('icon-play').addClass('icon-pause');
	    });

	    $('#stop').click(function(){
	        $('#videoplayer').jsMovie('stop');
	    });

	   $('#pause').live('click',function(){
	        $('#videoplayer').jsMovie('pause');

	        //toggle
        	$(this).prop('id','play');
        	$(this).find('i').removeClass('icon-pause').addClass('icon-play');
	    });

	   var range = 1+g_video['length'];

	   var ncurrentstart = g_data['kmstart']*1000/5;
	   var ncurrentend = Math.ceil(g_data['kmend']*1000/5);
	   var nfirst = g_search_info_level2['kmstart']*1000/5;
	   if(nfirst != 0)
	   	{
	   		var selected_kmstart = (ncurrentstart+1) % nfirst + (Math.floor(ncurrentstart / nfirst)-1) * nfirst ;
	  		var selected_kmend   = (ncurrentend+1)   % nfirst + (Math.floor(ncurrentend   / nfirst)-1) * nfirst ;
	   	}
	   	else
	   	{
	   		var selected_kmstart = (ncurrentstart+1);
	   		var selected_kmend   = (ncurrentend+1);
	   	}
  
	   	selected_kmend += g_search_info_level2['kmfreq']/5;
	   	if(selected_kmend > g_video['length']+1)
	   		selected_kmend = g_video['length']+1;

	   	startframe = selected_kmstart;
	   	endframe = selected_kmend;
	//   console.log(selected_kmstart+fromImage-1);

	   $('#videoplayer').bind('loaded', function(){
	   		$('#videoplayer').jsMovie('pause');
	   		updateVideoData();
	   	});
		
	   $( "#videoslider" ).slider({
			range: true,
			min: 1,
			//max: 21,
			max: range,
			values: [ selected_kmstart, selected_kmend],
			start: function( event, ui ) {
				$('#videoplayer').jsMovie('pause');
			},
			stop: function( event, ui ) {
				var buttonNo = $(this).find('a.ui-state-focus').index();
				var offset = $('#videoplayer').jsMovie("option","from");
				if(buttonNo == 1)
				{
					$("#videoplayer").jsMovie("gotoFrame",ui.values[0]);
					startframe = ui.values[0];
				}
				else
				{
					endframe = ui.values[1];
				}
				updateVideoData();
				updateRange();
			}
		});

		
	}
	