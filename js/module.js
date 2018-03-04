/* This is our AngularJS controller, called "ExampleController". */
registerController('openVPNConnectController', ['$api', '$scope', '$timeout', '$window', '$http', function($api, $scope, $timeout, $window, $http) {
    
    
    $scope.workspace = {config: "", 
                        pass: "", 
                        flags: "", 
                        sharedconnection: 
                        false, setupcontent: "", 
                        outputcontent: "", 
                        availablecerts: [],
                        uploadstatusLabel: "",
                        uploadstatus: ""};
    $scope.content = "";
    $scope.installLabel = "default";
    $scope.installLabelText = "Checking..."
    $scope.selectedFiles = [];
    $scope.uploading = false;

    $scope.tests = ["yo", "ayyy"];

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
                
                for(var i = 0; i <= response.certs.length - 1; i++){
                    $scope.workspace.availablecerts.push(response.certs[i].name);
                }
            }
            //console.log(response) //Log the response to the console, this is useful for debugging.
        });
    }

    initializeModule();

    $scope.setConfig = function(cert){
        $scope.workspace.config = cert;
    }
    
    $scope.startVPN = function() {
        $api.request({
            module: 'OpenVPNConnect', 
            action: 'startVPN',
            data: [$scope.workspace.config,
                  $scope.workspace.pass,
                  $scope.workspace.flags,
                  $scope.workspace.sharedconnection]
        }, function(response) {
            if (response.success === true) {
                $scope.workspace.outputcontent = response.content;
            }
            //console.log(response) //Log the response to the console, this is useful for debugging.
        });
    }

    $scope.stopVPN = function() {
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
    
    //File Upload Code

    $scope.setSelectedFiles = function(){
		files = document.getElementById("selectedFiles").files;
		for (var x = 0; x < files.length; x++) {
			$scope.selectedFiles.push(files[x]);
		}
    };

    $scope.removeSelectedFile = function(file){
		var x = $scope.selectedFiles.length;
		while (x--) {
			if ($scope.selectedFiles[x] === file) {
				$scope.selectedFiles.splice(x,1);
			}
		}
    };

    $scope.uploadFile = function(){
		$scope.uploading = true;
		
		var fd = new FormData();
		for (x = 0; x < $scope.selectedFiles.length; x++) {
			fd.append($scope.selectedFiles[x].name, $scope.selectedFiles[x]);
		}
		$http.post("/modules/OpenVPNConnect/api/module.php", fd, {
			transformRequest: angular.identity,
			headers: {'Content-Type': undefined}
		}).then(function(response) {
            var failCount = 0;
			for (var key in response) {
				if (response.hasOwnProperty(key)) {
					if (response.key == "Failed") {
                        failCount += 1;
						alert("Failed to upload " + key);
					}
				}
            }
            if(failCount > 0){
                $scope.workspace.uploadstatusLabel = "One or more files failed to upload!";
                $scope.workspace.uploadstatus = "danger";
            }else{
                $scope.workspace.uploadstatusLabel = "Upload Success!";
                $scope.workspace.uploadstatus = "success";
            }
			$scope.selectedFiles = [];
			$scope.uploading = false;
		});
     };
    
}]);