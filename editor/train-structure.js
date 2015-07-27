(function () {
  function integer(s) { return parseInt(s.trim());}
  function str(s) { return s.trim(); }

  var structure = {
    config: {
      intervals: integer,
      trainWidth: integer,
      trainHeight: integer,
      waggonWidth: integer,
      waggonHeight: integer,
      startDelay: integer,
      trackY: str,
      timeToStation: integer,
    },
    setup: {
      waggonAnimal: integer,
      waggonType: str,
      directions: str
    },
    targets: {
      waggonAnimalEnd: integer,
      waggonTypeEnd: str
    }
  };

  var sortOrder = ['intervals','trainWidth','trainHeight','waggonWidth','waggonHeight','startDelay','trackY','timeToStation','waggonType','waggonTypeEnd','directions','waggonAnimal','waggonAnimalEnd']

  // Ideally this should die, it is just that the serializer calls aliases for stupid field names...

  function alias(key) {
    return key;
  }
  function identify(parent, key) {
    return key;
  }

  angular
  .module('TrainStructure', [])
  .factory('trainStructure', function () {
    return {
      structure: structure,
      sortOrder: sortOrder,
      alias: alias,
      identify: identify
    };
  });
})();