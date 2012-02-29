function MainCtrl(){
    
    this.points = [];
    this.map = {};
    this.mapPin = null;
    
    this.addPoint = function(){
        
        console.log(this);
        
        if(this.mapPin == null){
            alert('Please select a location first (click on the map)!');
            return;
        }
        
        var newPoint = {};
        newPoint.lat = this.mapPin.lat;
        newPoint.lon = this.mapPin.lng;
        newPoint.title = this.title;
        // use $parent necessary? (or use root scope?)
        this.points.push(newPoint);
        
        // post changes to server (e.g.)
    }
    
    
    // listener if existing point is dragged
    this.dragPoint = function(pointId,lat,lng)
    {   
        console.log('Existing point was dragged',pointId,lat,lng);        
        // post changes to server (e.g.) or change it in array...
    }
    
}
MainCtrl.$inject = [];