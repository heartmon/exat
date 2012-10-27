$(function () {
    $("#search_hdm4_button").click(function () {
        qtip.removeAllFeatures();
    });
});

var qtip;
var map;
var selectController;

var init = function () {
// Get rid of address bar on iphone/ipod
var fixSize = function() {
    window.scrollTo(0,0);
    document.body.style.height = '100%';
    if (!(/(iphone|ipod)/.test(navigator.userAgent.toLowerCase()))) {
        if (document.body.parentNode) {
            document.body.parentNode.style.height = '100%';
        }
    }
};
setTimeout(fixSize, 700);
setTimeout(fixSize, 1500);

var lon = 100.53143;
var lat = 13.741;
var zoom = 10;
var pureCoverage = false;
var format = 'image/png';
var options = {
    projection: new OpenLayers.Projection("EPSG:900913"),
    displayProjection: new OpenLayers.Projection("EPSG:4326"),
    units: "m",
    maxResolution: 156543.0339,
    maxExtent: new OpenLayers.Bounds(-20037508.34, - 20037508.34,
    20037508.34, 20037508.34),
    numZoomLevels: 20,
    controls: [
        new OpenLayers.Control.Navigation(),
        new OpenLayers.Control.KeyboardDefaults(),
        new OpenLayers.Control.Attribution(),
        new OpenLayers.Control.TouchNavigation({
                dragPanOptions: {
                    enableKinetic: true
                }
            }),
        new OpenLayers.Control.Zoom()
        //new OpenLayers.Control.MousePosition()
    ],
    center: new OpenLayers.LonLat(lon,lat),
    zoom:zoom
};

map = new OpenLayers.Map('map', options);

var centerline = new OpenLayers.Layer.Vector("Centerline EXAT", {
    //Set your projection and strategies//
    projection: new OpenLayers.Projection("EPSG:4326"),
    strategies: [new OpenLayers.Strategy.Fixed()],
    //set the protocol with a url//
    protocol: new OpenLayers.Protocol.HTTP({
        //set the url to your variable//
        url: "kml/centerline-all.kml",
        //format this layer as KML//
        format: new OpenLayers.Format.KML({
            //maxDepth is how deep it will follow network links//
            maxDepth: 1,
            //extract styles from the KML Layer//
            extractStyles: true,
            //extract attributes from the KML Layer//
            extractAttributes: true
        })
    })
}, {

    buffer: 1,
    visibility: false,

    displayOutsideMaxExtent: true,

    isBaseLayer: false

});

var chainage = new OpenLayers.Layer.Vector("Chainage", {
    //Set your projection and strategies//
    projection: new OpenLayers.Projection("EPSG:4326"),
    strategies: [new OpenLayers.Strategy.Fixed()],
    //set the protocol with a url//
    protocol: new OpenLayers.Protocol.HTTP({
        //set the url to your variable//
        url: "kml/chainage.kml",
        //format this layer as KML//
        format: new OpenLayers.Format.KML({
            //maxDepth is how deep it will follow network links//
            maxDepth: 1,
            //extract styles from the KML Layer//
            extractStyles: true,
            //extract attributes from the KML Layer//
            extractAttributes: true
        })
    })
}, {

    buffer: 1,
    visibility: false,

    displayOutsideMaxExtent: true,

    isBaseLayer: false

});


var trafficsign = new OpenLayers.Layer.Vector("Traffic Sign", {
    //Set your projection and strategies//
    projection: new OpenLayers.Projection("EPSG:4326"),
    strategies: [new OpenLayers.Strategy.Fixed()],
    //set the protocol with a url//
    protocol: new OpenLayers.Protocol.HTTP({
        //set the url to your variable//
        url: "kml/trafficsign.kml",
        //format this layer as KML//
        format: new OpenLayers.Format.KML({
            //maxDepth is how deep it will follow network links//
            maxDepth: 1,
            //extract styles from the KML Layer//
            extractStyles: true,
            //extract attributes from the KML Layer//
            extractAttributes: true
        })
    })
}, {

    buffer: 1,
    visibility: false,

    displayOutsideMaxExtent: true,

    isBaseLayer: false

});

var esri = new OpenLayers.Layer.Vector("Traffic Sign", {
    //Set your projection and strategies//
    projection: new OpenLayers.Projection("EPSG:4326"),
    strategies: [new OpenLayers.Strategy.Fixed()],
    //set the protocol with a url//
    protocol: new OpenLayers.Protocol.HTTP({
        //set the url to your variable//
        url: "kml/trafficsign.kml",
        //format this layer as KML//
        format: new OpenLayers.Format.KML({
            //maxDepth is how deep it will follow network links//
            maxDepth: 1,
            //extract styles from the KML Layer//
            extractStyles: true,
            //extract attributes from the KML Layer//
            extractAttributes: true
        })
    })
}, {

    buffer: 1,
    visibility: false,

    displayOutsideMaxExtent: true,

    isBaseLayer: false

});

var feature;
var colors = ["#00bb00", "#ffcc00", "#dc0000", "#0000ff", "#252525"];
var context = {
    getColor: function (feature) {
        var c_var = feature.attributes['var'];
        var hdm4_cond = c_var.substr(0, 4);
        var c_cond = $("[name='infotype']:checked").val();
        var sec = feature.attributes['section'];
        //console.log(sec + " " + hdm4_cond);
        if (hdm4_cond == "RM00") {
            region = 0;
        } else if (hdm4_cond == "SS02") {
            region = 1;
        } else if (hdm4_cond == "RP05") {
            region = 2;
        } else if (hdm4_cond == "RP04") {
            region = 3;
        } else if (hdm4_cond == "RP08") {
            region = 4;
        }
        if (c_cond == "roughness") {
            if (c_var < 2.68) {
                var region = 0;
            } else if (c_var >= 2.68 && c_var < 3.5) {
                var region = 1;
            } else if (c_var >= 3.5) {
                var region = 2;
            }
        } else if (c_cond == "rutting") {
            var region = 0;
        } else if (c_cond == "skid") {
            //var region = 0;

            if (c_var > 0.3) {
                var region = 0;
            } else if (c_var <= 0.3) {
                var region = 2;
            }

        }
        return colors[region];
    },
    getSize: function (feature) {
        return 6;
    }
};

var context_hdm4 = {
    getColor: function (feature) {
        var c_var = feature.attributes['var'];
        var sec = feature.attributes['section'];
        //console.log(c_var);
        var cond = c_var.substr(0, 4);
        if (sec.substr(0, 2) != "01") {
            if (cond == "RM00") {
                region = 0;
            } else if (cond == "SS02") {
                region = 1;
            } else if (cond == "RP05") {
                region = 2;
            }
        } else {
            if (cond == "RP04") {
                region = 3;
            } else if (cond == "RP08") {
                region = 4;
            }
        }
        return colors[region];
    },
    getSize: function (feature) {
        return 3;
    }
};

var template = {
    pointRadius: "${getSize}", // using context.getSize(feature)
    fillColor: "${getColor}", // using context.getColor(feature)
    fillOpacity: 0.5,
    stroke: true,
    strokeColor: "${getColor}",
    strokeWidth: 1,
};
var style_hdm4 = new OpenLayers.Style(template, {
    context: context_hdm4
});

var style = new OpenLayers.Style(template, {
    context: context
});

var defStyle = {
    strokeColor: "blue",
    strokeOpacity: "0.7",
    strokeWidth: 3,
    cursor: "pointer"
};
var sty = OpenLayers.Util.applyDefaults(defStyle, OpenLayers.Feature.Vector.style["default"]);
var sm = new OpenLayers.StyleMap({
    'default': style,
    'select': {
        strokeColor: "blue",
        strokeWidth: 2,
        cursor: "pointer",
        fillColor: "blue",
        fillOpacity: 0.3
    }
});

qtip = new OpenLayers.Layer.Vector('IRI - Rutting - Skid', {
    //styleMap: new OpenLayers.StyleMap(style)
    styleMap: sm
});


selectController = new OpenLayers.Control.SelectFeature([qtip], {
    clickout: true,
    toggle: false,
    multiple: false,
    hover: false,
    highlightOnly: true,
    toggleKey: "ctrlKey", // ctrl key removes from selection
    multipleKey: "shiftKey", // shift key adds to selection
    eventListeners: {
        beforefeaturehighlighted: showQtip,
        featurehighlighted: showQtip,
        featureunhighlighted: hl,
        //featureselected: hl,
        //featureunselected: showStatus
    }
});

var hl = function (e) {
    //console.log("hl:" + e.feature.id);
};

map.addLayers([qtip]);
map.addControl(selectController);
selectController.activate();

var longdo = new OpenLayers.Layer.TMS("Longdo Map", "http://ms.longdo.com/mmmap/tile.php", {
    layername: 'gray',
    type: 'png',
    'getURL': get_longdo_url,
    proj: 'epsg3857',
    sphericalMercator: true
});

var gmap = new OpenLayers.Layer.Google("Google Streets", {}
// default type, no change needed here
);

var gphy = new OpenLayers.Layer.Google("Google Physical", {
    numZoomLevels: 15,
    type: google.maps.MapTypeId.TERRAIN
}
// used to be {type: G_PHYSICAL_MAP}
);

var ghyb = new OpenLayers.Layer.Google("Google Hybrid", {
    type: google.maps.MapTypeId.HYBRID,
}
// used to be {type: G_HYBRID_MAP, numZoomLevels: 20}
);
var gsat = new OpenLayers.Layer.Google("Google Satellite", {
    type: google.maps.MapTypeId.SATELLITE,
}
// used to be {type: G_SATELLITE_MAP, numZoomLevels: 22}
);
var mapnik = new OpenLayers.Layer.OSM();

map.addLayers([
gsat, gmap, gphy, ghyb, longdo, centerline
//,chainage
//,trafficsign
]);

map.addControl(new OpenLayers.Control.LayerSwitcher());

map.setCenter(new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject()), zoom);

map.zoomToMaxExtent();    

}

function get_longdo_url(bounds) {

    // example http://ms.longdo.com/mmmap/tile.php?zoom=8&x=199&y=117&mode=icons&key=demokeyfortestingonly&proj=epsg3857

    var res = this.map.getResolution();

    var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));

    var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));

    var z = this.map.getZoom();



    var zoom = z;

    if (this.proj && this.proj == "epsg4326") zoom += 1;

    var path = "?zoom=" + zoom + "&x=" + x + "&y=" + y + "&mode=" + this.layername + "&key=demokeyfortestingonly";

    if (this.proj) path += '&proj=' + this.proj;



    var url = this.url;

    if (url instanceof Array) {

        url = this.selectUrl(path, url);

    }

    return url + path;

}

function zoomMap(s) {

    if (s != null) {

        var re = /^POLYGON\(\(/;

        var minLon = 100000,
            maxLon = -100000,
            minLat = 100000,
            maxLat = -100000;

        if (s.match(re)) {

            var t = s.substr(9, s.length - 11);

            var arr1 = t.split(',');

            for (var i = 0; i < arr1.length; i++) {

                var u = arr1[i];

                var arr2 = u.split(' ');


                var lon = parseFloat(arr2[0]);

                var lat = parseFloat(arr2[1]);

                if (minLon > lon)

                minLon = lon;

                if (maxLon < lon)

                maxLon = lon;

                if (minLat > lat)

                minLat = lat;

                if (maxLat < lat)

                maxLat = lat;

            }

            b = new OpenLayers.Bounds(minLon, minLat, maxLon, maxLat);

            b.transform(new OpenLayers.Projection("EPSG:4326"), this.map.getProjectionObject());

            this.map.zoomToExtent(b);

        }

    }

}

function addPoints(all_result) {
    $.each(all_result, function (index, value) {
        var cost;
        var workdes;
        var year;

        /*
        console.log(value['hdm4result']);
        
        if(typeof value['hdm4result'] === "undefined") {
            value['hdm4result'] = last
        } 
        */
        $.each(value['hdm4result'], function (k, v) {
            cost = v.cost;
            workdes = v.workdes;
            year = v.year;
        });

        //last = value['hdm4result'];
        var feature = poi(index, value['lat'], value['long'], value['subdistance'], value['iri_avg'], value['rut_lane'], value['skid_avg'], value['code'], value['section'], cost, workdes, year);
        qtip.addFeatures(feature);
        if (index == Math.ceil((all_result['maxdis'] * 1000 - all_result['mindis'] * 1000) / 5)) return false;

    });
}

function showQtip(olEvent) {
    var elem = document.getElementById(olEvent.feature.geometry.id);
    var data = olEvent.feature.data;
    var ol = olEvent;
    var c_var = "";
    var qcolor = "green";
    var km_at = "KM: " + data['km_at'];
    var c_cond = $("[name='infotype']:checked").val();
    var year = parseInt(data['year']) + 543;
    if (g_hdm4search_click) {
        c_var = "แผนการซ่อม: " + data['workdes'] + "<br/>" + "งบประมาณ: " + data['cost'] + " ลบ. (ปี " + year + ")<br/>" + "IRI: " + data['iri'] + "<br/>" + "Rutting: " + data['rutting'] + "<br/>" + "Skid: " + data['skid'] + "<br/>";

    } else if (c_cond == "roughness") {
        c_var = "IRI: " + data['var'];
        if (data['var'] < 2.68) {
            qcolor = "green";
        } else if (data['var'] >= 2.68 && data['var'] < 3.5) {
            qcolor = "plain";
        } else if (data['var'] >= 3.5) {
            qcolor = "red";
        }
    } else if (c_cond == "rutting") {
        c_var = "Rutting: " + data['var'];
    } else if (c_cond == "skid") {
        c_var = "Skid: " + data['var'];
        if (data['var'] < 0.3) {
            qcolor = "red";
        } else if (data['var'] >= 0.3) {
            qcolor = "green";
        }
    }
    $(elem).qtip({
        overwrite: true,
        content: {
            title: {
                text: "<span class='etitle'>" + data['ename'] + "</span>" + "<br/>" + "<span class='edesc'>[" + data['code'] + "]</span>"
            },
            text: c_var + "<br />" + km_at + "<br />" + "Lat: " + data['latitude'] + "<br />" + "Long: " + data['longitude'],
            button: 'Close'
        },
        style: {
            classes: 'ui-tooltip-' + qcolor + ' ui-tooltip-shadow myqtip'
        },
        position: {
            adjust: {
                x: 0,
                y: -15
            },
            my: 'bottom center', // Position my top left...
            at: 'bottom center' // at the bottom right of...
        },
        show: {
            ready: true,
        },
        hide: {
            event: 'unfocus',
            target: $(this)
        },
        events: {
            show: function () {
                $(document).one("click", function () {
                    $(".qtip").qtip('hide');
                });
            }
        }
    });
    //.qtip('show');
    map.layers[0].redraw();
}

function poi(item, lat, long, km_at, iri, rutting, skid, code, section, cost, workdes, year) {
    var fpoint = new OpenLayers.Geometry.Point(long, lat).transform(
    new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
    var c_cond = $("[name='infotype']:checked").val();
    var view_hdm4_cond;
    if (g_hdm4_search['year'] == 'all') {
        view_hdm4_cond = $(".table_highlight td").eq(6).html();
    } else {
        view_hdm4_cond = $(".table_highlight td").eq(5).html();
    }

    if (g_hdm4search_click) {
        var attributes = {
            'name': item,
            'km_at': km_at,
            'longitude': long,
            'latitude': lat,
            'var': view_hdm4_cond,
            'iri': iri,
            'rutting': rutting,
            'skid': skid,
            'code': toFullName(code),
            'ename': toExpressName(section),
            'section': section,
            'cost': cost,
            'workdes': workdes,
            'year': year
        };
    } else if (c_cond == "roughness") {
        var attributes = {
            'name': item,
            'km_at': km_at,
            'longitude': long,
            'latitude': lat,
            'var': iri,
            'code': toFullName(code),
            'ename': toExpressName(section),
            'section': section,
            'cost': cost,
            'workdes': workdes,
            'year': year
        };
    } else if (c_cond == "rutting") {
        var attributes = {
            'name': item,
            'km_at': km_at,
            'longitude': long,
            'latitude': lat,
            'var': rutting,
            'code': toFullName(code),
            'ename': toExpressName(section),
            'section': section,
            'cost': cost,
            'workdes': workdes,
            'year': year
        };
    } else if (c_cond == "skid") {
        //console.log("skid!: a " + skid);
        var attributes = {
            'name': item,
            'km_at': km_at,
            'longitude': long,
            'latitude': lat,
            'var': skid,
            'code': toFullName(code),
            'ename': toExpressName(section),
            'section': section,
            'cost': cost,
            'workdes': workdes,
            'year': year
        };
    } else {
        var attributes = {
            'name': item,
            'km_at': km_at,
            'longitude': long,
            'latitude': lat,
            'iri': iri,
            'rutting': rutting,
            'skid': skid,
            'code': toFullName(code),
            'var': '',
            'ename': toExpressName(section),
            'section': section,
            'cost': cost,
            'workdes': workdes,
            'year': year
        };
    }
    var feature = new OpenLayers.Feature.Vector(fpoint, attributes);
    feature.id = "POI_" + item;
    return feature;
};

function zoomCoor() {
    var section;
    var infotype = $('#exptype option:selected').val();
    if (infotype == '2') {
        section = $(".enexname option:selected").val();
    } else if (infotype == 3) {
        section = $(".accessname option:selected").val();
    } else {
        section = g_search_info_level2['currentsection'];
    }

    $.ajax({
        url: 'ajax/_geo.php',
        type: 'GET',
        data: {
            expressway: g_search_info.expressway, //only value number of expressway are sent.
            kmstart: g_search_info.kmstart,
            kmend: g_search_info.kmend,
            infotype: $('input[name="infotype"][id="' + g_search_info.infotype + '"]').val(),
            exptype: g_search_info['exptype'],
            searchtype: g_search_info['searchtype'],
            section: section
        },
        dataType: 'jsonp',
        dataCharset: 'jsonp',
        success: function (data) {
            zoomMap(data[0].geo);
        }
    });
}

function getFeatureIndexById(featureId) {
    var objFs = qtip.features;
    var idx;
    for (var i = 0; i < objFs.length; ++i) {
        if (objFs[i].id == featureId) {
            idx = i;
            break;
        }
    }
    return idx;
}

function selectMapPoint(index) {
    selectController.unselectAll();
    selectController.select(map.layers[0].features[index]);
}