'use strict';

angular.module('myApp.ShowEvents', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/ShowEvents', {
    templateUrl: 'ShowEvents/ShowEventsView.html',
    controller: 'ShowEventsCtrl'
  });
}])
.controller('ShowEventsCtrl', ["$scope", "$filter", "$http", "ApiUrl", "PageSize", "$uibModal", function($scope, $filter, $http, apiUrl, pageSize, $uibModal) {
    var geocoder;
    $scope.eventList = [];
    $scope.selectedEventData = {};
    $scope.GetDisplayDateFromIso = function(isoDateString){
        return moment(isoDateString).format('D MMM YYYY H:mm');
    };
    $scope.GetSelectedEventData = function(eventId){
        $http({
                method:'GET',
                url: apiUrl + eventId
            })
            .then(function(response){
                $scope.selectedEventData = response.data;
                OpenDialog();
            },
            function(response){
                alert("There was an error in fetching the event details. Please ensure your api is running.")
            });
    }
    $scope.FindMe = function () {
        if (!navigator.geolocation) {
            alert("Geolocation not supported");
        }
        else
        {
            geocoder = new google.maps.Geocoder();
            navigator.geolocation.getCurrentPosition(function (position) {
                var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                geocoder.geocode({ 'location': latlng }, function (results, status) {
                        if (status == 'OK') {
                            if(results.length > 0){
                                //We need the following address components (to match the city or the political region, which may be the state but just in case)
                                //locality is the local region (suburb or city)
                                //administrative_area_2 is the current or nearest major city
                                //political, which may be the state or the city - one of these should match the city in the event data
                                var addressComponentsRequired = ['locality', 'administrative_area_level_2', 'political'];
                                var arr = [];
                                angular.forEach(addressComponentsRequired, function(component){
                                    let result = GetSpecifiedAddressComponent(component, results[0].address_components);
                                    if(result){
                                        if(($filter('filter')(arr, result)).length == 0){
                                            arr.push(result);
                                        }
                                    }
                                });
                                $http({
                                    method:'POST',
                                    url: 'http://localhost:58824/api/values?pageNum=' + 1 + '&pageSize=' + pageSize,
                                    data: arr
                                })
                                .then(function(response){
                                    //angular.copy(response.data, $scope.eventList);
                                    angular.forEach(response.data, function(event){
                                        $scope.eventList.push(event);
                                    });
                                },
                                function(response){
                                    alert("There was an error in fetching the events. Please ensure your api is running.")
                                });
                            }
                        } else {
                            alert('Geocode was not successful for the following reason: ' + status);
                        }
                });
            }, function () {
                alert("Please allow GeoLocation to access location.");
            });
        }
    };

    function GetSpecifiedAddressComponent(addressComponentType, addressesToSearch){
        var data = $filter('filter')(addressesToSearch, {'types': addressComponentType});
        if(data.length > 0){
            return data[0].short_name;
        }
        return null;
    }

    function OpenDialog () {
        var modalInstance = $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'EventDetailsDialog.html',
          scope: $scope
        });
    }
}]);