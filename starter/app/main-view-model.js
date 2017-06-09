var Observable = require("data/observable").Observable;

function createViewModel() {
    var viewModel = new Observable();
    
    viewModel.is_tracking = false;
 
    viewModel.toggleTracking = function() {
        this.set('is_tracking', !viewModel.is_tracking);
    }

    viewModel.getButtonStyle = function() {
        if(viewModel.is_tracking) {
            return 'bg-danger';
        }
        return 'bg-primary';
    }

    viewModel.getButtonLabel = function() {
        if(viewModel.is_tracking){
            return 'Stop Tracking';
        }
        return 'Start Tracking';
    }

    return viewModel;
}


exports.createViewModel = createViewModel;
