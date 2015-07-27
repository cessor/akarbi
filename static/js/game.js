// Patterns
// http://addyosmani.com/resources/essentialjsdesignpatterns/book/#revealingmodulepatternjavascript
// Uses Phaser.io
// Uses Underscore.js *(Variable named "_" )
var game;
var audio;
(function (){

    function Options () {
        // Attach #debug to the URL to see them move very fast.
        var hash = window.location.hash;
        function debug () {
            return (hash.indexOf("debug") > -1);
        }
        function auto () {
            return (hash.indexOf("auto") > -1);
        }
        function training () {
            return (hash.indexOf("training") > -1);
        }
        function number () {
            return (hash.match(/\d+/) || [-1])[0];
        }
        return {
            auto: auto,
            debug: debug,
            number: number,
            training: training
        }
    }
    var options = new Options();

    var Animals = {
        Ape:        'ape',
        Cat:        'cat',
        Chameleon:  'chameleon',
        Gecko:      'chameleon',
        Dog:        'dog',
        Donkey:     'donkey',
        Gnu:        'gnu',
        Gopher:     'gopher',
        Gorilla:    'gorilla',
        Kakadu:     'kakadu',
        Lama:       'lama',
        Lion:       'lion',
        Pinguin:    'pinguin'
    };

    // 2880x1800 is the resolution of a MacBook Pro 15" with Retina Display
    var config = {
        PARASOL_SIZE_PERCENT: 0.60,
        ANIMAL_SIZE_PERCENT: 0.4,
        PLAY_SOUND: true,
        RESOLUTION_WIDTH: 2880,
        RESOLUTION_HEIGHT: 1800,
        HIDE_FEEDBACK_AFTER: 2000,
        HIDING_TIMEOUT: 2000,
        HIDING_DURATION: 500,
        MOVEMENT_TIMEOUT: 6000,
        MOVEMENT_DURATION: 1500,
        WAIT_BETWEEN_MOVES: 1000,
        WAIT_BEFORE_DISCOVERY: 1000
    };


    function overrideConfigInDebugMode () {
        if (!options.debug()) {
            return;
        }
        config.HIDE_FEEDBACK_AFTER = {true:50,false:250}[options.auto()];
        config.PLAY_SOUND = false;
        config.HIDING_TIMEOUT = 100;
        config.HIDING_DURATION = 100;
        config.MOVEMENT_TIMEOUT = 100;
        config.MOVEMENT_DURATION = 100;
        config.WAIT_BETWEEN_MOVES = 0;
        config.WAIT_BEFORE_DISCOVERY = 0;
    }
    overrideConfigInDebugMode();

    var constants = {
        BACKGROUND: 'background',
        ERROR: 'error',
        YES: 'yes',
        NO: 'no',
        QUESTION: 'question',
        SMILEY: 'smiley',
        SOUND_INTRO: 'sound_intro',
        SOUND_NO: 'sound_no',
        SOUND_YES: 'sound_yes',
        TRAINING: 'training',
        TRIALS: 'trials'
    }


    function Assets () {
        function loadMenu() {
            game.load.image(constants.YES, 'static/assets/menu/yes.png');
            game.load.image(constants.NO, 'static/assets/menu/no.png');
            game.load.image(constants.QUESTION, 'static/assets/menu/question.png');
            game.load.image(constants.SMILEY, 'static/assets/menu/smiley.jpg');
            game.load.image(constants.ERROR, 'static/assets/menu/error.jpg');
        };
        function loadBackgroundImage() {
            game.load.image(constants.BACKGROUND, 'static/assets/beach.jpg');
        };
        function loadAnimals () {
            _.each(Animals, function (animal) {
                var filename = 'static/assets/animals/' + animal + '.png';
                game.load.image(animal, filename);
            });
        };
        function loadParasols () {
            _.each(_.range(1, 13), function (i) {
                var filename = 'static/assets/parasols/'+ i.toString()+'.png';
                game.load.image('parasol' + i.toString(), filename);
            });
        };
        function loadSounds () {
            game.load.audio(constants.SOUND_YES, 'static/assets/sound/true.mp3');
            game.load.audio(constants.SOUND_NO, 'static/assets/sound/false.mp3');
            game.load.audio(constants.SOUND_INTRO, 'static/assets/sound/sound.mp3');
        }
        function loadTrials () {
            game.load.text(constants.TRAINING, 'static/assets/training.json');
            game.load.text(constants.TRIALS, 'static/assets/beach.json');
        }
        function load () {
            loadMenu();
            loadAnimals();
            loadBackgroundImage();
            loadParasols();
            loadSounds();
            loadTrials();
        }
        return {
            load: load
        }
    };


    function Audio () {
        var sounds = {};
        function load(){
            sounds[constants.SOUND_NO] = game.add.audio(constants.SOUND_NO);
            sounds[constants.SOUND_YES] = game.add.audio(constants.SOUND_YES);
            sounds[constants.SOUND_INTRO] = game.add.audio(constants.SOUND_INTRO);
        }
        function play(key) {
            // Disable sound in debug mode,
            // to prevent yourself from going insane
            if(config.PLAY_SOUND === false) {
                console.log("["+key+"] Muted");
                return;
            }
            if(key in sounds) {
                sounds[key].play();
            }
        }
        load();
        return {
            play: play
        };
    }


    function Background () {
        function fit_to_window(sprite) {
            // rescales the background sprite to fit the whole world
            var rescale_by_x = game.world.width / config.RESOLUTION_WIDTH;
            var rescale_by_y = game.world.height / config.RESOLUTION_HEIGHT;
            sprite.scale.setTo(rescale_by_x, rescale_by_y);
        };
        function background () {
            game.stage.backgroundColor = '#00dbff';
            game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
            return game.add.sprite(self.x, self.y, constants.BACKGROUND);
        };
        fit_to_window(background());
    }


    function Beach (grid, trial, finished) {
        var self = this;
        animals = {};
        parasols = [];
        movements = [];
        discoveries = [];

        self.animalCount = function () {
            console.log(animals);
            return _.size(animals);
        };

        self.movementCount = function () {
            return movements.length;
        };

        self.parasolCount = function () {
            return parasols.length;
        };

        self.finished = function () {
            var result = expectedResult();
            finished(this, trial, result);
        };

        function addParasols () {
            function addParasol(column, row, parasolIndex) {
                var position = grid.cell_to_pixel(column, row);
                var key = 'parasol' + parasolIndex.toString();
                var parasol = game.add.sprite(position.x, position.y, key);
                parasol.anchor.set(0.5);
                grid.scaleTo(parasol, config.PARASOL_SIZE_PERCENT);
                parasols.push(parasol);
            }
            function addAll () {
                var parasolIndex = 1;
                for(var column = 0; column < grid.columns; column++) {
                    for(var row = 0; row < grid.rows; row++) {
                        addParasol(column, row, parasolIndex);
                        parasolIndex += 1;
                    }
                }
            }
            addAll();
        }

        function discoverAnimals () {
            // Add to cells, hidden by parasols
            _.each(discoveries, function (discovery) {
                var animal = animals[discovery.animal];
                var position = grid.cell_to_pixel(discovery.at[0], discovery.at[1]);
                animal.x = position.x;
                animal.y = position.y;
            });
            // Bring To Front
            _.each(animals, function (animal) {
                game.world.bringToTop(animal);
            });
            self.finished();
        };

       function expectedResult () {
            function actualPositions () {
                var positions = {};
                _.each(movements, function (movement) {
                    positions[movement.animal] = movement.to;
                });
                return positions;
            }
            function discoveredPositions () {
                var positions = {};
                _.each(discoveries, function (discovery) {
                    positions[discovery.animal] = discovery.at;
                });
                return positions;
            }
            function positionsAreEqual(shown, actual) {
                // If is a difference between the actual positions
                // and the discovered ones, then "NO" is the correct answer.
                var differences = _.map(shown, function (discovery, animal) {
                    var position = actual[animal];
                    return (position[0] == discovery[0])
                        && (position[1] == discovery[1]);
                });
                return _.every(differences);
            }
            function correctAnswer() {
                // evaluates, what answer is the correct
                var shown = discoveredPositions();
                var actual = actualPositions();
                var equalPositions = positionsAreEqual(shown, actual)
                var answer = constants.NO;
                if(equalPositions) {
                    // The question of each trial is
                    // "Are the animals in the correct place?"
                    // If they aren't, then the expected answer is No
                    // If the animals ARE in the right place, then the
                    // expected answer is yes.
                    answer = constants.YES;
                }
                return answer;
            }
            return correctAnswer();
        };

        function hideAnimals () {
            function hideAnimal (animal, parasol_height) {
                var y = animal.y;
                var height = parasol_height + (animal.height / 2.0);
                var jumpUp = game.add.tween(animal);
                var jumpDown = game.add.tween(animal);
                var duration = config.HIDING_DURATION; // 1 second
                jumpUp.to({ y:  y - height }, duration);
                jumpDown.to({ y:  y }, duration);
                jumpUp.onComplete.add(function () {
                    _.each(parasols, function (parasol) {
                        game.world.bringToTop(parasol);
                    });
                    jumpDown.start();
                });
                jumpUp.start();
            }
            function hideAll () {
                var parasol_height = parasols[0].height / 2.0;
                _.each(animals, function (animal, key) {
                    hideAnimal(animal, parasol_height);
                });
            }
            hideAll();
        };

        function moveAnimals (callback) {
            function moveAnimal(column, row, animal) {
                var animal = animals[animal];
                var move = game.add.tween(animal);
                var position = grid.cell_to_pixel(column, row);
                move.to(position, config.MOVEMENT_DURATION)
                return move;
            };
            function moveAll () {
                var timer = game.time.create(false);
                // discoverAnimals is really ugly here and not very explicit.
                // This should be parameterized.
                timer.add(config.WAIT_BEFORE_DISCOVERY, discoverAnimals);
                var tweens = _.map(movements, function (movement) {
                    var cell_column = movement.to[0];
                    var cell_row = movement.to[1];
                    return moveAnimal(cell_column, cell_row, movement.animal)
                });
                // Note to self: Fuck tween chaining. Hard.
                function next_tween() {
                    var tween = tweens.shift();
                    if(!tween) {
                        timer.start();
                        return;
                    };
                    tween.delay(config.WAIT_BETWEEN_MOVES);
                    tween.onComplete.add(function () {
                        next_tween();
                    });
                    tween.start()
                }
                next_tween();
            }
            moveAll();
        };

        function setup(trial) {
            function addAnimal (column, row, animal) {
                var position = grid.cell_to_pixel(column, row);
                var sprite = game.add.sprite(position.x, position.y, animal);
                animals[animal] = sprite;
                sprite.anchor.set(0.5);
                grid.scaleTo(sprite, config.ANIMAL_SIZE_PERCENT);
            };
            function addAnimalsAtStartingPosition (trial) {
                function addAnimalToNumberedCell (animal, cellNumber) {
                    var point = grid.pointAt(cellNumber);
                    addAnimal(point[0], point[1], animal);
                }
                var done = [];
                _.each(trial.movements, function (movement, index, list) {
                    if(done.indexOf(movement.animal) != -1) {
                        return;
                    }
                    addAnimalToNumberedCell(movement.animal, movement.from);
                    done.push(movement.animal);
                });
            }
            function addAnimalMovementChains (trial) {
                function addMovementToNumberedCell (animal, cellNumber) {
                    var point = grid.pointAt(cellNumber);
                    movements.push({animal: animal, to: point})
                }
                _.each(trial.movements, function (movement, index, list) {
                    addMovementToNumberedCell(movement.animal, movement.to);
                });
            }
            function addAnimalDiscoveries (trial) {
                function addDiscoveryAtNumberedCell (animal, cellNumber) {
                    var point = grid.pointAt(cellNumber);
                    discoveries.push({animal: animal, at: point})
                }

                _.each(trial.targets, function (target, index, list) {
                    addDiscoveryAtNumberedCell(target.animal, target.position);
                });
            }
            function add(trial) {
                addAnimalsAtStartingPosition(trial);
                addAnimalMovementChains(trial);
                addAnimalDiscoveries(trial);
            }
            add(trial);
        };

        function run () {
            game.time.events.add(config.HIDING_TIMEOUT, hideAnimals, this);
            game.time.events.add(config.MOVEMENT_TIMEOUT, moveAnimals, this);
            // moveAnimals calls discoverAnimals Asynchronously,
            // which calls finished(trial)
        }

        (function () {
            new Background();
            addParasols();
            setup(trial);
            run();
        })();
    };


    function GameState (trials) {
        var self = this;
        self.trials = trials || [];
        var last_index = this.trials.length - 1;
        var index = -1;
        function current () {
            return elementAt(index);
        }
        function currentIndex () {
            // Index for humans
            return (index + 1);
        }
        function elementAt (index) {
            return self.trials[index];
        }
        function inRange (index_) {
            return (index_ >= 0 && index_ <= last_index);
        }
        function isFinished() {
            return (index === last_index);
        }
        function next () {
            if(!isFinished())
            {
                index++;
            }
            return elementAt(index);
        }
        function progress () {
            return {
                current: (index+1),
                total: self.trials.length
            }
        }
        return {
            current: current,
            currentIndex: currentIndex,
            elementAt: elementAt,
            isFinished: isFinished,
            inRange: inRange,
            next: next,
            progress: progress
        }
    }


    function Grid (columns, rows) {
        // Mapping for numbered positions.
        // The editor uses numbered positions because they are less to type
        // This is here for legacy purposes. The editor spits out numbered cells like
        // 0 1 2                                                00 01 02
        // 3 4 5   wheres the new grid is two dimensioanl like  10 11 12
        // 6 7 8                                                20 21 22
        var point_map = {
            0:[0,0], 1:[1,0], 2:[2,0],
            3:[0,1], 4:[1,1], 5:[2,1],
            6:[0,2], 7:[1,2], 8:[2,2]
        };

        // Calculate usable space
        var PARASOL_COLUMNS = columns;
        var PARASOL_ROWS = rows;

        var USABLE_BEACH_PERCENT = 0.83;
        var USABLE_BEACH_WIDTH = game.world.width * USABLE_BEACH_PERCENT;
        var USABLE_BEACH_HEIGHT = game.world.height;

        var CELL_WIDTH = USABLE_BEACH_WIDTH / PARASOL_COLUMNS;
        var CELL_HEIGHT = USABLE_BEACH_HEIGHT / PARASOL_ROWS;
        var SPACE_LIMIT = Math.min(CELL_WIDTH, CELL_HEIGHT);

        function cell_to_pixel (column, row) {
            // returns the center of the cell
            return {
                x: (column * CELL_WIDTH) + (CELL_WIDTH / 2.0),
                y: (row * CELL_HEIGHT + (CELL_HEIGHT / 2.0))
            };
        };
        function pointAt (index) {
            return point_map[index];
        }
        function scaleTo (sprite, size_percent){
            sprite.scale.setTo(
                (SPACE_LIMIT / sprite.width) * 1 * size_percent,
                (SPACE_LIMIT / sprite.height) * 1 * size_percent
            );
        }
        return {
            cell_to_pixel: cell_to_pixel,
            columns: columns,
            pointAt: pointAt,
            rows: rows,
            scaleTo: scaleTo
        }
    };


    function Menu () {
        var self = this;
        var menu = {};
        var dialogResult = {};
        var finished = function () {};

        function answerYes () {
            hide();
            finished(constants.YES);
        };
        function answerNo () {
            hide();
            finished(constants.NO);
        };
        function create () {
            menu = game.add.group();
            // NO - BUTTON
            var no_button = game.add.button(
                0,
                0,
                constants.NO,
                answerNo
            );
            no_button.scale.setTo(0.2);
            menu.add(no_button);
            // Questionmark
            var question = game.add.button(
                game.world.width / 2.0, 0,
                constants.QUESTION
            );
            question.anchor.set(0.5, 0);
            question.scale.setTo(0.2);
            menu.add(question);
            // YES - BUTTON
            var ok_button = game.add.button(
                game.world.width,
                0,
                constants.YES,
                answerYes
            );
            ok_button.anchor.set(1, 0);
            ok_button.scale.setTo(0.2);
            menu.add(ok_button);
            //menu.visible = false;
        }
        function drawPanel () {
            // Adds a pane at the center
            var graphics = game.add.graphics(0, 0);
            graphics.lineStyle(2, 0x00000, 1.0);
            graphics.beginFill(0xFFFFFF, 1.0);
            var padding = 100;
            var pane = graphics.drawRect(
                padding,
                padding,
                game.world.width - (2 * padding),
                game.world.height - (2 * padding)
            );
            return graphics;
        }
        function displayFeedback (answer, callback) {

            var panel = drawPanel();
            displayImage(constants.SMILEY);

            // // Kill the panel after some time
            var timer = game.time.create(false);
            timer.add(config.HIDE_FEEDBACK_AFTER, function () {
                // Continue
                (function () {
                    panel.visible = false;
                    callback();
                })();
            });
            timer.start();
        }
        function displayImage (image) {
            console.log(image);
            var panel = drawPanel();
            var sprite = game.add.sprite(
                game.world.width / 2,
                game.world.height / 2,
                image
            );
            sprite.anchor.set(0.5);
            sprite.scale.setTo(0.75);
        }
        function displayError() {
            displayImage(constants.ERROR);
        }
        function displayFinished() {
            displayImage(constants.SMILEY);
        }
        function hide () {
            menu.visible = false;
        }
        function show () {
            menu.visible = true;
            game.world.bringToTop(menu);
        }
        function showDialog (callback) {
            finished = callback;
            show();
        }
        create();
        return {
            displayError: displayError,
            displayFeedback: displayFeedback,
            displayFinished: displayFinished,
            showDialog: showDialog,
            result: function () { return dialogResult; }
        };
    };


    function Recorder () {
        var events = [];
        function clear () {
            events = [];
        }
        function format () {
            function print(event_, index) {
                console.log(event_);
            }
            _.each(events, print);
        }
        function record (data) {
            data.timestamp = new Date();
            events.push(data);
        }
        function records () {
            return events;
        }
        function save (callback) {
            function createXMLHTTPObject (){
                // This should be done with a proper librarty,
                // angular or jQuery
                if (window.XMLHttpRequest)
                {
                    return new XMLHttpRequest();
                }
                return new ActiveXObject("Microsoft.XMLHTTP");
            }
            var method = "POST";
            var url = "/write"
            var request = createXMLHTTPObject();
            if (!request) return;
            request.open(method,url,true);
            request.setRequestHeader('Content-Type','application/json');
            request.onreadystatechange = function () {
                if (request.readyState != 4) return;
                if (request.status != 200 && request.status != 304) {
                    return;
                }
                callback(request);
            }
            if (request.readyState == 4) return;
            request.send(JSON.stringify({data: events}));
        }
        return {
            clear: clear,
            format: format,
            record: record,
            records: records,
            save: save
        }
    }


    function Task () {
        var recorder = new Recorder();
        var menu = new Menu();
        var trials = parseTrials();
        var gameState = new GameState(trials);
        var beach = {};

        function parseTrials () {
            function findOutFileToParse () {
                var trials = constants.TRIALS;
                if(options.training()) {
                    trials = constants.TRAINING;
                }
                return game.cache.getText(trials);
            }
            try {
                var file = findOutFileToParse();
                return JSON.parse(file).trials;
            } catch (e) {
                menu.displayError();
                return {};
            }
        }

        function record (beach, trial, expectedAnswer, givenAnswer)  {
            var data = {
                index: gameState.currentIndex(),
                expectedAnswer: expectedAnswer,
                givenAnswer: givenAnswer,
                number_of_animals: beach.animalCount(),
                number_of_movements: beach.movementCount(),
                number_of_parasols: beach.parasolCount()
            };
            recorder.record(data);
        }

        function displayFeedback (beach, trial, expectedAnswer) {
            return function (givenAnswer) {
                var feedback = constants.NO;
                if(expectedAnswer === givenAnswer){
                    feedback = constants.YES;
                }
                record(beach, trial, expectedAnswer, givenAnswer);
                menu.displayFeedback(feedback, nextTrial);
            }
        }

        function trialFinished (beach, trial, expectedAnswer) {
            // Automatically answer
            if(options.auto()) {
                displayFeedback(beach, trial, expectedAnswer)(constants.YES);
                return;
            }
            menu.showDialog(
                displayFeedback(beach, trial, expectedAnswer)
            );
        }
        function nextOrFromOptions () {
            // Trials start at Index 1 for non CS people
            var trialIndex = options.number() - 1;
            if(gameState.inRange(trialIndex)) {
                return gameState.elementAt(trialIndex);
            }
            return gameState.next();
        }
        function logProgress () {
            var progress = gameState.progress();
            console.log("Trial " + progress.current +  "/" + progress.total);
        }
        function nextTrial () {
            if(gameState.isFinished()) {
                menu.displayFinished();
                console.log("Done.");
                recorder.save(function () {
                    console.log("Saved.");
                });
                return;
            }
            var trial = nextOrFromOptions();
            logProgress();
            var columns = 3;
            var rows = 3;
            var grid = new Grid(columns, rows);
            beach = new Beach(grid, trial, trialFinished);
        }
        if(trials.length > 0)  {
            nextTrial();
        }
    }

    // Main
    game = new Phaser.Game(
        window.innerWidth, // x
        window.innerHeight, // y
        Phaser.AUTO,
        'game',
        {
            preload: function  () {
                assets = new Assets();
                assets.load();
                audio = new Audio();
            },
            create: function () {
                audio.play(constants.SOUND_INTRO);
                task = new Task();
            }
        }
    );

})();