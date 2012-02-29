// ui:map widget
// Google Maps API v. 3.5
// by https://github.com/twarogowski/angular-contrib/blob/master/js/angular-widgets.js
// 2DO: make point handling in controller not in widget?
angular.widget('ui:map', function(el) {
    if(!google || !google.maps)
        return;
    var compiler = this;
    var elem = el;
    var pinExpr = widgetUtils.parseAttrExpr(el, 'ui:pin');
    var viewExpr = widgetUtils.parseAttrExpr(el, 'ui:view');
    
    // BY MA
    var pointsExpr = widgetUtils.parseAttrExpr(el,'ui:points');    
    // EO MA
    
    var defaults = {
        bindZoom : false, 
        bindMapType: false, 
        center: {
            lat:0, 
            lng:0
        }, 
        pinDraggable: true, 
        map: {
            zoom: 4, 
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
    };
    var options = widgetUtils.getOptions(el, defaults);
    defaults.map.center = new google.maps.LatLng(defaults.center.lat, defaults.center.lng);
    
    return function(el) {
        
        // 2DO: set it here? good idea?
        var currentScope = this;
        
        $(elem).append('<div/>')
        var div = ('div', elem).get(0);
        var map = new google.maps.Map(div,options.map);	
        var marker = new google.maps.Marker({
            position: map.center, 
            map: map,
            icon:'img/mapicons/symbol_plus.png'
        });
        marker.setDraggable(options.pinDraggable);

        // BY MA
        var markers = [];
        // EO BY MA
        
        google.maps.event.addListener(map, 'click', function(e) {

            console.log('Map was clicked',e);
            
            marker.setPosition(e.latLng);
            marker.setVisible(true);
            var o = widgetUtils.getValue(currentScope, pinExpr) || {};
            console.log('click map - o',o)           
            $.extend(o, {
                lat:e.latLng.lat(), 
                lng:e.latLng.lng()
            });
            widgetUtils.setValue(currentScope, pinExpr, o);
        });
  	
        google.maps.event.addListener(marker, 'dragend', function(e) {
            var o = widgetUtils.getValue(currentScope, pinExpr) || {};
            $.extend(o, {
                lat: e.latLng.lat(), 
                lng: e.latLng.lng()
            });
            widgetUtils.setValue(currentScope, pinExpr, o);
        });
  	
        google.maps.event.addListener(map, 'dragend', function() {
            var c = map.getCenter();
            var o = widgetUtils.getValue(currentScope, viewExpr) || {};
            $.extend(o, {
                lat: c.lat(), 
                lng: c.lng()
            });
            widgetUtils.setValue(currentScope, viewExpr, o);
        });

        if(defaults.bindZoom)
            google.maps.event.addListener(map, 'zoom_changed', function() {
                var c = map.getCenter();
                var z = map.getZoom();
                var o = widgetUtils.getValue(currentScope, viewExpr) || {};
                $.extend(o, {
                    lat: c.lat(), 
                    lng: c.lng(), 
                    zoom: z
                });
                widgetUtils.setValue(currentScope, viewExpr, o);
            });

        if(defaults.bindMapType)
            google.maps.event.addListener(map, 'maptypeid_changed', function() {
            var t = map.getMapTypeId();	
            var o = widgetUtils.getValue(currentScope, viewExpr) || {};
            $.extend(o, {
                mapType: t
            });
            widgetUtils.setValue(currentScope, viewExpr, o);
        });

        $(elem).data('map', map);
        $(elem).data('marker', marker);  
        $(elem).data('markers',markers);
    
        currentScope.$watch(pinExpr.expression + '.lat', function(scope,newVal,oldVal) {
            var map = $(elem).data('map');
            var marker = $(elem).data('marker');
            var newPos = widgetUtils.getValue(currentScope, pinExpr);
            if(!newPos || !newPos.lat || !newPos.lng){
                marker.setVisible(false);
                return;
            }
            marker.setPosition(new google.maps.LatLng(newPos.lat, newPos.lng));
            marker.setVisible(true);  
        }, null, true);
    
        currentScope.$watch(pinExpr.expression + '.lng', function(scope,newVal,oldVal) {
            var map = $(elem).data('map');
            var marker = $(elem).data('marker');
            var newPos = widgetUtils.getValue(currentScope, pinExpr);
            if(!newPos || !newPos.lat || !newPos.lng){
                marker.setVisible(false);
                return;
            }
            marker.setPosition(new google.maps.LatLng(newPos.lat, newPos.lng));
            marker.setVisible(true);  
        }, null, true);
    
        currentScope.$watch(viewExpr.expression + '.lng', function(scope,newVal,oldVal) {
            
            
            var map = $(elem).data('map');
            var newPos = widgetUtils.getValue(currentScope, viewExpr);
            if(newPos)
                map.setCenter(new google.maps.LatLng(newPos.lat, newPos.lng));
        }, null, true);
    
        currentScope.$watch(viewExpr.expression + '.lat', function(scope,newVal,oldVal) {
            var map = $(elem).data('map');
            var newPos = widgetUtils.getValue(currentScope, viewExpr);
            if(newPos)
                map.setCenter(new google.maps.LatLng(newPos.lat, newPos.lng));
        }, null, true);
        
        // BY MA
        
        // 2DO: we can remove that when 1.0 is stable, because watch can observe arrays then
        // https://groups.google.com/forum/#!searchin/angular/watch$20array/angular/T1zlyeTz9nE/dKBrM-h4RdsJ
        //scope.$watch('name', function(scope, newValue, oldValue) { counter = counter + 1; });
        currentScope.$watch(function(){
            return angular.toJson(eval('currentScope.'+pointsExpr.expression));
        }, function(scope,newValue,oldValue) {
            
            marker.setVisible(false);
            
            
            // if there are no markers set, there wil be an empty json string
            if(newValue!="")
            {
                var newMarkers = angular.fromJson(newValue,false);
            }
            else{
                var newMarkers = [];
            }
            if(oldValue!="")
            {
                var oldMarkers = angular.fromJson(oldValue,false);
            }
            else{
                var oldMarkers = [];
            }
            
            var map = $(elem).data('map');
            
            //2DO: func?
            
            console.log('markers',markers);
            if(markers)
            {
                for (i in markers) {
                    markers[i].setMap(null);
                }
            }
            markers = [];
            //eo clear markers
            
            console.log('map',map,'markers');
            
            var self = scope; // 10.6
            
            for(var i=0;i<newMarkers.length;i++)
            {
                //console.log('marker  ',newMarkers[i]);
                var myLatlng = new google.maps.LatLng(newMarkers[i].lat,newMarkers[i].lon); 
                
                if(angular.isDefined(newMarkers[i].sort_number))
                    var image = 'img/mapicons/number_'+newMarkers[i].sort_number+'.png'; //2DO: use base path?
    
                var markerPOI = new google.maps.Marker({
                    position: myLatlng,
                    title:newMarkers[i].title,
                    icon:image,
                    pointId:newMarkers[i].id
                //animation: google.maps.Animation.DROP
                });
                markerPOI.setDraggable(true);
                
                markers.push(markerPOI);
                
                // 2DO: click handler - change selection in list ! (selected marker?)
                google.maps.event.addListener(markerPOI, 'click', function() {
                    // calling selectPoint for controller (we could do it with utils.setValue as well, but so it is more flexible)
                    console.log('select point',this,map,marker);
                    marker.setVisible(false); // hide + marker, because it will irritate
                    self.selectPoint(this.pointId); //2DO: make this a universal attribute?
                    
                    
                /*if (marker.getAnimation() != null) {
                        marker.setAnimation(null);
                    } else {
                        marker.setAnimation(google.maps.Animation.BOUNCE);
                    }*/
                });
                
                // 2DO: drag start -> for making undo the change...?
                
                google.maps.event.addListener(markerPOI, 'dragend', function(e) {
                    
                    console.log('dragend marker',this,e);
                    self.dragPoint(this.pointId,e.latLng.lat(),e.latLng.lng());
                    
                // 2DO: update marker action
                });
                
                
               
                markerPOI.setMap(map);  // To add the marker to the map, call setMap();
            }
        }, null, true);
        // EO BY MA
        
    
        if(defaults.bindMapType)
            currentScope.$watch(viewExpr.expression + '.mapType', function(scope,val) {
                var map = $(elem).data('map');
                if(val)
                    map.setMapTypeId(val);
            }, null, true);
    
        if(defaults.bindZoom)
            currentScope.$watch(viewExpr.expression + '.zoom', function(scope,val) {
                var map = $(elem).data('map');
                if(val)
                    map.setZoom(val);
            }, null, true);
            
        map.setZoom(options.map.zoom);
    
    };
});

// handy widgets functions
// by https://github.com/twarogowski/angular-contrib/blob/master/js/angular-widgets.js
var widgetUtils = {
    highlight: function(term, text){
        if(!text)
            return null;
        var rx = new RegExp("("+$.ui.autocomplete.escapeRegex(term)+")", "ig" );
        return text.replace(rx, "<strong>$1</strong>");
    },
    noHighlight: function(term, text){
        return text;
    },
    getOptions : function (el, defaults, attrName){
        attrName = attrName || 'ui:options';
        var opts = $(el).attr(attrName);
        defaults = defaults || {};
        if(!opts)
            return defaults;
        var options = angular.fromJson('['+opts+']')[0];	
        return $.extend(defaults, options);
    },
    parseExpr: function(val){
        if(!val || val=='')
            return null;
        var expr = {
            formatters:[]
        };
        var pts = val.split('|');
        expr.expression = pts[0];
        if(pts.length==1)
            return expr;
        for (var i = 0; i < pts.length; i++){
            var args = pts[i].split(':');
            var name = args.shift();
            var frmt = angular.formatter[name];
            if(frmt)
                expr.formatters.push({
                    name: name, 
                    parse: frmt.parse, 
                    format: frmt.format, 
                    arguments: args
                });
        }
        return expr;
    },
    parseAttrExpr: function (el, attrName){
        if(!attrName)
            return null;
        var attr = $(el).attr(attrName);
        return this.parseExpr(attr);	
    },
    setValue: function (scope, attrExpr, value){
        if(!attrExpr || !attrExpr.expression)
            return;
        var v = value;
        v = this.parseValue(v, attrExpr, scope);	
        // WAS IN 09.19:
        //scope.$set(attrExpr.expression, v);
        // NOW IN 10.6. CHANGED BY MYSELF:
        scope.$apply(scope[attrExpr.expression] = v);
    },
    getValue: function (scope, attrExpr){
        console.log('get value - scope',scope,attrExpr);
        if(!attrExpr || !attrExpr.expression)
            return null;
        // WAS IN 09.19: 
        // val = scope.$get(attrExpr.expression);
        // NOW CHANGE FOR 10.6:
        var val = scope[attrExpr.expression];
        val = this.formatValue(val, attrExpr, scope);
        return val;
    },
    parseValue: function (value, attrExpr, scope){
        if(!attrExpr || !attrExpr.formatters || attrExpr.formatters.length==0)
            return value;
        var v = value;	
        for (var i = 0; i < attrExpr.formatters.length; i++) {
            var fm = attrExpr.formatters[i];
            if(fm && fm.parse)
                v = fm.parse.apply(scope, [v].concat(fm.arguments));
        };
        return v;	
    },
    formatValue: function (value, attrExpr, scope){
        if(!attrExpr || !attrExpr.formatters || attrExpr.formatters.length==0)
            return value;
        var v = value;	
        for (var i = 0; i < attrExpr.formatters.length; i++) {
            var fm = attrExpr.formatters[i];
            if(fm && fm.format)
                v = fm.format.apply(scope, [v].concat(fm.arguments));
        };
        return v;
    }
};
