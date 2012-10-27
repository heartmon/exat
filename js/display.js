//GLOBAL VAR
var plot;
var startIndex;
var endIndex;
//keep kmstart and kmend data only for graph,slider adjusting
var g_data = {
    kmstart: "",
    kmend: ""
};

var selectedIndex = -1;
var g_linedata = [];
var g_all_result;
var g_all_result_all_lane = [];
var g_options;
var g_search_info = {
    expressway: "",
    kmstart: "",
    kmend: "",
    infotype: "",
    searchtype: "",
    exptype: ""
};
var g_search_info_level2 = {
    kmstart: "",
    kmend: "",
    kmfreq: 5,
    currentlane: "",
    currentsection: "",
    currentcode: ""
};
var g_hdm4_search = {
    expressway: "",
    year: "",
    type: "",
    prevyear: "",
    section: "",
    exptype: "",
    dropdownOrder: ""
};
var g_hdm4_data_result = [];
var _kmfreq = [5, 10, 50, 100, 500, 1000];
var _rangefix = 5;
var g_imageset;
var finish_getimage = false;
var HDM4videoclick = false;

var g_current_var = {
    index: 0,
    kmstart: 0,
    kmend: 0,
    section: "",
    rangekmstart: 0,
    rangekmend: 0,
    lat: 0,
    longi: 0,
    skid_avg: 0,
    iri_avg: 0,
    rut_lane: 0,
    hdm4: ""
};
var g_video = {
    first_image: "",
    length: ""
};
var g_hdm4search_click = false;
var reverse = false;

$(function () {

    init();

    $("#video-map-display").hide();

    $("[type='submit']").click(function () {
        $("#placeholder").hide();
        $("#video-map-display").show();
    });

    $("#option2").fadeOut();

    function init() {
        //Hide Result Interface
        $('#main_content').hide();
        $('#lane_selection').hide();
        $('#pager').hide();
        $('#damagesearch').hide();
        $('#section_table').hide();
        $('#hdm4result').hide();
        $("#option_lane").hide();
        $(".mainLane").hide();

        $("a.video_lightbox").fancybox({
            'transitionIn': 'none',
            'transitionOut': 'none',
            'width': 640,
            'height': 480,
            'autoScale': true,
            //'type' : 'iframe'
            onStart: function () {
                $("#videodialog").css('display', 'block');
                if ($('#videoplayer').data("loadStatus") == "loaded") $("#videopreloader").fadeOut();
                $("#fancybox-outer").width(498);
            },
            onClosed: function () {
                $("#videodialog").css('display', 'none');
                $('#videoplayer').jsMovie('stop');

                $("#videopreloader div.bar").css('width', '');
                $("#videopreloader .percentage").html('');
            },
            afterLoad: function(){
            	$("#fancybox-outer").width(498);
            }
        });

        $("a.fancyimage").click(function () {
            $.fancybox({
                //'autoDimensions': false, 
                'autoscale': true,
                'content': '<img src="' + this.href + '" width="460" height="380" />',
                'scrolling': 'no'
            });
            return false;
        });
    }

    //Damage Search
    function search1() {
        //Reset Value
        g_hdm4_result = "";
        var valid = true;
        g_hdm4search_click = false;

        //Form Validation
        var temp_ex = $('select[name=expressway]').val();
        if ($("#fix_range").is(":hidden")) $('#kmstart, #kmend').val('');
        var temp_kms = $('input[name=kmstart]').val();
        var temp_kme = $('input[name=kmend]').val();
        if (temp_kms != '') {
            temp_kms = parseFloat(temp_kms.replace('+', '.'));
            temp_kms = parseFloat(temp_kms.toFixed(3));
        }
        if (temp_kme != '') {
            temp_kme = parseFloat(temp_kme.replace('+', '.'));
            temp_kme = parseFloat(temp_kme.toFixed(3));
        }
        var temp_info = $('input:radio[name=infotype]:checked').attr('id');
        if ($("#option2").is(":visible")) {
            if ($('#exptype').val() == "2") {
                var temp_option2 = $('.enexname').val();
                g_search_info_level2['currentcode'] = $('select.enexname:visible').find('option:selected').html();
            } else {
                var temp_option2 = $('.accessname').val();
                g_search_info_level2['currentcode'] = $('select.accessname:visible').find('option:selected').html();
            }
        }
        var notvalid = {
            'border': "1px solid red",
            'background-color': "#FFD5D5"
        };
        if (temp_ex == "nothing") {
            alert('โปรดเลือกสายทาง');
            valid = false;
        }
        if ((temp_kms === '' || temp_kme === '') && valid && $('#exptype').val() == "1") {
            alert('โปรดกำหนด ช่วง กม.');
            valid = false;
            $('#kmstart, #kmend').css(notvalid);
        }
        if (isNaN(temp_kms) || isNaN(temp_kme) && valid) {
            alert('ช่วง กม. ต้องเป็นตัวเลขเท่านั้น');
            valid = false;
            $('#kmstart, #kmend').css(notvalid);
        }
        if (temp_kms >= temp_kme && valid && temp_kms !== '' && temp_kme !== '') {
            alert('ช่วง กม. เริ่มต้น ต้องน้อยกว่า ช่วง กม. สิ้นสุด');
            valid = false;
            $('#kmstart, #kmend').css(notvalid);
        }
        if (temp_kme - temp_kms > 2 && valid && $('#exptype').val() == "1") {
            alert('ระยะทางต้องไม่เกิน 2 กม.');
            valid = false;
            $('#kmstart, #kmend').css(notvalid);
        }
        if (temp_info == undefined && valid) {
            alert('โปรดเลือกข้อมูลที่ต้องการเรียกดู');
            valid = false;
        }

        //Validation Passed
        if (valid) {
            g_search_info.expressway = temp_ex;
            g_search_info.kmstart = temp_kms;
            g_search_info.kmend = temp_kme;
            g_search_info.infotype = temp_info;
            g_search_info.searchtype = $('input:radio[name=searchtype]:checked').val();
            g_search_info['exptype'] = $('#exptype').val();

            searchBySectionName(temp_option2);
        }
        return false;
    }

    $("#toolbox #kmstart, #toolbox #kmend").bind('focus', function () {
        $(this).css('border', '').css('background-color', '');
    });

    function setupLevel2() {
        $("#videopreloader div.bar").css('width', '');
        $("#videopreloader .percentage").html('');
        if ($('#videoplayer').find('div').hasClass('jsMovieFrame')) $('#videoplayer').jsMovie("destroy");

        //Setup value used for 2nd level search (not click เรียกดู button)
        g_search_info_level2['kmstart'] = g_search_info.kmstart;
        g_search_info_level2['kmend'] = g_search_info.kmend;

        //Reset
        g_search_info_level2['currentlane'] = '';
        g_search_info_level2['currentsection'] = '';
        g_search_info_level2['kmfreq'] = '';
        g_imageset = null;
    }

    function searchBySectionName(sectionCode) {
        zoomCoor();
        $('#section_table').hide();
        setupLevel2();
        g_all_result_all_lane = {};
        $('#lane_selection').html('');
        if ($('#lane_selection').is(':hidden')) $('#lane_selection').show();
        if (g_search_info['exptype'] == "2") {
            cloneToMap($("#toolbox .enexname:visible"), '#lane_selection');
            g_search_info_level2['currentsection'] = sectionCode;
            getAllLane(false);
        } else if (g_search_info['exptype'] == "3") {
            cloneToMap($("#toolbox .accessname:visible"), '#lane_selection');
            g_search_info_level2['currentsection'] = sectionCode;
            getAllLane(false);
        } else {
            cloneToMap($("#maptoolbox #mainLane"), '#lane_selection', false, false);
            $('#lane_selection #mainLane option:first').prop('selected', 'selected');
            $('#maptoolbox #mainLane option:first').prop('selected', 'selected');
            g_search_info_level2['currentsection'] = $('#lane_selection select.mainLane :selected').val();
            g_search_info_level2['currentcode'] = $('#lane_selection select.mainLane :selected').prop('title');

            getAllLane(true);
        }
    }

    //Get data of all lane in one time
    function getAllLane(all, isHDM4) {
        showLoading();
        if (!isHDM4) {
            g_search_info_level2['kmstart'] = g_search_info['kmstart'];
            g_search_info_level2['kmend'] = g_search_info['kmend'];
            var section = g_search_info_level2.currentsection;
        } else var section = g_hdm4_search['section'];

        var suffix = [];
        if (all) {
            $('#lane_selection #mainLane option').each(function () {
                var s = $(this).val().slice(-3);
                suffix.push(s);
            });
        } else {
            suffix.push(section.slice(-3));
        }

        if (section.indexOf('R') != -1) var prefix = section.substr(0, section.indexOf('R'));
        else var prefix = section.substr(0, section.indexOf('F'));

        var fingetalllane = false;
        for (var i = 0; i < suffix.length; i++) {
            var isection = prefix + suffix[i];
            var c = 0;
            if (!g_all_result_all_lane[suffix[i]]) {
                $.ajax({
                    url: 'ajax/_ignore_section.php',
                    type: 'GET',
                    data: {
                        expressway: g_search_info.expressway, //only value number of expressway are sent.
                        kmstart: g_search_info_level2['kmstart'],
                        kmend: g_search_info_level2['kmend'],
                        infotype: $('input[name="infotype"][id="' + g_search_info.infotype + '"]').val(),
                        kmfreq: 5,
                        section: isection,
                        exptype: g_search_info['exptype'],
                        hdm4type: $('select#hdm4type').val()
                    },
                    dataType: 'jsonp',
                    dataCharset: 'jsonp',
                    success: function (data) {
                        if (!data['error']) {
                            var s = data[0]['section'].slice(-3);
                            g_all_result_all_lane[s] = data;
                            g_all_result_all_lane[s]['offset'] = g_all_result_all_lane[s]['rangefix'] / 5;
                            var maxdis = parseFloat(g_all_result_all_lane[s][g_all_result_all_lane[s]['indexsearch']]['subdistance']) + g_all_result_all_lane[s]['rangefix'] / 1000;
                            if (maxdis > parseFloat(g_all_result_all_lane[s]['lastkm'])) maxdis = g_all_result_all_lane[s]['lastkm'];
                            g_all_result_all_lane[s]['maxdis'] = parseFloat(maxdis);
                            g_all_result_all_lane[s]['mindis'] = parseFloat(g_all_result_all_lane[s][0]['subdistance']);
                            g_all_result_all_lane[s]['usedlength'] = Math.ceil((g_all_result_all_lane[s]['maxdis'] * 1000 - g_all_result_all_lane[s]['mindis'] * 1000) / 5);
                            g_all_result_all_lane[s]['onmap'] = false;
                        } else {
                            errorReport(data['error']);
                        }
                    },
                    complete: function () {
                        c++;
                        if (c == suffix.length) ajaxSearch1();
                    }
                });
            }
        }
    }

    //Show Data(table graph) of activated lane
    function activatedResult(data, isHDM4) {
        if (!isHDM4) {
            if ($('#main_content').is(':hidden')) {
                $('#main_content').show();
            }
            if ($('#damagesearch').is(':hidden')) showDamage();
            _rangefix = data['rangefix'];
            if (!g_search_info_level2.kmfreq) g_search_info_level2.kmfreq = _rangefix;
            disableFreq();
            g_search_info_level2['kmstart'] = g_search_info['kmstart'];
            g_search_info_level2['kmend'] = g_search_info['kmend'];
        }
        g_all_result = data;

        g_search_info_level2.currentsection = g_all_result[0]['section'];
        if (g_search_info_level2['currentsection'].indexOf('R') != -1) {
            reverse = true;
        } else reverse = false;

        if (g_search_info_level2['kmend'] > parseFloat(g_all_result['lastkm']) || !g_search_info_level2['kmend']) g_search_info_level2['kmend'] = parseFloat(g_all_result['lastkm']);
        if (!g_search_info_level2['kmstart']) g_search_info_level2['kmstart'] = parseFloat(g_all_result[0]['subdistance']);
        calculatePlotData(isHDM4);
    }

    //Calculate Data based on KM Frequency
    function calculatePlotData(isHDM4) {
        //Reset
        g_linedata = [];

        var count = 0;
        var index_freq = g_search_info_level2.kmfreq / 5;
        var kmfreq = g_search_info_level2.kmfreq;
        var sum = {
            iri_avg: 0,
            rut_lane: 0,
            skid_avg: 0
        };
        var dataInSum = 0;
        var ymax = 0;
        var maxdis = 0;
        var num_rows = g_all_result['num_rows'];
        var sub = Math.ceil((parseFloat(g_all_result[num_rows - 1]['subdistance']) * 1000 - g_search_info_level2['kmend'] * 1000) / 5);
        var last_consider_row = num_rows;
        var endbound = false;
        var infotype = getInfoType($('input[name="infotype"][id="' + g_search_info.infotype + '"]').val());
        if (sub > 0) {
            last_consider_row = num_rows - sub + index_freq;
            if (last_consider_row > num_rows) last_consider_row = num_rows;
        }
        if (last_consider_row == num_rows) var endbound = true;

        for (var row = 0; row < last_consider_row; row++) {
            var temp;
            if (kmfreq != 5) {
                if (count % index_freq == 0 && parseFloat(g_all_result[row]['subdistance']) <= g_search_info_level2['kmend']) {
                    //console.log(g_all_result[row]['subdistance']);
                    temp = g_all_result[row]['subdistance'];
                    //console.log("temp:"+temp);
                }

                sum['iri_avg'] += parseFloat(g_all_result[row]['iri_avg']);
                sum['rut_lane'] += parseFloat(g_all_result[row]['rut_lane']);
                sum['skid_avg'] += parseFloat(g_all_result[row]['skid_avg']);
                dataInSum++;
                count++;
                if ((count % index_freq == 0 || ((count == last_consider_row) && endbound)) && temp) {  
                    var new_avg = (sum[infotype] * 1.0 / dataInSum).toFixed(4);
                    //console.log("avg:"+new_avg);
                    g_linedata.push([temp, new_avg]);
                    var sum = {
                        iri_avg: 0,
                        rut_lane: 0,
                        skid_avg: 0
                    };
                    dataInSum = 0;

                    if (ymax < new_avg) ymax = new_avg;
                    temp = 0;
                    if (count == last_consider_row) maxdis = g_all_result[row]['subdistance'];
                    else maxdis = g_all_result[row + 1]['subdistance'];
                }
            } else {
                count++;
                if (count != last_consider_row || endbound) {
                    g_linedata.push([g_all_result[row]['subdistance'], parseFloat(g_all_result[row][infotype]).toFixed(4)]);
                    maxdis = g_all_result[row]['subdistance'];
                } else maxdis = g_all_result[row]['subdistance'];

                if (ymax < parseFloat(g_all_result[row][infotype])) ymax = g_all_result[row][infotype];
            }
        }
        g_all_result['ymax'] = ymax;
        g_all_result['mindis'] = parseFloat(g_all_result[0]['subdistance']);
        g_all_result['maxdis'] = parseFloat(maxdis);
        g_all_result['offset'] = index_freq;
        g_all_result['last_consider_row'] = last_consider_row;
        g_all_result['usedlength'] = Math.ceil((g_all_result['maxdis'] * 1000 - g_all_result['mindis'] * 1000) / 5);

        qtip.removeAllFeatures();
        addPoints(g_all_result);

        //Reset Some Value          
        selectedIndex = -1;

        g_current_var = {
            index: 0,
            kmstart: 0,
            kmend: 0,
            section: "",
            rangekmstart: 0,
            rangekmend: 0,
            lat: 0,
            longi: 0,
            skid_avg: 0,
            iri_avg: 0,
            rut_lane: 0,
            hdm4: ""
        };
        setUpCurrentVar();

        //If Damage Search then create slider, chart, datatable and image thumbnail
        if (!isHDM4) {
            $('#current_linedata').hide();
            setStartEndIndex(0, g_linedata.length - 1);
            createSlider('slider-range', 'range');
            createGraph();
            createDataTable();
            $('#search-input .expressway').html(expcodeToExpressway(g_search_info['expressway']));
            $('#search-input .infotype').html(g_search_info['infotype']);
            $('#search-input .rangekm').html(toKm(g_data['kmstart']) + ' - ' + toKm(g_data['kmend']));
            $('.fullname').html(toFullName(g_search_info_level2['currentcode']));

            hideLoading();

            settingImage();

            //if(g_search_info_level2['kmfreq'] > 100 && Math.ceil(g_all_result['usedlength']/(g_search_info_level2['kmfreq']/5)) <= 20)
            //  reelSetup();
        }

        //Set Video Length
        if (isHDM4) 
            g_video['length'] = g_all_result['usedlength'] - 1;
        else if (!reverse) 
            g_video['length'] = g_all_result['usedlength'];
        else 
            g_video['length'] = g_all_result['usedlength'] + 1;

        //Get First Image and Preloaded Video
        if (!g_video['first_image']) 
            getFirstImage(isHDM4);
        else {
            if ($('#videoplayer').find('div').hasClass('jsMovieFrame')) 
                $('#videoplayer').jsMovie("destroy");
            $('#videoplayer').data("loadStatus", 'loaded');

            openVideo();
            videoPreloader();

            if (!isHDM4) {
                $('#table1 tr').eq(0).click();
            }
        }
        hideLoading();
    }

    //2nd level search
    function ajaxSearch1(isHDM4) {
        showLoading();
        //Reset Some Value			
        selectedIndex = -1;
        g_video['first_image'] = "";

        var suffix = g_search_info_level2.currentsection.slice(-3);

        if (!g_all_result_all_lane[suffix]) {
            if (!isHDM4) {
                g_search_info_level2['kmstart'] = g_search_info['kmstart'];
                g_search_info_level2['kmend'] = g_search_info['kmend'];
                var section = g_search_info_level2.currentsection;
            } else var section = g_hdm4_search['section'];
            $.ajax({
                url: 'ajax/_ignore_section.php',
                type: 'GET',
                data: {
                    expressway: g_search_info.expressway, //only value number of expressway are sent.
                    kmstart: g_search_info_level2['kmstart'],
                    kmend: g_search_info_level2['kmend'],
                    infotype: $('input[name="infotype"][id="' + g_search_info.infotype + '"]').val(),
                    kmfreq: 5,
                    section: section,
                    exptype: g_search_info['exptype'],
                    hdm4type: $('select#hdm4type').val()
                },
                dataType: 'jsonp',
                dataCharset: 'jsonp',
                success: function (data) {
                    if (!data['error']) {
                        activatedResult(data, isHDM4);
                    } else {
                        errorReport(data['error']);
                    }
                    hideLoading();
                }
            });
        } else {
            data = g_all_result_all_lane[suffix];
            g_all_result_all_lane[suffix]['onmap'] = true;
            activatedResult(data, isHDM4);
            hideLoading();
        }
    }

// ========================== Reel ==============================
    //Reel Setup
    function reelSetup() {
        var imgpath = "asset_images/" + g_search_info_level2['currentsection'] + "/";
        var length = Math.ceil(Math.abs((parseFloat(g_linedata[0][0]) * 1000 - parseFloat(g_linedata[g_linedata.length - 1][0]) * 1000) / 5));
        $.ajax({
            url: 'ajax/_reel.php',
            type: 'GET',
            data: {
                latstart: g_all_result[0]['lat'],
                longstart: g_all_result[0]['long'],
                section: g_search_info_level2.currentsection,
                kmfreq: g_search_info_level2.kmfreq,
                length: length
            },
            success: function (data) {
                if (data) {
                    var thumbpath = imgpath + "1.jpg";
                    $('#video-player #reel_container').append("<img id='reelthumbnail' src='" + thumbpath + "' width='370' height='240' />");
                    $('#reelthumbnail').css("background-size", "370px " + 240 * g_linedata.length + "px")
                    $('#video-player #reel_container').hide();
                    $('#reelthumbnail').reel({
                        indicator: 10, // For no indicator just remove this line
                        footage: 1,
                        frames: g_linedata.length,
                        brake: 10000,
                        // speed: 0.3,
                        delay: 10000000
                    });

                    //Reel Event
                    $('#reelthumbnail').bind('loaded', function (e, x, y, ev) {
                        //  alert('fin. loaded');
                        $('#video-player #reel_container').show();
                        $('#video-player #thumbnail').hide();

                        $('#reelthumbnail').live('pan wheel', function () {
                            var frame = $('#reelthumbnail').reel('frame') - 1;
                            reelStrict(frame);
                            //frame = $('#reelthumbnail').reel('frame') - 1;
                        });
                        $('#reelthumbnail').live('frameChange', function (e, set_frame, frame) {
                            //  console.log(frame);
                            frame = frame - 1;
                            reelStrict(frame);
                            frame = $('#reelthumbnail').reel('frame') - 1;

                            //  updateVertical(frame);
                            highlightTable(frame);
                            updateCurrentVar(frame);
                        }).live('up', function () {
                            var frame = $('#reelthumbnail').reel('frame') - 1;
                            reelStrict(frame);
                            frame = $('#reelthumbnail').reel('frame') - 1;
                            updateVertical(frame);
                            scrollTable();
                        });

                        $('#reelthumbnail').live('stepRight stepLeft', function () {
                            var frame = $('#reelthumbnail').reel('frame') - 1;
                            reelStrict(frame);
                            frame = $('#reelthumbnail').reel('frame') - 1;
                            // console.log(frame);
                            updateVertical(frame);
                            highlightTable(frame);
                            updateCurrentVar(frame);
                            scrollTable();
                        });
                    });
                } else {
                    //	alert('Cannot get reel thumbnails');
                    errorReport('Cannot get reel thumbnails');
                }
            }
        });

        function reelStrict(frame) {
            if (frame - 1 < $('#slider-range').slider("values", 0)) $('#reelthumbnail').reel('frame', $('#slider-range').slider("values", 0) + 1);
            if (frame - 1 >= $('#slider-range').slider("values", 1)) $('#reelthumbnail').reel('frame', $('#slider-range').slider("values", 1) + 1);
        }
    }

    function reelUpdate(index) {
        if ($('#video-player #reel_container').is(":visible")) {
            $('#reelthumbnail').reel('frame', index + 1);
        }
    }

//========================== Current Var. Function =====================

    function setUpCurrentVar() {
        g_current_var['section'] = g_search_info_level2['currentsection'];
        g_current_var['rangekmstart'] = g_all_result['mindis'];
        g_current_var['rangekmend'] = g_all_result['maxdis'];
        //For Flag Positioning
        var lastindex = g_all_result['usedlength'];
        g_current_var['flagfirstlat'] = g_all_result[0]['lat'];
        g_current_var['flagfirstlong'] = g_all_result[0]['long'];
        g_current_var['flaglastlat'] = g_all_result[lastindex]['lat'];
        g_current_var['flaglastlong'] = g_all_result[lastindex]['long'];

    }

    function updateFlag(ui) //Trigger when slider is slided
    {
        findex = ui.values[0] * g_all_result['offset'];
        lindex = ui.values[1] * g_all_result['offset'] + g_search_info_level2['kmfreq'] / 5;
        if (lindex > g_all_result['usedlength']) lindex = g_all_result['usedlength'];
        g_current_var['flagfirstlat'] = g_all_result[findex]['lat'];
        g_current_var['flagfirstlong'] = g_all_result[findex]['long'];
        g_current_var['flaglastlat'] = g_all_result[lindex]['lat'];
        g_current_var['flaglastlong'] = g_all_result[lindex]['long'];
    }

    function updateCurrentVar(index) {
        index = index * g_all_result['offset'];
        eindex = index + g_search_info_level2['kmfreq'] / 5;
        if (eindex > g_all_result['usedlength']) eindex = g_all_result['usedlength'];
        //Add Update For section
        g_current_var['section'] = g_all_result[index]['section'];
        g_current_var['index'] = index;
        g_current_var['kmstart'] = parseFloat(g_all_result[index]['subdistance']);
        g_current_var['kmend'] = parseFloat(g_all_result[eindex]['subdistance']);
        g_current_var['lat'] = parseFloat(g_all_result[index]['lat']);
        g_current_var['longi'] = parseFloat(g_all_result[index]['long']);
        g_current_var['skid_avg'] = parseFloat(g_all_result[index]['skid_avg']).toFixed(4);
        g_current_var['iri_avg'] = parseFloat(g_all_result[index]['iri_avg']).toFixed(4);
        g_current_var['rut_lane'] = parseFloat(g_all_result[index]['rut_lane']).toFixed(4);
    }

//========================== Image Function ============================

   //Setting Image metadata to default
    function settingImage() {
        $('#video-detail .control-section').html(g_all_result[0]['section']);
        $('#video-detail .code-section').html(g_search_info_level2.currentcode);
        $('#video-detail .kmstart').html(g_search_info.kmstart);
        $('#video-detail .kmend').html(g_search_info.kmend);
        $('#video-detail .selectedkm').html('');
        $('#video-detail .latitute').html('');
        $('#video-detail .longtitute').html('');
        $('#video-player #thumbnail').html('').show();
        $('#video-player #reel_container').hide().html('');
    }

    //Get first image of sequences (For thumbnail and video)
    function getFirstImage(isHDM4) {
        var section = g_search_info_level2.currentsection;
        if (g_search_info['expressway'] == "02" && g_search_info['exptype'] == "1") {
            section = "02%100" + section.slice(-3);
            console.log(section);
        }

        $.ajax({
            url: 'ajax/_getFirstImage.php',
            type: 'GET',
            data: {
                section: section, 
                latstart: g_all_result[0]['lat'],
                longstart: g_all_result[0]['long'],
                latend: g_all_result[g_all_result['usedlength']]['lat'],
                longend: g_all_result[g_all_result['usedlength']]['long'],
                exptype: g_search_info['exptype']
            },
            dataType: 'jsonp',
            dataCharset: 'jsonp',
            success: function (data) {
                if (!data['error']) {
                    //Set first image to variable
                    g_video['first_image'] = data['first_image'];

                    //Initialize and Setup video
                    if ($('#videoplayer').find('div').hasClass('jsMovieFrame')) $('#videoplayer').jsMovie("destroy");
                    $('#videoplayer').data("loadStatus", 'loaded');

                    //Preload video
                    openVideo();
                    videoPreloader();
                    if (!isHDM4) {
                        if (!g_imageset) {
                            //Load images for thumbnail
                            getImageSet();
                        }
                    }
                } else {
                    errorReport(data['error']);
                }
            }
        });
    }

    function getImageSet() {
        $('#video-player #thumbnail').empty();
        $('#video-player #thumbnail').html('<img src="" width="320" height="240" />');
        $('#video-player #thumbnail img').attr("src", "images/imgloading.gif").attr("width", "370").attr("height", "240");
        finish_getimage = false;
        var section = g_search_info_level2.currentsection;
        if (g_search_info['expressway'] == "02" && g_search_info["exptype"] == "1") {
            section = "02%100" + section.slice(-3);
            //console.log(section);
        }
        if (g_search_info["exptype"] == "2" || g_search_info["exptype"] == "3") reverse = false;
        $.ajax({
            url: 'ajax/_getImages.php',
            type: 'GET',
            data: {
                section: section,
                length: g_video['length'],
                reverse: reverse,
                first: g_video['first_image']
            },
            dataType: 'jsonp',
            dataCharset: 'jsonp',
            success: function (data) {
                if (!data['error']) {
                    g_imageset = data;
                } else {
                    errorReport(data['error']);
                }
                finish_getimage = true;
                highlightTable(0);
                updateVertical(0);
                updateCurrentVar(0);
            }
        });
    }

    //Update image data when clicked
    function updateVideo(index) {
        selectMapPoint(index);
        var latitute = g_all_result[index * g_all_result['offset']]['lat'];
        var longtitute = g_all_result[index * g_all_result['offset']]['long'];
        var selectedkm = $('#table1 tbody tr.table_highlight td:first').html();
        var ctrlSection = g_all_result[index * g_all_result['offset']]['section'];

        $('.latitute').html(latitute);
        $('.longtitute').html(longtitute);
        $('#video-detail .selectedkm').html(selectedkm);
        $('.control-section').html(ctrlSection);

        if ($('#video-player #reel_container').is(":hidden")) {
            var index_image = index * g_search_info_level2.kmfreq / 5;

            $('#video-player #thumbnail').empty();
            $('#video-player #thumbnail').html('<img src="" />');
            $('#video-player #thumbnail img').attr("src", "images/imgloading.gif").attr("width", "370").attr("height", "240");

            var wait = setInterval(function () {
                if (finish_getimage) {
                    clearInterval(wait);
                    var imgpath = "asset_images/" + g_imageset[index_image]['section'] + "/" + g_imageset[index_image]['filename'].replace("\\", '');

                    $('#video-player #thumbnail img').attr("src", imgpath);
                    //  console.log(imgpath);
                }
            }, 200);

            $("#video-player #thumbnail img").error(function () {
                $(this).attr("src", "images/imgerror.gif");
                var imgpath = "asset_images/" + g_imageset[index_image]['section'] + "/" + g_imageset[index_image]['filename'].replace("\\", '');
                //alert('Image not found:\n'+'Location: '+imgpath);
                errorReport('Image not found:\n' + 'Location: ' + imgpath);
            });
        }

    }


//========================== Slider ============================

    //Create slider
    function createSlider(container, range_container) {
        var container = $("#" + container);
        var rangeInfo = $("#" + range_container)
        container.slider({
            range: true,
            min: startIndex,
            max: endIndex,
            values: [startIndex, endIndex],
            slide: function (event, ui) {
                updateRange(ui, rangeInfo);
                updateChartAxis();
                updateDataTable();
                updateFlag(ui);
                if (g_video['first_image']) sliderSyncWithVideo(ui);
                if ($('#video-player #reel_container').is(":visible")) {
                    $('#reelthumbnail').reel('frame', ui.values[0] + 1);
                }
            }
        });
        rangeInfo.html(toKm(g_data['kmstart']) + " - " + toKm(g_data['kmend']));
    }

    //Update range of jquery slider
    function updateRange(ui, rangeInfo) {
        if (ui.values[1] - ui.values[0] >= 2) {
            $('#slider-range').slider("enable");
            setStartEndIndex(ui.values[0], ui.values[1]);
            rangeInfo.html(toKm(g_data['kmstart']) + " - " + toKm(g_data['kmend']));
            $('#search-input .rangekm').html(toKm(g_data['kmstart']) + ' - ' + toKm(g_data['kmend']));
        }

    }

    //Setting start/end index for array g_linedata use for plot graph
    function setStartEndIndex(start_i, end_i) {
        startIndex = start_i;
        endIndex = end_i;
        g_data['kmstart'] = g_linedata[startIndex][0];
        g_data['kmend'] = g_linedata[endIndex][0];
    }

//======================== Chart Function ===================================
    //Change Size of Point in chart
    function someFunc(ctx, x, y, radius, shadow) {
        someFunc.calls++;
        ctx.arc(x, y, radius / 3, 0, shadow ? Math.PI : Math.PI * 2, false);
    }
    someFunc.calls = 0;

    //Set graph option
    function createGraph() {
        //Setting max
        var ymax = parseInt(g_all_result['ymax']);
        if (ymax <= 3) var max = ymax * 2;
        else var max = ymax + 5;
        g_options = {
            series: {
                lines: {
                    show: true,
                    lineWidth: 2
                },
                points: {
                    show: false,
                    symbol: someFunc
                }
            },
            xaxis: {
                min: g_data['kmstart'],
                max: g_data['kmend'],
                tickFormatter: toKm
            },
            yaxis: {
                min: 0,
                max: max
            },
            // grid: { clickable: true},	
            grid: {
                clickable: true,
                canvasText: {
                    show: true,
                    font: "sans 9px"
                }
            },
            legend: {
                position: 'nw',
                backgroundOpacity: 0
            }
        };
        //Draw
        drawGraph();
    }

    //Check nearest point when user click on graph
    function nearestIndex(xpos) {
        var begin = 0;
        var fin = g_linedata.length - 1;
        var middle;
        while (begin < fin) {
            middle = Math.floor((begin + fin) / 2);
            if (g_linedata[middle][0] < xpos) begin = middle + 1;
            else fin = middle;
        }
        var nearest = 0;
        if (fin != 0) nearest = xpos - g_linedata[fin - 1][0] < g_linedata[fin][0] - xpos ? fin - 1 : fin;
        return nearest;
    }

    //update axis when range-slider change
    function updateChartAxis(serie_id) {
        g_options.xaxis.min = g_data['kmstart'];
        g_options.xaxis.max = g_data['kmend'];
        drawGraph();
    }

    //Plot Click
    $("#line-chart").bind("plotclick", function (event, pos, item) {
        plot.unhighlight();
        var nearest = nearestIndex(pos.x);
        updateVertical(nearest);
        highlightTable(nearest);
        updateCurrentVar(nearest);
        reelUpdate(nearest);

        //Update Scroll Bar of Data Table No.1
        var tablehl = $('.table_highlight');
        var tableWrapper = $('#table1').parent();
        tableWrapper.scrollTop(tableWrapper.scrollTop() + tablehl.position().top - tablehl.height() * 4 - tableWrapper.position().top);
    });

//========================== Data Table ==============================

    function createDataTable() {
        $('#table1 tbody').html('');
        for (var i = 0; i < g_linedata.length; i++) {
            var x = g_linedata[i][0];
            var y = g_linedata[i][1];
            if (i == g_linedata.length - 1) var dataTo = toKm(g_all_result['maxdis']);
            else var dataTo = toKm(parseFloat(g_linedata[i + 1][0]));
            //var dataTo = toKm(parseFloat(x)+g_search_info_level2.kmfreq/1000.0);
            var htmlcode = "<tr><td>" + toKm(x) + " - " + dataTo + "</td><td width=65>" + y + "</td></tr>";
            $('#table1 tbody').append(htmlcode);
        }
        //console.log($('.tablescroll_head'));
        if ($('.tablescroll').length === 0) $('#table1').tableScroll({
            height: 234,
            width: 203
        });
    }

    function highlightTable(index) {
        $('#table1 tbody tr.table_highlight').removeClass("table_highlight");
        $('#table1 tbody tr').eq(index).addClass('table_highlight');

        if ($('#current_linedata').is(':hidden')) $('#current_linedata').show();
        var ydata = g_search_info.infotype.substr(g_search_info.infotype.indexOf("-") + 2) + ": " + $('#table1 tbody tr.table_highlight td:last').html() + " ";
        var selectedkm = $('#table1 tbody tr.table_highlight td:first').html();
        $('#current_linedata span.selectedkm').html(selectedkm);
        $('#current_linedata span.ydata').html(ydata);

        updateVideo(index);
    }

    function scrollTable() {
        //Update Scroll Bar of Data Table No.1
        var tablehl = $('.table_highlight');
        var tableWrapper = $('#table1').parent();
        tableWrapper.scrollTop(tableWrapper.scrollTop() + tablehl.position().top - tablehl.height() * 4 - tableWrapper.position().top);
    }

    //Datatable(Table1) Click
    $('#table1 tbody tr').live('click', function () {
        var index = $(this).parent().children().index($(this));
        highlightTable(index);
        updateVertical(index);
        updateCurrentVar(index);
        reelUpdate(index);
    });

//======================== HDM4 Function =============================//

    function hdm4Click(kmstart, kmend, section) {
        setupLevel2();
        //showLoading();
        g_search_info_level2['kmstart'] = kmstart;
        g_search_info_level2['kmend'] = kmend;
        g_search_info['infotype'] = "ค่าความขรุขระ - IRI";
        //g_search_info_level2['currentsection']	=	section;
        g_hdm4_search['section'] = section;
        g_search_info['exptype'] = g_hdm4_search['exptype'];
        g_search_info_level2.kmfreq = 5;

        g_data['kmstart'] = kmstart;
        g_data['kmend'] = kmend;

        // console.log(g_search_info_level2);
        zoomCoor();
        ajaxSearch1(true);
    }

    function hdm4Search() {
        g_hdm4search_click = true;
        setupLevel2();
        g_video = {};
        //finish_getimage = false;
        var valid = true;
        //Form Validation
        var temp_ex = $('select[name=expressway]').val();
        var exptype = $('select[name=exptype]').val();
        //For ENEX and ACCESS Type
        if (exptype == "3") //Access
        {
            temp_ex = $('#toolbox select.accessname').val().substr(0, $('select.enexname').val().length - 3);
            //Order for dropdown
            g_hdm4_search['dropdownOrder'] = $('#toolbox #accessname option:selected').index();
        } else if (exptype == "2") //Enex
        {
            temp_ex = $('select.enexname').val().substr(0, $('select.enexname').val().length - 3);
            //Order for dropdown
            g_hdm4_search['dropdownOrder'] = $('#toolbox .enexname:visible option:selected').index();
        }


        if (temp_ex == "nothing") {
            alert('โปรดเลือกสายทาง');
            valid = false;
        }
        if (valid) {
            //SetUp Value
            g_hdm4_search['expressway'] = temp_ex;
            g_search_info['expressway'] = $('select[name=expressway]').val();
            g_hdm4_search['type'] = $('#hdm4type').val();
            var temp = $('input:radio[name=hdm4year]:checked').val();
            g_hdm4_search['year'] = temp;
            g_hdm4_search['prevyear'] = temp;
            g_hdm4_search['exptype'] = exptype;

            ajaxhdm4();
        }
        return false;
    }

    function ajaxhdm4() {
        showLoading();
        $.ajax({
            url: 'ajax/_hdm4search.php',
            type: 'GET',
            data: {
                expressway: g_hdm4_search['expressway'], //only value number of expressway are sent.
                type: g_hdm4_search['type'],
                year: g_hdm4_search['year'],
                exptype: g_hdm4_search['exptype']
            },
            dataType: 'jsonp',
            dataCharset: 'jsonp',
            success: function (data) {
                if (!data['error']) {
                    if ($('#main_content').is(':hidden')) $('#main_content').show();
                    showHDM4();
                    var totalcost = data['totalcost'];
                    delete data['totalcost'];
                    updateHDM4metadata();
                    g_hdm4_result = data;
                    createHDM4table(data, totalcost);
                    $('input:radio[name=hdm4year][value=' + g_hdm4_search['year'] + ']').prop('checked', true);
                } else {
                    g_hdm4_search['year'] = g_hdm4_search['prevyear'];
                    alert(data['error']);
                    // errorReport(data['error']);
                }
                hideLoading();
            }
        });
    }

    function updateHDM4metadata() {
        if (g_hdm4_search['expressway'] == "0101" || g_hdm4_search['expressway'] == "0102") {
            $("#hdm4result .expressway").html('เฉลิมมหานคร ช่วงที่ 1 - 2 (ดินแดง - บางนา)');
        } else {
            //$("#hdm4result .expressway").html(expcodeToExpressway(g_hdm4_search['expressway']));
            if (g_hdm4_search['exptype'] == 1) $("#hdm4result .expressway").html($('select[name=expressway] option:selected').html());
            else if (g_hdm4_search['exptype'] == 3) $("#hdm4result .expressway").html($('select[name=accessname] option:selected').html());
            else $("#hdm4result .expressway").html($('select.enexname option:selected').html());
        }

        if (g_hdm4_search['year'] == 'all') $("#hdm4result .hdm4year").html('ทุกปี');
        else $("#hdm4result .hdm4year").html(parseInt((g_hdm4_search['year'])) + 543);


        //Type Conversion
        var type = "";
        if (g_hdm4_search['type'] == "unlimited") type = "ไม่จำกัดงบ";
        else if (g_hdm4_search['type'] == "limited_half") type = "ครึ่งงบ";
        else type = "เต็มงบ";

        $("#hdm4result .hdm4type").html(type);
        //Update Src of Graph
        $('#hdm4graph').prop('href', 'asset_images/hdm4/hdm4graph_' + g_hdm4_search['expressway'] + '.jpg');
    }

    function createHDM4table(row, totalcost) {
        $('#hdm4table').html('');
        var htmlcode = "<thead><tr>";
        htmlcode += "<th width=40>ลำดับ</th>";
        if (g_hdm4_search['year'] == 'all') htmlcode += "<th>ปี</th>";
        htmlcode += "<th style='text-align:right;' width=68>กม.เริ่มต้น</th><th style='text-align:right;' width=68>กม.สิ้นสุด</th><th width=55>ทิศทาง</th><th width=76>ช่องจราจร</th><th width=242>ลักษณะการซ่อม</th><th width=75>ราคา(ลบ.)</th><th width=71>NPV/CAP</th><th></th></tr></thead>";

        $('#hdm4table').html(htmlcode);
        $('#hdm4table').append('<tbody></tbody>');
        g_hdm4_data_result = [];
        var count = 0;
        for (i in row) {
            count++;
            var year = row[i]['year'];
            var exp = row[i]['expressway'];
            var dir = row[i]['dir'];
            if (g_hdm4_search['exptype'] != 1) var lane = row[i]['lane']
            else var lane = row[i]['lane'].substr(row[i]['lane'].indexOf('าจร') + 3);
            var kmstart = toKm(parseFloat(row[i]['kmstart']).toFixed(3));
            var kmend = toKm(parseFloat(row[i]['kmend']).toFixed(3));
            //var rangekm = row[i]['kmstart']+'-'+row[i]['kmend'];
            var workdes = row[i]['workdes'];
            var cost = parseFloat(row[i]['cost']).toFixed(3);
            var npv = parseFloat(row[i]['npv']).toFixed(2);
            var htmlcode = "<tr>";

            htmlcode += "<td>" + count + "</td>";
            if (g_hdm4_search['year'] == 'all') htmlcode += "<td>" + (parseInt(year) + 543) + "</td>";
            htmlcode += "<td style='text-align:right;'>" + kmstart + "</td><td style='text-align:right;'>" + kmend + "</td><td>" + dir + "</td><td>" + lane + "</td><td>" + workdes + "</td><td>" + cost + "</td><td>" + npv + "</td><td><i class='icon-facetime-video'></i></td></tr>";

            $('#hdm4table').append(htmlcode);

            //For PDF Data
            g_hdm4_data_result.push([year, kmstart, kmend, dir, lane, workdes, cost, npv]);
        }
        var text = 'จำนวนเงินทั้งหมดที่ใช้ ';
        if (g_hdm4_search['year'] != 'all') text += "ในปี " + (parseInt(g_hdm4_search['year']) + 543);
        text += ' : <span class="color-blue">' + totalcost + '</span> ล้านบาท';

        //Total Cost Display
        $("#totalcost").html(text);

        //Set Pager using tablesorter plugin
        var myHeaders = {};
        $("#hdm4table").find('th').each(function (i, e) {
            myHeaders[$(this).index()] = {
                sorter: false
            };
        });

        $('.pager .first').unbind();
        $('.pager .last').unbind();
        $('.pager .prev').unbind();
        $('.pager .next').unbind();

        $("#hdm4table")
            .tablesorter({
            headers: myHeaders
        })
            .tablesorterPager({
            container: $("#hdm4pager"),
            size: 20
        });
    }

    function updateDataTable() {
        var allrow = $('#table1 tbody tr');
        allrow.slice(0, startIndex).hide();
        allrow.slice(startIndex, endIndex + 1).show();
        allrow.slice(endIndex + 1).hide();
    }

    $('#hdm4table tbody tr td').live('click', function () {
        if ($(this).find('i').hasClass('icon-facetime-video')) {
            $("a.video_lightbox").click();
        }
        if (!$(this).parent().hasClass('table_highlight')) {
            var index = $(this).parent().parent().children().index($(this).parent());

            //Highlight table when click
            $('#hdm4table tbody tr.table_highlight').removeClass("table_highlight");
            $('#hdm4table tbody tr').eq(index).addClass('table_highlight');

            var tablerow = $(this).parent().find('td');
            var allyear = 0;
            if (g_hdm4_search['year'] == 'all') 
                allyear = 1;

            //Extract data from HDM4 table for video data
            var hdm4kmstart = parseFloat(tablerow.eq(1 + allyear).html().replace('+', '.'));
            var hdm4kmend = parseFloat(tablerow.eq(2 + allyear).html().replace('+', '.'));
            var dir = tablerow.eq(3 + allyear).html();
            var lane = tablerow.eq(4 + allyear).html();

            var year = g_hdm4_search['year'];
            var workdes = tablerow.eq(5 + allyear).html();
            var cost = tablerow.eq(6 + allyear).html();

            var hdm4current = {
                year: year,
                workdes: workdes,
                cost: cost
            };
            g_current_var['hdm4'] = hdm4current;
            $('#videoinfo #video_infotype').html(g_current_var['hdm4']['workdes']);
            if (g_hdm4_search['exptype'] == 1) {
                //Extract
                switch (dir) {
                    case "ขาเข้า":
                        dir = "R";
                        break;
                    case "ขาออก":
                        dir = "F";
                        break;
                }
                switch (lane) {
                    case "ซ้าย":
                        lane = "03";
                        break;
                    case "กลาง":
                        lane = "02";
                        break;
                    case "ขวา":
                        lane = "01";
                        break;
                }
                //Add case for enex and access (abb_exp = section)
                var abb_exp = g_hdm4_search['expressway'];
                if (abb_exp == "0102" || abb_exp == "0101") {
                    //find specialcase for that section
                    var spcase = 8;
                    if (spcase < hdm4kmstart) 
                        var section = '0102' + "%" + dir + lane; 
                    else 
                        var section = '0101' + "%" + dir + lane;
                } 
                else 
                    var section = abb_exp + "%" + dir + lane;
            } 
            else {
                var section;
                if (g_hdm4_search['exptype'] == 3) {
                    section = $('#toolbox select#accessname option').eq(g_hdm4_search['dropdownOrder']).val();
                } else {
                    section = $('#toolbox select.enexname:visible option').eq(g_hdm4_search['dropdownOrder']).val();
                }
            }
            //console.log(hdm4kmstart+"=="+hdm4kmend+"=="+section);
            hdm4Click(hdm4kmstart, hdm4kmend, section)
            zoomCoor();
        }
    });

    $('#search_hdm4_button').bind('click', hdm4Search);

    //HDM4 year dropdown
    $('#hdm4yeardropdown a').bind('click', function () {
        var y = $(this).html();
        if (y != 'ทุกปี') y = parseInt(y) - 543;
        else y = 'all';
        g_hdm4_search['year'] = y;
        //$('input:radio[name=hdm4year][value='+y+']').prop('checked',true);
        ajaxhdm4();
        return false;
    });

//=================== Map Resizing ==========================
    //MapResize
    $(window).resize(function () {
        mapResize();
    });

    function mapResize() {
        if ($('#container_map').hasClass('maximize')) {
            var windowWidth = $(window).width();
            var windowHeight = $(window).height();
            $('#container_map, #map').width(windowWidth - 40 + 'px');
            $('#container_map, #map').height(windowHeight - 40 + 'px');
            map.updateSize();
        }
    }

    //Maximize map
    $('#maximize-map-display').toggle(function () {
        if ($('#container_map').hasClass('mapclose')) $('#toggle-map-display').addClass('fromClose').click();
        $('#container_map, #maximize-map-display, #toggle-map-display, #video-map-display').addClass('maximize');
        $('#container_map').parent().css('height', '368px');
        $(this).children().removeClass('icon-resize-full').addClass('icon-resize-small')
        $(this).attr('title', 'ย่อแผนที่');
        mapResize();

        //clone
        $("#maptoolbox").show();
        $('#maptoolbox #mainLane option').prop('selected', '');
        $('#maptoolbox #mainLane option').eq($('#lane_selection #mainLane option:selected').index()).prop('selected', 'selected');

    }, function () {
        $("#maptoolbox").hide();
        $('#container_map, #maximize-map-display, #toggle-map-display, #video-map-display').removeClass('maximize');
        $('#container_map, #map').css('width', '');
        $('#container_map, #map').css('height', '');
        $(this).children().removeClass('icon-resize-small').addClass('icon-resize-full')
        $('#container_map').parent().css('height', '');
        $(this).attr('title', 'ขยายแผนที่');
        map.updateSize();

        if (g_all_result) {
            qtip.removeAllFeatures();
            addPoints(g_all_result);
        }

    });

    $('#container_map, #toggle-map-display, #maximize-map-display, #video-map-display').hover(function () {
        if ($('#toggle-map-display i').hasClass('icon-chevron-up')) $('#toggle-map-display').stop().animate({
            opacity: 0.8
        });
        $('#maximize-map-display').stop().animate({
            opacity: 0.8
        });
        $('#video-map-display').stop().animate({
            opacity: 0.8
        });
    }, function () {
        if ($('#toggle-map-display i').hasClass('icon-chevron-up')) $('#toggle-map-display').stop().animate({
            opacity: 0
        });
        $('#maximize-map-display').stop().animate({
            opacity: 0
        });
        $('#video-map-display').stop().animate({
            opacity: 0
        });
    });

    //Minimize map
    $('#toggle-map-display').toggle(function () {
        if ($('#container_map').hasClass('maximize')) $('#maximize-map-display').click();
        $('#container_map').addClass('mapclose');
        $('#container_map').stop().animate({
            height: 5,
            'margin-bottom': 35,
            'padding-bottom': 0
        }, 'fast');
        $('#map').stop().animate({
            top: -325
        }, 'fast');
        $('#toggle-map-display, #maximize-map-display, #video-map-display').css('bottom', '15px');
        $(this).attr('title', 'เปิดแผนที่');
        $(this).children().removeClass('icon-chevron-up').addClass('icon-chevron-down')
    }, function () {
        $('#container_map').removeClass('mapclose');
        if ($(this).hasClass('fromClose')) {
            $('#container_map').css('height', '').css('margin-bottom', '').css('padding-bottom', '');
            $('#map').css('top', '');
            $(this).removeClass('fromClose');
        } else {
            $('#container_map').stop().animate({
                height: 330,
                'margin-bottom': 20,
                'padding-bottom': 8
            }, 'fast');
            $('#map').animate({
                top: 8
            }, 'fast');
        }
        $(this).children().removeClass('icon-chevron-down').addClass('icon-chevron-up');
        $(this).attr('title', 'เก็บแผนที่');
        $('#toggle-map-display, #maximize-map-display, #video-map-display').css('bottom', '');
    });



//================== Toolbox Maptoolbox Sync ========================

    //Sync Select input
    function HTMLselectTagBinding(selector, selectedOne, except) {
        selector = $(selector);
        if (except) selector = $(selector).not(except);
        var index = selectedOne.find('option:selected').prop('selected', 'selected').index();
        selector.each(function () {
            $(this).find('option').eq(index).prop('selected', 'selected');
        });
    }

    function skipSearch1Setting(selector) {
        //  g_search_info['expressway'] = $('select[name=expressway]').val();
        g_search_info['exptype'] = $('select[name=exptype]').val();
        //  g_search_info['infotype'] 
        g_search_info_level2['currentsection'] = selector.val();
        g_search_info_level2['currentcode'] = selector.find('option:selected').html();
    }

        //To show TYPE[main, access, enex] **S1 does not have enex
    function showExpType(exp) {
        $('select[name=exptype] option').show();
        if (exp == "03") {
            $('select[name=exptype] option[value=2]').hide();
            $('select[name=exptype] option[value=1]').prop('selected', 'selected');
            $('#option1').show();
        }
    }

    //Show Dropdown of each type
    function showTypeDropdown(exp, exptype) {
        $('.enexname').not('#lane_selection .enexname').hide();
        $('.accessname').not('#lane_selection .accessname').hide();
        $('#maptoolbox .mainLane').hide();
        if (exptype == "2") {
            if (exp != "03") {
                //if(exp.indexOf("01") != -1)
                //  exp = "01";
                var elem = "enexname" + exp;
                //  console.log(elem);
                //  $('.'+elem+' option:first').prop('selected','selected');
                $('#' + elem).not('#lane_selection .enexname').show().find('option:first').prop('selected', 'selected');
                $('#maptoolbox .enexname').remove();
                //$("#"+elem).clone().removeClass('input-spanall').addClass('span3').appendTo('#maptoolbox #selectname').find('option').eq(index).prop('selected','selected');
                cloneToMap($("#" + elem), '#maptoolbox #selectname');
            }
            //Hide Limited_Half and Limited_Full of HDM4
            $('select#hdm4type option').not(':first').hide();
        } else if (exptype == "3") {
            $('#maptoolbox .accessname').remove();
            $('.accessname').not('#lane_selection .accessname').show().find('option:first').prop('selected', 'selected');
            //$('.accessname').clone().removeClass('input-spanall').addClass('span3').appendTo('#maptoolbox #selectname').find('option').eq(index).prop('selected','selected');
            cloneToMap($('#toolbox .accessname'), '#maptoolbox #selectname');
            //Hide Limited_Half and Limited_Full of HDM4
            $('select#hdm4type option').not(':first').hide();
        } else {
            $('#maptoolbox .mainLane').show();
            mainLane(exp);
            //Hide Limited_Half and Limited_Full of HDM4
            $('select#hdm4type option').not(':first').show();
        }

    }

    function cloneToMap(source, target, nl, multiple) {
        var index = source.find('option:selected').prop('selected', 'selected').index();
        source.clone().removeClass('input-spanall').addClass('span3').appendTo(target).find('option').eq(index).prop('selected', 'selected');
        if (nl) $(target).append('<br>');
        if (!multiple) $(target).find('select').prop('multiple', '');
    }

    //lane for main expressway
    function mainLane(exp) {
        $("select.mainLane:not('#lane_selection #mainLane')").html('').prop('multiple', 'multiple');
        if (exp == '0101' || exp == '0102' || exp == '0103') {
            for (var i = 1; i <= 6; i++) {
                var value = laneOrder(i);
                var text = laneFull(value);
                var code = sectionToCode(exp + '%' + value);
                var htmlcode = '<option title="' + code + '" value="' + exp + '100' + value + '">' + text + '</option>';
                $("select.mainLane:not('#lane_selection #mainLane')").append(htmlcode);
            }
        } else if (exp == '02') {
            for (var i = 1; i <= 6; i++) {
                var value = laneOrder(i);
                var text = laneFull(value);
                var code = sectionToCode(exp + '%' + value);
                var htmlcode = '<option title="' + code + '" value="' + exp + '%' + value + '">' + text + '</option>';
                $("select.mainLane:not('#lane_selection #mainLane')").append(htmlcode);
            }
        } else {
            for (var i = 1; i <= 6; i++) {
                var value = laneOrder(i);
                var text = laneFull(value);
                var code = sectionToCode(exp + '%' + value);
                var htmlcode = '<option title="' + code + '" value="' + exp + '01100' + value + '">' + text + '</option>';
                $("select.mainLane:not('#lane_selection #mainLane')").append(htmlcode);
            }
        }

    }

    //When First choose the expressway
    $('select[name=expressway]').one('change', function () {
        $('select[name=expressway]').each(function () {
            if ($(this).find('option').eq(0).html() == "เลือกสายทาง") $(this).find('option').eq(0).remove();
        });
    });

    //Clone Init
    cloneToMap($("#toolbox #expressway"), '#maptoolbox #expnametype', true);
    cloneToMap($("#exptype"), '#maptoolbox #expnametype', true);

    //Initial
    showTypeDropdown($('select[name=expressway]').val(), $("#exptype").val());
    showExpType($('select[name=expressway]').val());
    //$("#maptoolbox .mainLane").show();
    $("#maptoolbox #damage").append('<select id="" name="infotype" class="span3 infotype"><option value="skid">ค่าความฝืด - Skid</option><option selected value="roughness">ค่าความขรุขระ - IRI</option><option value="rutting">ค่าร่องล้อ - Rutting</option></select>');
    $("#maptoolbox").hide();

    //When change expressway clear kmrange
    $('select[name=expressway]').live('change', function () {
        $('#kmstart, #kmend').val('');
        HTMLselectTagBinding('select[name=expressway]', $(this));
        var expcode = $(this).val();
        showExpType(expcode);
        showTypeDropdown(expcode, $('select[name=exptype]').val());
    });

    //autofill KM for #maptoolbox
    $('#maptoolbox #expressway').live('change', function () {
        //$('input[name=searchtype][value=notoverlap]').prop('checked','checked');
        $("#fix_range").show();
        $('#kmstart').val(0);
        $('#kmend').val(2);
        search1();
    });

    //autofill KM for #maptoolbox
    $('#maptoolbox #exptype').live('change', function(){
        if($(this).val() == "1")
        {
            $('#kmstart').val(0);
            $('#kmend').val(2);
        }   
    });

    //Sync exenname
    $('select.enexname').live('change', function () {
        HTMLselectTagBinding('select[name=' + $(this).prop('id') + ']', $(this), '#lane_selection .enexname');

    });

    //Sync accessname
    $('select.accessname').live('change', function () {
        HTMLselectTagBinding('select[name=accessname]', $(this), '#lane_selection .accessname');
    });

    $('#maptoolbox .accessname, #lane_selection .accessname').live('change', function () {
        g_imageset = "";
        search1();
        zoomCoor();
    });

    $('#maptoolbox .enexname, #lane_selection .enexname').live('change', function () {
        g_imageset = "";
        search1();
    });

    $('#maptoolbox select[name=infotype]').live('change', function () {
        if ($("#main_content").is(":hidden")) {
            g_imageset = "";
            search1();
        } else {
            g_search_info['infotype'] = $(this).find('option:selected').html();
            ajaxSearch1();
        }
    });

    $('#lane_selection #mainLane').live('change', function () {
        var index = $(this).find('option:selected').prop('selected', 'selected').index();
        $('#maptoolbox #mainLane option').prop('selected', '');
        $('select[name=mainLane]').each(function () {
            $(this).find('option').eq(index).prop('selected', 'selected');
        });

        $("#fix_range").show();
        g_search_info_level2['currentsection'] = $(this).val();
        g_search_info_level2['currentcode'] = $(this).find('option[value="' + $(this).val() + '"]').prop('title');
        g_search_info['exptype'] = $('select[name=exptype]').val();
        g_imageset = "";
        if ($("#main_content").is(":hidden") || g_search_info['searchtype'] == 'overlap') 
            search1();
        else 
            ajaxSearch1();
    });

    $('select[name=infotype], input[name=infotype]').live('change', function () {
        var info = $(this).prop('value');
        $('input[name=infotype][value=' + info + ']').prop('checked', 'checked');
        $('select[name=infotype] option[value=' + info + ']').prop('selected', 'selected');
    });


    $('select[name=exptype]').live('change', function () {
        //$('#kmstart, #kmend').val('');
        var index = $(this).find('option:selected').prop('selected', 'selected').index();
        $('select[name=exptype]').each(function () {
            $(this).find('option').eq(index).prop('selected', 'selected');
        });

        if ($(this).val() == "1") {
            $("#option1").show();
            $("#option2").hide();
            $("#maptoolbox .mainLane").show();
            showTypeDropdown($('select[name=expressway]').val(), $(this).val());

            //Hide Limited_Half and Limited_Full of HDM4
            $('select#hdm4type option').not(':first').show();
        } else {
            $("#option2").show();
            $("#option1").hide();

            showTypeDropdown($('select[name=expressway]').val(), $(this).val());

            //Hide Limited_Half and Limited_Full of HDM4
            $('select#hdm4type option:first').prop('selected', 'selected');
            $('select#hdm4type option').not(':first').hide();

        }
    });

    $('#maptoolbox select[name=exptype]').live('change', function () {
        g_imageset = "";
        search1();
    });

    //Addpoint of lanes
    $('#maptoolbox select#mainLane').live('change', function () {
        qtip.removeAllFeatures();
        var suffix = [];
        $(this).find('option:selected').each(function () {
            var s = $(this).val().slice(-3);
            addPoints(g_all_result_all_lane[s]);
        });
    });

    $('#search').bind('click', function () {
        $("#maptoolbox #mainLane").find('option').eq(0).prop('selected', 'selected');
        search1();

        //skip missing image for CM1/CM2/CM3
        $("#mainLane [value='0103100F01']").hide();
        $("#mainLane [value='0103100F02']").hide();
        $("#mainLane [value='0103100F03']").hide();
        $("#mainLane [value='0102100F03']").hide();
        $("#mainLane [value='0102100F02']").hide();
        $("#mainLane [value='0102100F01']").hide();
        $("#mainLane [value='0101100R01']").hide();
        $("#mainLane [value='0101100R02']").hide();
        $("#mainLane [value='0101100R03']").hide();

        //skip missing data for (access) CM-CR
        $("#mainLane [value='0000412F01']").hide();

        //skip missing data for (access) CM-CR

        return false;
    });


//======================= KmFreq Function ===================================
    function disableFreq() {
        $('#kmfreq').html(g_search_info_level2.kmfreq);
        var index = _kmfreq.indexOf(parseFloat($('#kmfreq').html()));
        if (index <= _kmfreq.indexOf(_rangefix)) {
            $('#kmfreq').prev().addClass('disabled');
            $('#kmfreq').html(_rangefix);
            g_search_info_level2.kmfreq = _rangefix;
        } else $('#kmfreq').prev().removeClass('disabled');
        if (index == _kmfreq.length - 1) $('#kmfreq').next().addClass('disabled');
        else $('#kmfreq').next().removeClass('disabled');
    }

    var freq_prev = $('#kmfreq').prev();
    var freq_next = $('#kmfreq').next();

    freq_prev.bind('click', function () {
        if (!$(this).hasClass('disabled')) {
            var i = _kmfreq.indexOf(parseInt($('#kmfreq').html()));
            if (i - 1 >= 0) {
                $('#kmfreq').html(_kmfreq[i - 1]);
                g_search_info_level2.kmfreq = parseInt($('#kmfreq').html());
            }
            if (i - 1 == _kmfreq.indexOf(_rangefix)) $('#kmfreq').prev().addClass('disabled');
            $('#kmfreq').next().removeClass('disabled');
            calculatePlotData();
            return false;
        }
    });
    freq_next.bind('click', function () {
        if (!$(this).hasClass('disabled')) {
            var i = _kmfreq.indexOf(parseFloat($('#kmfreq').html()));
            if (i + 1 < _kmfreq.length) {
                $('#kmfreq').html(_kmfreq[i + 1]);
                g_search_info_level2.kmfreq = parseInt($('#kmfreq').html());
            }
            if (i + 1 == _kmfreq.length - 1) $(this).addClass('disabled');
            $('#kmfreq').prev().removeClass('disabled');
            calculatePlotData();
            return false;
        }
    });

});

//Global Function
function expcodeToExpressway(expcode) {
    var expstr;
    switch (expcode) {
        case "0101":
            expstr = "เฉลิมมหานคร ช่วงที่ 1 (ท่าเรือ-ดินแดง)";
            break;
        case "0102":
            expstr = "เฉลิมมหานคร ช่วงที่ 2 (ท่าเรือ-บางนา)";
            break;
        case "0103":
            expstr = "เฉลิมมหานคร ช่วงที่ 3 (ท่าเรือ-ดาวคะนอง)";
            break;
        case "02":
            expstr = "ฉลองรัช";
            break;
        case "03":
            expstr = "ทางด่วนขั้นที่ 3 สายใต้ S1";
            break;
        case "04":
            expstr = "กาญจนาภิเษก (บางพลี-สุขสวัสดิ์)";
            break;
        case "05":
            expstr = "บูรพาวิถี (บางนา - ตราด)";
            break;
    }
    return expstr;
}

function toFullName(code) {
    var fullname = "";
    switch(g_search_info['exptype']) {
	    case "1":
	        var eachcode = code.split("_");
	        var fullname = "ทางหลัก ";
	        if (eachcode[1] == "O") fullname += "ฝั่งขาออก";
	        else fullname += "ฝั่งขาเข้า";
	        switch (eachcode[2]) {
	            case "RL":
	                fullname += "ช่องจราจรขวา";
	                break;
	            case "ML":
	                fullname += "ช่องจราจรกลาง";
	                break;
	            case "LL":
	                fullname += "ช่องจราจรซ้าย";
	                break;
	        }
	    break;
	    case "2":
	        var enex_name = $(".enexname option:selected").html();
	        fullname = enex_name;
	    break;
	    case "3": 
	        var eachcode = code.split("_");
	        var fullname = "ทางเชื่อม ";
	        if (eachcode[1] == "O") 
	        	fullname += "ฝั่งขาออก";
	        else 
	        	fullname += "ฝั่งขาเข้า";
	    break;	    
	    default: 
	    	fullname = code;
	    break;
	}
    return fullname;
}

function sectionToCode(section) {
    var code = "";
    var exp = section.substr(0, section.indexOf('%'));
    var s = section.slice(-3);
    var inout = s.substr(0, s.indexOf('0'));
    var laneno = section.slice(-2);
    code += toExp(exp) + "_";

    if (inout == "F") code += "O_";
    else code += "I_";

    code += toLane(laneno);
    return code;

    function toLane(laneno) {
        switch (laneno) {
            case "01":
                return 'RL';
                break;
            case "02":
                return 'ML';
                break;
            case "03":
                return 'LL';
                break;
        }
    }

    function toExp(exp) {
        switch (exp) {
            case "0101":
                return "FESDE";
                break;
            case "0102":
                return "FESBN";
                break;
            case "0103":
                return "FESDN";
                break;
            case "02":
                return "RAE";
                break;
            case "02":
                return "RAE";
                break;
            case "03":
                return "S1";
                break;
            case "04":
                return "SOBRR";
                break;
            case "05":
                return "BBE";
                break;
        }
    }
}

function toKm(val) {
    return new String(new Number(val).toFixed(3)).replace('.', '+');
}

function getInfoType(infotype) {
    var column_info_name;
    if (infotype == 'roughness') column_info_name = 'iri_avg';
    else if (infotype == 'rutting') column_info_name = 'rut_lane';
    else if (infotype == 'skid') column_info_name = 'skid_avg';
    return column_info_name;
}

function getAbbInfoType(infotype) {
    var column_info_name;
    if (infotype == 'roughness') column_info_name = 'IRI';
    else if (infotype == 'rutting') column_info_name = 'Rutting';
    else if (infotype == 'skid') column_info_name = 'Skid';
    return column_info_name;
}

function videoPreloader() {
    $("#videopreloader div.bar").css('width', '');
    $("#videopreloader .percentage").html('');
    var imageloaded = 0;
    imageloaded = 0;
    var preload;
    clearInterval(preload);
    if ($("#videopreloader").is(":hidden")) $("#videopreloader").show();

    preload = setInterval(function () {
        if ($('#videoplayer').data("loadStatus") == "loading") {
            if ($('div.jsMovieFrame').eq(imageloaded).css('background-image') != "none") {
                imageloaded++;
                var allimage = g_video['length'];
                var width = (imageloaded * $("#videopreloader").width()) / allimage;
                var percentage = (imageloaded / allimage * 100).toFixed(0) + "%";
                $("#videopreloader div.bar").css('width', width + 'px');
                $("#videopreloader .percentage").html(percentage);

            }
        } else {
            $('#videoplayer').data("loadStatus", 'loaded');
            clearInterval(preload);
            $("#videopreloader .percentage").html('100%');
            $("#videopreloader div.bar").css('width', $("#videopreloader").width() + 'px');
            setTimeout(function () {
                $("#videopreloader").fadeOut();

            }, 200);
        }
    }, 10);
}

function errorReport(errmsg) {
    var noreport = $('div.errorreport').length;
    //	console.log(errmsg);
    //errmsg = errmsg.replace("\n","\r\n");
    var htmlcode = '<div class="errorreport alert alert-error alert-block"><button type="button" class="close" data-dismiss="alert">×</button><strong>' + 'Error! ' + '</strong>' + errmsg + '</div>';
    $('.container').prepend(htmlcode);
    //$('div.errorreport').css('top',$('body').scrollTop()-100);
    $('div.errorreport:first').css('z-index', 3000 + noreport);
}

function toExpressName(section) {
    var str1 = section.substr(0, 4);
    var str = section.substr(0, 2);
    if (str1 == "0101") return "เฉลิมมหานคร ช่วงที่ 1 (ท่าเรือ-ดินแดง)";
    else if (str1 == "0102") return "เฉลิมมหานคร ช่วงที่ 2 (ท่าเรือ-บางนา)";
    else if (str1 == "0103") return "เฉลิมมหานคร ช่วงที่ 3 (ท่าเรือ-ดาวคะนอง)";
    else if (str == "02") return "ฉลองรัช";
    else if (str == "03") return "ทางด่วนขั้นที่ 3 สายใต้ S1";
    else if (str == "04") return "กาญจนาภิเษก (บางพลี-สุขสวัสดิ์)";
    else if (str == "05") return "บูรพาวิถี (บางนา-ตราด)";
    else if (str1 == "0000") {
       return $("[name='accessname'] option[value='" + section + "']").html();
    }

}

function laneOrder(order) {
    var lane;
    switch (order) {
        case 1:
            lane = 'F01';
            break;
        case 2:
            lane = 'F02';
            break;
        case 3:
            lane = 'F03';
            break;
        case 4:
            lane = 'R01';
            break;
        case 5:
            lane = 'R02';
            break;
        case 6:
            lane = 'R03';
            break;
    }
    return lane;
}

function laneFull(lane) {
    var name;
    switch (lane) {
        case "F01":
            name = "ขาออก ช่องจราจรขวา";
            break;
        case "F02":
            name = "ขาออก ช่องจราจรกลาง";
            break;
        case "F03":
            name = "ขาออก ช่องจราจรซ้าย";
            break;
        case "R01":
            name = "ขาเข้า ช่องจราจรขวา";
            break;
        case "R02":
            name = "ขาเข้า ช่องจราจรกลาง";
            break;
        case "R03":
            name = "ขาเข้า ช่องจราจรซ้าย";
            break;
    }
    return name;
}

function drawGraph() {
    var info = $('input[name="infotype"][id="' + g_search_info.infotype + '"]').val();
    //Threshold:: Color: Green ,Yellow, Red
    switch (info) {
        case "roughness":
            var threshold1 = 2.68;
            var threshold2 = 3.5;
            var color1 = "#00bb00";
            var color2 = "#FFCC00";
            var color3 = "#DC0000";
            break;
        case "rutting":
            var threshold1 = 100;
            var threshold2 = 100;
            var color1 = "#00bb00";
            var color2 = "#FFCC00";
            var color3 = "#DC0000";
            break;
        case "skid":
            var threshold1 = 0.3;
            var threshold2 = "";
            var color1 = "#00bb00";
            var color2 = "#FFCC00";
            var color3 = "#DC0000";
            break;
    }
    //Vertical  Line Setting
    var vertical_line = [
        [-1, - 1],
        [-1, 999]
    ];

    if (selectedIndex >= 0) vertical_line = [
        [g_linedata[selectedIndex][0], - 1],
        [g_linedata[selectedIndex][0], 999]
    ];
    //Cutting infotype string Ex From **** - Skid to only Skid
    var typecut = g_search_info.infotype.substr(g_search_info.infotype.indexOf("-") + 2);
    //Plot Graph
    if (info == "roughness") {
        plot = $.plot($("#line-chart"), [{
            data: g_linedata,
            color: color2,
            threshold: {
                above: {
                    limit: threshold2,
                    color: color3
                }
            }
        }, {
            data: vertical_line,
            color: '#1B9BE0'
        }, {
            data: g_linedata,
            color: color2,
            threshold: {
                below: {
                    limit: threshold1,
                    color: color1
                }
            }
        }, {
            label: typecut + " > " + threshold2,
            data: [
                [-1, - 1],
                [-1, - 1]
            ],
            color: color3
        }, {
            label: threshold1 + " >= " + typecut + " <= " + threshold2,
            data: [
                [-1, - 1],
                [-1, - 1]
            ],
            color: color2
        }, {
            label: typecut + " < " + threshold1,
            data: [
                [-1, - 1],
                [-1, - 1]
            ],
            color: color1
        }, {
            data: g_linedata,
            color: color2,
            lines: {
                show: false
            },
            points: {
                show: true
            },
            threshold: {
                below: {
                    limit: 2.5,
                    color: color1
                },
                above: {
                    limit: 3.5,
                    color: color3
                }
            }
        }], g_options);
    } else if (info == "skid") //one threshold
    {
        plot = $.plot($("#line-chart"), [
        //{ data:g_linedata, color:color2, threshold: {above: {limit: threshold2, color:color3} }},

        {
            data: g_linedata,
            points: {
                show: true
            },
            color: color1,
            threshold: {
                below: {
                    limit: threshold1,
                    color: color3
                }
            }
        }, {
            data: vertical_line,
            color: '#1B9BE0'
        }, {
            data: [
                [-1, - 1],
                [-1, - 1]
            ],
            color: color2
        }, {
            label: typecut + " > " + threshold1,
            data: [
                [-1, - 1],
                [-1, - 1]
            ],
            color: color1
        },
        //  { label: threshold1+" >= "+typecut+" <= "+threshold2, data: [[-1,-1],[-1,-1]], color:color2 },
        {
            label: typecut + " < " + threshold1,
            data: [
                [-1, - 1],
                [-1, - 1]
            ],
            color: color3
        },
        //{ data:g_linedata, color:color2, lines:{show:false}, points:{show:true}, threshold: {below: {limit: 2.5, color:color1}, above: {limit: 3.5, color:color3}  }}
        ], g_options);
    } else //no threshold
    {
        plot = $.plot($("#line-chart"), [{
            data: g_linedata,
            color: color1,
            points: {
                show: true
            }
        }, {
            data: vertical_line,
            color: '#1B9BE0'
        }, {
            data: [
                [-1, - 1],
                [-1, - 1]
            ],
            color: color2
        }, {
            label: typecut,
            data: [
                [-1, - 1],
                [-1, - 1]
            ],
            color: color1
        }], g_options);
    }
    $('canvas.base').attr('id', 'chartCanvas');
    $('canvas.overlay').attr('id', 'chartCanvasOverlay');
}

function showLoading() {
    $('#loading').show();
    //$('#loading').css('top',$('body').scrollTop()-100);

}

function hideLoading() {
    $('#loading').hide();
}

function showHDM4() {
    if ($('#hdm4result').is(':hidden')) $('#hdm4result').show();
    $('#damagesearch').hide();
}

function showDamage() {
    $('#hdm4result').hide();
    if ($('#damagesearch').is(':hidden')) $('#damagesearch').show();
}


function updateVertical(index) {
    selectedIndex = index;
    //console.log(selectedIndex);
    var y = plot.getData()[1].datapoints.points;
    y[0] = y[2] = g_linedata[index][0];
    plot.draw();
}

