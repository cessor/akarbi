var g = {};
(function () {

  var animals = "ape,cat,chameleon,dog,donkey,gnu,gopher,gorilla,kakadu,lama,lion,pinguin".split(',');

  var Trial = function () {
    this.movements = [];
    this.targets = [];
  };

  var Movement = function () {
    this.animal = "ape";
    this.from = -1;
    this.to = -1;
  };

  var Target = function () {
    this.animal = "ape";
    this.position = -1;
  };

  angular
  .module('beach', ['beachSerializationServices', 'beachControls'])
  .factory('Configuration', function () {
    // This is redundant with the beach structure. Clean this up, it doesn ot belong here
    var config = {
      "rows": 2,
      "cols": 3,
      "dist": 400,
      "offSet": 50,
      "jumpDist": 30,
      "iterations": 3,
      "intervall":  1400,
      "waitBetween":  5000,
      "parasolWidth":  200,
      "parasolHeight": 200,
      "figureWidth":  130,
      "figureHeight":  130,
      "parasols": "1,2,3,4,5,6",
      "questionmarkPosition": "50%"
    };
    return config;
  })
  .controller('PageController', function () {
    this.pages = ['trials','config'];
    this.page = "trials";

    this.select = function (page) {
      this.page = page;
    };

    this.isOn = function (page) {
      return this.page == page;
    };
  })
  .controller('ConfigurationController', ['$scope', 'Configuration', function ($scope, Configuration) {
    // Sort order kept, makes it easier...
    // This does not belong here
    $scope.fields = _.keys(Configuration);
    $scope.config = Configuration;
  }])


  .controller('TrialsController', [ '$http', '$scope', '$timeout', 'BeachSerializer', 'Configuration', function ($http, $scope, $timeout, BeachSerializer, Configuration) {
    this.file = '';
    this.importFile = '';
    this.index = -1;
    this.saved = false;
    this.trial = {};
    this.trials = [];
    this.context = "beach";

    $scope.trial = this.trial;
    $scope.animals = animals;
    $scope.positions = [0,1,2,3,4,5,6,7,8,9];

    this.unselect = function () {
      this.index = -1;
      this.trial = {};
    };

    this.select = function (index) {
      this.trial = this.trials[index];
      $scope.trial = this.trial;
      this.index = index;
    };

    this.remove = function (index) {
      this.trials.splice(index, 1);
      this.unselect();
    };

    this.addTrial = function () {
      this.trial = new Trial();
      this.trials.push(this.trial);
      this.index = this.trials.length - 1;
    };

    this.copyTargets = function () {
      var self = this;
      self.trial.targets = [];
      angular.forEach(this.trial.movements, function (item, index) {
        var target = new Target();
        target.animal = item.animal;
        target.position = item.to;
        self.trial.targets.push(target);
      });
    };

    this.importOld = function () {
        this.trials = BeachSerializer.deserialize(this.importFile);
        $('#upload_modal').modal('hide');
        g.trials = this.trials;
        this.importFile = '';
    };

    this.exportOld = function ()  {
        function broadcastConfiguration () {
          for(var i = 0; i < this.trials.length; i++){
            this.trials[i]['config'] = Configuration;
          }
        };
        broadcastConfiguration();
        $('#upload_modal').modal('show');
        var file = BeachSerializer.serialize(this.trials);
        this.importFile = file;
    };

    this.import = function () {
        var self = this;
        $http
        .get('/static/assets/' + self.context + '.json')
        .success(function (data) {
            self.trials = data.trials;
        })
        .error(function () {
            alert("Fehler beim Öffnen.");
        });
    }

    this.export = function () {
        var self = this;
        if(this.trials.length === 0) {
            // prevent accidental deletion
            return;
        }
        $http
        .post('/'+ self.context, {trials: this.trials})
        .success(function (data) {
            self.saved = true;
            $timeout(function () {
                self.saved = false;
            }, 1500);
        })
        .error(function () {
            alert("Fehler beim Speichern.");
        });
    }


}]) // trials controller


.controller('MovementsController', function ($scope) {
    this.movement = {};
    this.some = function (trial) {
      return (trial.movements || []).length > 0;
    }
    this.movements = function (trial) {
      return trial.movements;
    };
    this.addMovement = function (trial) {
      this.movement = new Movement();
      trial.movements.push(this.movement);
    };
    this.remove = function (trial, index) {
      trial.movements.splice(index, 1);
    };
}) // movements controller


.controller('TargetsController', function ($scope) {
    this.target = {};
    this.targets = function (trial) {
      return trial.targets;
    };
    this.some = function (trial) {
      return (trial.targets || []).length > 0;
    }
    this.addTarget = function (trial) {
      this.target = new Target();
      trial.targets.push(this.target);
    };
    this.remove = function (trial, index) {
      trial.targets.splice(index, 1);
    };
}); // targets controller

})();
