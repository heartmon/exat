   $(function () {

    $("#hdm4excel").bind('click', function () {
        var expressway;
        if (g_hdm4_search['exptype'] != 2) expressway = $('#yearbudget .expressway').html();
        else expressway = $('select[name=expressway] option[value=' + g_search_info['expressway'] + ']').html() + ' / ' + $('#yearbudget .expressway').html();

        var head = expressway + ";;" + $("#yearbudget .hdm4year").html() + ";;" + $("#yearbudget .hdm4type").html() + ";;" + $("#totalcost").html();
        $("#genexcel input[name=head]").val(head);
        $("#genexcel input[name=exceldata]").val(g_hdm4_data_result.join(";;"));
        $("#genexcel").submit();
        return false;
    });

    $("#exportPDF").bind('click', exportPDF);
    $("#hdm4pdf").bind('click', exportPDFhdm4);
    });
   function exportPDFhdm4() {
        //Prepare data
        var year = $("#yearbudget .hdm4year").html();
        var expressway;
        if (g_hdm4_search['exptype'] != 2) expressway = $('#yearbudget .expressway').html();
        else expressway = $('select[name=expressway] option[value=' + g_search_info['expressway'] + ']').html() + ' / ' + $('#yearbudget .expressway').html();
        var hdm4type = $("#yearbudget .hdm4type").html();
        var totalcost = $("#totalcost").html();
        //Retrieve data from table
        showLoading();
        $.ajax({
            url: 'ajax/_export_pdf.php',
            type: 'POST',
            data: {
                expressway: expressway,
                year: year,
                hdm4type: hdm4type,
                hdm4data: g_hdm4_data_result,
                totalcost: totalcost
            },
            success: function (data) {
                if (!data['error']) {
                    //alert('pdf saved');
                    $("#genpdf").submit();
                } else {
                    alert('Search not found');
                }
                hideLoading();
            }
        });
        return false;
    }

    function exportPDF() {
        //Prepare data
        var expressway = $("#search-input .expressway").html();
        var infotype = g_search_info['infotype'];
        var currentsection = g_search_info_level2['currentsection'];
        var currentcode = g_search_info_level2['currentcode'];
        var fullName = toFullName(currentcode);
        var kmrange = $("#search-input .rangekm").html();
        var kmfreq = g_search_info_level2['kmfreq'];

        try {
            var currentImage = g_imageset[selectedIndex * g_search_info_level2.kmfreq / 5]['filename'];
            var currentkm = $("#table1 tr").eq(selectedIndex).find('td').eq(0).html();
            var currentlat = g_all_result[(selectedIndex) * g_all_result['offset']]['lat'];
            var currentlong = g_all_result[(selectedIndex) * g_all_result['offset']]['long'];
        } catch (err) {
    
        }

        var yaxis = [];
        var ygridpx = "";
        $("div.yAxis .tickLabel").each(function (index) {
            yaxis.push($(this).html());
            if (!ygridpx) {
                var s1 = $("div.yAxis .tickLabel").eq(index).css('top');
                var a1 = s1.substr(0, s1.indexOf("px"));
                var s2 = $("div.yAxis .tickLabel").eq(index + 1).css('top');
                var a2 = s2.substr(0, s2.indexOf("px"));
                a1 = parseFloat(a1.replace("+", "."));
                a2 = parseFloat(a2.replace("+", "."));
                ygridpx = Math.abs(a2 - a1);
            }
        });

        var xaxis = [];
        var xgridpx = "";
        $("div.xAxis .tickLabel").each(function (index) {
            xaxis.push($(this).html());
            if (!xgridpx) {
                xgridpx = [];
                var s1 = $("div.xAxis .tickLabel").eq(index).css('left');
                var a1 = s1.substr(0, s1.indexOf("px"));
                var s2 = $("div.xAxis .tickLabel").eq(index + 1).css('left');
                var a2 = s2.substr(0, s2.indexOf("px"));
                a1 = parseFloat(a1.replace("+", "."));
                a2 = parseFloat(a2.replace("+", "."));
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
        for (var i = startIndex; i <= endIndex; i++) {
            var temp = [];
            $("#table1 tbody tr").eq(i).find('td').each(function (index) {
                temp.push($(this).html());
            });
            tabledata.push(temp);
        }

        var data_inrange = tabledata;
        showLoading();
        $.ajax({
            url: 'ajax/_export_pdf.php',
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
                xgridpx: xgridpx,
                currentImage: currentImage,
                currentlong: currentlong,
                currentlat: currentlat,
                currentkm: currentkm
            },
            success: function (data) {
                console.log(data);
                if (!data['error']) {
                    $("#genpdf").submit();
                    if (tempindex >= 0) updateVertical(tempindex);
                } else {
                    errorReport('ไม่สามารถสร้าง pdf ได้');
                }
                hideLoading();
            }
        });
        return false;
    }