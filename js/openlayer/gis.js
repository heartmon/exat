        var lon = 100.53143;
		var lat = 13.75156;
		var zoom = 10;
		var map, layer, trafficlayer;
		var pureCoverage = false; 
		var options = {
		
    	projection: new OpenLayers.Projection("EPSG:900913"),

    	displayProjection: new OpenLayers.Projection("EPSG:4326"),

	    units: "m",

	    numZoomLevels: 20,

    	maxResolution: 156543.0339,

    	maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34)
		}; 

		format = 'image/png';  
		
                  
		map = new OpenLayers.Map( 'map', options);

		var gmap = new OpenLayers.Layer.Google(
  		  "Google Streets"//, // the default
    		//{numZoomLevels: 20}
    		// default type, no change needed here
		);
    
	
    	var gphy = new OpenLayers.Layer.Google(
  		  "Google Physical",
    		{type: google.maps.MapTypeId.TERRAIN}
    		// used to be {type: G_PHYSICAL_MAP}
		);
		var mapnik = new OpenLayers.Layer.OSM();

		var longdo = new OpenLayers.Layer.TMS("Longdo Map", "http://ms.longdo.com/mmmap/tile.php", {
        layername: 'gray', 
        type :'png', 
        'getURL' : get_longdo_url, 
        proj : 'epsg3857', 
        sphericalMercator : true
 	   }); 
        
        var centerline = new OpenLayers.Layer.Vector("KML Centerline Layer", {
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
            },
            {

            buffer: 1,  
            visibility: false,

            displayOutsideMaxExtent: true,

            isBaseLayer: false

        }
            );
        
        var iri = new OpenLayers.Layer.WMS(

        //"IRI", "http://kpi.siit.tu.ac.th:80/geoserver/wms",
        "IRI", "http://kpi.siit.tu.ac.th:80/geoserver/gwc/service/wms",

        {

            LAYERS: 'exat:new_roughness',

            STYLES: '',

            format: format,

            tiled: !pureCoverage,

            tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom,

            transparent: true

        },

        {

            buffer: 1,  
            visibility: false,

            displayOutsideMaxExtent: true,

            isBaseLayer: false

        });
        
      

             
       /* var geoJsonUrl = "http://localhost:8080/geoserver/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=Farmers_Markets&srsName=EPSG:2274&outputFormat=json&format_options=callback:loadGeoJson"; 
        $.ajax({ 
            url: geoJsonUrl, 
            dataType: 'jsonp' 
        });   */

      /*  var wfs = new OpenLayers.Layer.Vector("Fields_WFS", {
                strategies : [new OpenLayers.Strategy.Fixed()],
                protocol : new OpenLayers.Protocol.WFS({
                version : "1.1.0",
                url : "http://kpi.siit.tu.ac.th:80/geoserver/wfs",
                featurePrefix : "doh",
                featureType : "new_shelter",
                featureNS : "http://kpi.siit.tu.ac.th/doh", 
                geometryName : "the_geom",
                srsName : "EPSG:4326"
                })
           // renderers : renderer
        });*/

        //TEST CROSS DOMAIN
        /*var wfs = new OpenLayers.Layer.Vector("States", {
            strategies: [new OpenLayers.Strategy.BBOX()],
            protocol: new OpenLayers.Protocol.Script({
                url: "http://kpi.siit.tu.ac.th:80/geoserver/gwc/service/wfs",
                callbackKey: "format_options",
                callbackPrefix: "callback:",
                params: {
                    service: "WFS",
                    version: "1.1.0",
                    srsName: "EPSG:4326",
                    request: "GetFeature",
                    typeName: "doh:shelter_inventory_view",
                    outputFormat: "json"
                },
                filterToParams: function(filter, params) {
                    // example to demonstrate BBOX serialization
                    if (filter.type === OpenLayers.Filter.Spatial.BBOX) {
                        params.bbox = filter.value.toArray();
                        if (filter.projection) {
                            params.bbox.push(filter.projection.getCode());
                        }
                    }
                    return params;
                }
            })
        })*/

	




		map.addLayers([gmap, gphy, mapnik, longdo,centerline,iri]);

		
		map.addControl(new OpenLayers.Control.LayerSwitcher());
	
	    map.setCenter(new OpenLayers.LonLat(lon, lat).transform( new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject()), zoom);

    	//map.zoomToMaxExtent();	

function get_longdo_url (bounds) {

    // example http://ms.longdo.com/mmmap/tile.php?zoom=8&x=199&y=117&mode=icons&key=demokeyfortestingonly&proj=epsg3857

    var res = this.map.getResolution();

    var x = Math.round ((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));

    var y = Math.round ((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));

    var z = this.map.getZoom();

 

    var zoom = z;

    if (this.proj && this.proj == "epsg4326") zoom +=1;

    var path = "?zoom=" + zoom + "&x=" + x + "&y=" + y + "&mode=" + this.layername + "&key=demokeyfortestingonly";

    if (this.proj) path += '&proj=' + this.proj;

 

    var url = this.url;

    if (url instanceof Array) {

        url = this.selectUrl(path, url);

    }

    return url + path;

}
