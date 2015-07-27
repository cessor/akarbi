
  // This Service  transforms the following structure: 
  // trials = [
  //  trial: {
  //    movements: [
  //      { animal: 'ape',  from: 0, to: 1},
  //      { animal: 'lion', from: 3, to: 2}
  //      ...
  //    ]
  //  },
  //  trial: {
  //    movements: [
  //      { animal: 'gnu',  from: 1, to: 2},
  //      { animal: 'gopher', from: 2, to: 5}
  //      ...
  //    ]
  //  }
  //  ... 
  // ]
  // to a format such as this:
  // kids=ape,lion:gnu,gopher
  // moveFrom=0,3:1,2
  // moveTo=1,2:2,5
  // ";

(function(){
  
  (function() {
    // Make Js better (better = suitable for me)
    if (typeof String.prototype.startsWith != 'function') {
      String.prototype.startsWith = function (str){
        return this.slice(0, str.length) == str;
      };
    }

    if (typeof Array.prototype.unique != 'function') {
      Array.prototype.unique = function () {
        var items = this;
        var set = [];
        var len = items.length;
        for(var i = 0; i < len; i++) {
          var item = items[i];
          if(set.indexOf(item) < 0) {
            set.push(item);
          }
        }
        return set;
      };
    }

    if (typeof Array.prototype.where != 'function') {
      Array.prototype.where = Array.prototype.filter;
    }
  })();

  // Create Structure Object

  function deserialize (content, structure) {
    var tuples = parse(lines(content), structure);
    var slices = transpose(tuples);
    var tree = normalize(slices, structure.structure);
    console.log(tree);
    return tree;
  }
  
  function lines(text){
    return text.split('\n');
  }

  function parse (lines, structure) {
    // I apologize for this shitty piece of code. - JH, 23.06.2014      
    var obj = {};
    // currentValue, index, array
    var len = lines.length;
    for(var i = 0; i < len; i++) {
      var line = lines[i];      

      // Skip empty lines
      if(empty(line)) {
        continue;
      }
      // Split line and extract trialdata
      var fragments = line.split('=');
      var label = structure.alias(fragments[0]);
      var trials = normalizeTrials(fragments[1]);
      obj[label] = trials;
    }
    return obj;
  }

  function empty (line) {
    return (line.trim().length === 0);
  }

  function normalizeTrials (fragment) {
    return fragment
      .split(':')
      .map(function (trial) {
        return trial.split(',').map(function (value) {
          return value.trim(); 
        });
      });
  }    

  function transpose(tuples) {
    var trials = trialCount(tuples);
    var slices = [];
    for(var i = 0; i < trials; i++) {
      var slice = {};
      for(var key in tuples) {
        slice[key] = tuples[key][i];
      }
      slices.push(slice);
    }
    return slices;
  }

  function trialCount(tuples) {
    var sizes = [];
    for(var key in tuples) {
      sizes.push(tuples[key].length);
    }
    var different_sizes = sizes.unique();
    if(different_sizes.length > 1) {
      throw "The matrix contains too many columns";
    }
    return different_sizes[0];
  }

  function normalize(slices, structure) {
    return slices.map(function (slice) { 
      return restructure(slice, structure); 
    });
  }

  function restructure(slice, structure) {
    var result = {};
    for(var groupKey in structure){
      var description = structure[groupKey];
      var group = groupTogether(slice, description);
      try {
        result[groupKey] = transpose(group);
      } catch(e) {
        result[groupKey] = group;
      } 
    }
    return result;
  }

  function groupTogether (slice, group) {
    var result = {};
    for(var field in group) {
      var value = slice[field];
      var converter = group[field];

      value = value.map(converter);
      // If it is just one value, unpack the array - jh, 25.06.2014
      if(value.length == 1) {
        result[field] = value[0];
      } else {
        result[field] = value;
      }
    }
    return result;
  }

  function serialize(trials, structureDefinition) {
    var structure = structureDefinition.structure;
    var rows = _.map(structure, function (part, key) {

      var keys = _.keys(part);
      var items = _.map(trials, function (trial) { return trial[key];} );

      var mapper = flatItem;
      if(areNested(items)) {
          mapper = nestedItem;
      };      
      return makerow(keys, items, function (label) { return structureDefinition.identify(key, label); }, mapper);
    });

    // fuck, forgot that the idiot requires a sorting order
    rows  = _.flatten(rows).sort(function (lineA, lineB) { 
      var labelA = lineA.split('=')[0];
      var labelB = lineB.split('=')[0];
      var a = structureDefinition.sortOrder.indexOf(labelA);
      var b = structureDefinition.sortOrder.indexOf(labelB);
      return cmp(a,b);
    }); 
    
    return rows.join('\n');
  };

  function cmp(a,b) {
    if(a == b){
      return 0;
    }
    if(a < b){
      return -1;
    }
    return 1;
  }

  function makerow(keys, items, identify, leaf) {
    var rows = _.map(keys, function (label) {
      var row = _.map(items, function (item) {
          return leaf(item, label);
      });
      label = identify(label);
      return label + '=' + row.join(':');
    });
    return rows;
  };

  function flatItem (item, label) { 
    return item[label];
  };

  function nestedItem (item, label) {
    var leaf = _.map(item, function (subItem) {
      return subItem[label];
    });
    return leaf.join(',');
  };

  function areNested(items) {
    return _.isArray(items[0]);
  }

  angular
  .module('serialization', [])
  .factory('Serializer', function () {
    return {
      serialize: serialize,
      deserialize: deserialize
    }
  });

  angular
  .module('beachSerializationServices', ['BeachStructure'])
  .factory('BeachSerializer', ['beachStructure', function (beachStructure) {
    return {
      serialize: function (trials) {
        return serialize(trials, beachStructure);
      },
      deserialize: function (text) {
        return deserialize(text, beachStructure);
      }
    };
  }]);
})();


