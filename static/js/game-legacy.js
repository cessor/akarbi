// This resides here for legacy purposes
function __moveAnimal (from, to, animal_name) {
    var start_position = from;
    var end_position = to;

    var group = game.add.group();
    //group.alpha = 0;
    var animal = group.create(start_position.x, start_position.y, animal_name);
    animal.width = config.ANIMAL_WIDTH;
    animal.height = config.ANIMAL_HEIGHT;

    var jump = game.add.tween(animal).to({y: 30}, 400, function (v) { return Math.sin(v * Math.PI) * 0.5; }, 0, 0, Number.MAX_VALUE, 0);
    var diagonal = game.add.tween(group).to(end_position, 1000, Phaser.Easing.Linear.None, 0, 0, 0, 0);
    diagonal.onComplete.addOnce(function () { jump.stop(); });
    jump.start();
    diagonal.start();
};


function fullscreen () {
    // http://examples.phaser.io/_site/view_full.html?d=display&f=fullscreen.js&t=fullscreen
    if (game.scale.isFullScreen) {
        game.scale.stopFullScreen();
    }
    else {
        game.scale.startFullScreen();
    }
};