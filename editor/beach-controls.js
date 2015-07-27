(function () {
	angular
	.module('beachControls', [])
	.filter('capitalize', function() {
	    return function(input, scope) {
	        return input.substring(0,1).toUpperCase() + input.substring(1);
	    }
	})
	.directive("selectAnimals", function () {
		return {
			restrict: 'E',
			scope: {
				model: "=",
				animals: "=items"
			},
			transclude: true,
			template: '<select ng-model="model" ng-options="a for a in animals"> \
				<option value="">-- Tier auswählen --</option> \
			</select>'
		};
	})
	.directive("selectAnimalsImg", function () {
		return {
			restrict: 'E',
			scope: {
				animal: "=ngModel",
				animals: "=items"
			},
			transclude: true,
			controller: function ($scope) {
				this.animal = $scope.ngModel;
				$scope.animal = this.animal;

				this.select = function (animal) {
					console.log('animal');
				};
			},
			templateUrl: "animal-selector.html"
		};
	})
	.directive("selectPosition", function () {
		return {
			restrict: 'E',
			scope: {
				model: "=",
				placeholder: "=",
				positions: "=items"
			},
			transclude: true,
			template: '<select ng-model="model" ng-options="p for p in positions">'+
				'<option value="">-- {{ placeholder }} --</option>' +
			'</select>'
		};
	})
	.directive("icon", function () {
		return {
			restrict: "E",
			scope: {
				icon: '='
			},
			transclude: true,
			template: '<span class="glyphicon glyphicon-{{icon}}"></span>'
		};
	})
})();