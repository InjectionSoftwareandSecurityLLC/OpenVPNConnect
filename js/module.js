/* This is our AngularJS controller, called "ExampleController". */
registerController('openVPNConnectController', ['$api', '$scope', '$timeout', '$window', function($api, $scope, $timeout, $window) {
    
    
    $scope.workspace = {config: "", pass: "", flags: "", setupcontent: "", outputcontent: ""};
    $scope.content = "";
    $scope.installLabel = "default";
    $scope.installLabelText = "Checking..."

    $scope.handleDependencies = function(){

        $scope.workspace.setupcontent = "Handling dependencies please wait...";

        $api.request({
            module: 'OpenVPNConnect', 
            action: 'handleDependencies',
        }, function(response) {
            if (response.success === true) {

                $scope.workspace.setupcontent = response.content;

                checkDependencies();

                $timeout(function() {$window.location.reload();}, 5000);
            }
            //console.log(response) //Log the response to the console, this is useful for debugging.
        });

    }
    

    var checkDependencies = function(){
        $api.request({
            module: 'OpenVPNConnect', 
            action: 'checkDependencies',
        }, function(response) {
            if (response.success === true) {
                $scope.installLabel = response.label;
                $scope.installLabelText = response.text;
            }
            //console.log(response) //Log the response to the console, this is useful for debugging.
        });
    }

    checkDependencies();

    var initializeModule = function(){
        $api.request({
            module: 'OpenVPNConnect', 
            action: 'initializeModule',
        }, function(response) {
            if (response.success === true) {
                $scope.workspace.setupcontent = response.content;
            }
            //console.log(response) //Log the response to the console, this is useful for debugging.
        });
    }

    initializeModule();
    
    $scope.startVPN = function() {
        //console.log("encode pressed");
        $api.request({
            module: 'OpenVPNConnect', 
            action: 'startVPN',
            data: [$scope.workspace.config,
                  $scope.workspace.pass,
                  $scope.workspace.flags]
        }, function(response) {
            if (response.success === true) {
                $scope.workspace.outputcontent = response.content;
            }
            //console.log(response) //Log the response to the console, this is useful for debugging.
        });
    }

    $scope.stopVPN = function() {
        //console.log("encode pressed");
        $api.request({
            module: 'OpenVPNConnect', 
            action: 'stopVPN'
        }, function(response) {
            if (response.success === true) {
                $scope.workspace.outputcontent = response.content;
            }
            //console.log(response) //Log the response to the console, this is useful for debugging.
        });
    }
    
    
    
}]);