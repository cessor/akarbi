(function () {
  function integer(s) { return parseInt(s.trim());}
  function str(s) { return s.trim(); }

  var structure = {
    config: {
      rows: integer,
      cols: integer,
      dist: integer,
      offSet: integer,
      jumpDist: integer,
      iterations: integer,
      intervall: integer,
      waitBetween: integer,
      parasolWidth: integer, 
      parasolHeight: integer,
      figureWidth: integer, 
      figureHeight: integer,
      parasols: str,
      questionmarkPosition: str
    },
    movements: {
      to: integer,
      from: integer,
      animal: str
    },
    targets: {
      animal: str,
      position: integer
    }
  };

  var sortOrder =["rows","cols","dist","offSet","jumpDist","iterations","intervall","waitBetween","parasolWidth","parasolHeight","figureWidth","figureHeight","kids","moveFrom","moveTo","showEndKid","showEndPosition","parasols","questionmarkPosition"];

  var aliases = {
    moveFrom: 'from',
    moveTo: 'to',
    kids: 'animal',  
    showEndKid: 'animal',
    showEndPosition: 'position'  
  };

    // This is redundant with aliases, and should actually replace it! - JH, 30.06.2014
  var reverse = {
    movements: {
        moveFrom: 'from',
        moveTo: 'to',
        kids: 'animal'
    }, 
    targets: {
        showEndKid: 'animal',
        showEndPosition: 'position'  
    }
  };

  // Returns an alias for an original name
  function alias(value) {
    value = value.trim();
    return aliases[value] || value;
  };

  function identify(parent, value) {
    return _.invert(reverse[parent])[value] || value;
  };

  angular
  .module('BeachStructure', [])
  .factory('beachStructure', function () {
    return {
      structure: structure,
      alias: alias,
      identify: identify,
      sortOrder: sortOrder
    };
  });
})();