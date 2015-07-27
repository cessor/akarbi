(function () {

  var animals = "ape,cat,chameleon,dog,donkey,gnu,gopher,gorilla,kakadu,lama,lion,pinguin".split(',');

  angular
  .module('train', ['beachSerializationServices', 'serialization', 'TrainStructure'])
  .controller('trialsController', ['$scope', '$http', 'Serializer', 'trainStructure', function ($scope, $http, Serializer, trainStructure) {

    this.trial = {};
    this.index = -1;
    this.file = '';
    $scope.animalTypes = ['ape','gopher','donkey','cat','lion','pinguin','kakadu','gnu','gorilla','dog','lama','chameleon'];
    $scope.directions = [
      { key: 'Left, In', value: 'leftIn'},
      { key: 'Right, In', value: 'rightIn'},
      { key: 'Left, Out', value: 'leftOut'},
      { key: 'Right, Out', value: 'rightOut'},
    ];
    $scope.colors = [
      { key: 'Green', value: 'greenWaggon'},
      { key: 'Blue', value: 'blueWaggon'},
      { key: 'Orange', value: 'orangeWaggon'},
    ];
    $scope.trials = [];
    $scope.trial = this.trial;

    this.select = function (index) {
      this.trial = $scope.trials[index];
      this.index = index;
      $scope.trial = this.trial;
    };
    
    this.addTrial = function () {
      this.trial = { config:{
        intervals: 8,        
        trainWidth: 150,
        trainHeigth: 150,
        waggonWidth: 150,
        waggonHeight: 150,
        startDelay: 2000,
        trackY: '67%',
        timeToStation: 4500
      }, setup:[], targets:[]};
      $scope.trial = this.trial;
      $scope.trials.push(this.trial);
      this.index = $scope.trials.length - 1;
    };

    this.animalValue = function(animal) {
      return $scope.animalTypes.indexOf(animal) + 1;
    };

    this.remove = function (index) {
      $scope.trials.splice(index, 1);
      this.unselect();
    };

    this.unselect = function () {
      this.index = -1;
      this.trial = {};
    };

    this.addMovement = function (trial) {
      trial.setup.push({ 
        directions: '',
        waggonAnimal: '',
        waggonType: ''
      });
      // Update
      this.trial = trial;
      $scope.trial = trial;
    };

    this.removeMovement = function (trial, index) {
      trial.setup.splice(index, 1);
    };

    this.addTarget = function (trial) {
      trial.targets.push({
        waggonAnimalEnd: '',
        waggonTypeEnd: ''
      });
      // Update
      this.trial = trial;
      $scope.trial = trial;
    };

    this.removeTarget = function (trial, index) {
      trial.targets.splice(index, 1);
    };

    this.import = function () {
      if(this.file.length > 0) {
        $scope.trials = Serializer.deserialize(this.file, trainStructure);
      }
    };

    this.export = function () {
      this.file = Serializer.serialize($scope.trials, trainStructure);
    };

    // $http.get('trainstation.txt').success(function (data) {
    //   $scope.trials = Serializer.deserialize(data, trainStructure);
    // });
  }]);
})();

