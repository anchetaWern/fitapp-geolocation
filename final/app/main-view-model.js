var Observable = require("data/observable").Observable;
var geolocation = require("nativescript-geolocation");

var mapsModule = require("nativescript-google-maps-sdk");
var pageModule = require("tns-core-modules/ui/page");

var { Accuracy } = require("ui/enums");

var dialogs = require("ui/dialogs");

function createViewModel() {
    var viewModel = new Observable();
    var watchId;
    var start_location;
    var current_location;
   
    viewModel.is_tracking = false;
    viewModel.latitude = 15.447819409392789;
    viewModel.longitude = 120.93888133764267;
    viewModel.zoom = 20;

    var total_distance = 0;
    var total_steps = 0;

    var locations = [];

    var mapView;
    var marker = new mapsModule.Marker();

    if (!geolocation.isEnabled()) {
        geolocation.enableLocationRequest();
    } 

    viewModel.toggleTracking = function() {
        
        if (geolocation.isEnabled()) {

            this.set('is_tracking', !viewModel.is_tracking);
            if (viewModel.is_tracking) {
                geolocation.getCurrentLocation(
                    {
                        desiredAccuracy: Accuracy.high, 
                        updateDistance: 5, 
                        timeout: 2000
                    }
                ).
                then(function(loc) {
                    if (loc) {
                        start_location = loc;
                        locations.push(start_location);
                        
                        viewModel.set('latitude', loc.latitude);
                        viewModel.set('longitude', loc.longitude);

                        marker.position = mapsModule.Position.positionFromLatLng(viewModel.latitude, viewModel.longitude); 
                    }
                }, function(e){
                    dialogs.alert(e.message);
                });  

                watchId = geolocation.watchLocation(
                    function (loc) {
                        if (loc) {
                            current_location = loc;
                            locations.push(loc);

                            viewModel.set('latitude', loc.latitude);
                            viewModel.set('longitude', loc.longitude);
                            marker.position = mapsModule.Position.positionFromLatLng(viewModel.latitude, viewModel.longitude); 
                            
                            location_count = locations.length;

                            if (location_count >= 2) {
                                var distance = Math.round(geolocation.distance(locations[location_count - 2], locations[location_count - 1]));
                                var steps = Math.round(distance * 1.3123);
                                
                                total_distance = total_distance + distance;
                                total_steps = total_steps + steps;

                                viewModel.set('distance', "distance travelled: " + total_distance + " meters");
                                viewModel.set('steps', "steps: " + total_steps);

                            }
                            
                        }
                    }, 
                    function(e){
                        dialogs.alert(e.message);
                    }, 
                    {
                        desiredAccuracy: Accuracy.high, 
                        updateDistance: 5, 
                        minimumUpdateTime : 5000
                    }
                );

            } else {
                geolocation.clearWatch(watchId);
                total_distance = 0;
                total_steps = 0;
                locations = [];
                viewModel.set('distance', "distance travelled: " + total_distance + " meters");
                viewModel.set('steps', "steps: " + total_steps);
            }

        } else {
            dialogs.alert("Please enable Geolocation");
        }
    }

    viewModel.getButtonStyle = function() {
        if (viewModel.is_tracking) {
            return 'bg-danger';
        }
        return 'bg-primary';
    }

    viewModel.getButtonLabel = function() {
        if (viewModel.is_tracking) {
            return 'Stop Tracking';
        }
        return 'Start Tracking';
    }

    viewModel.onMapReady = function(args) {
        mapView = args.object;
        marker.position = mapsModule.Position.positionFromLatLng(viewModel.latitude, viewModel.longitude);
        marker.userData = { index: 1 };
        mapView.addMarker(marker);
    }

    return viewModel;
}


exports.createViewModel = createViewModel;
