========================
CODE SNIPPETS
========================
TITLE: Creating and Playing a Phaser Timeline with Initial Event (JavaScript)
DESCRIPTION: This example shows how to instantiate a Phaser Timeline with an initial configuration object, scheduling a function to run at a specific time (1000ms). After creation, the `play()` method is called to start the timeline, which will then execute the `run` callback at the specified `at` time.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/Timeline.md#_snippet_1

LANGUAGE: JavaScript
CODE:
```
const timeline = this.add.timeline({
    at: 1000,
    run: () => {
        this.add.sprite(400, 300, 'logo');
    }
});

timeline.play();
```

----------------------------------------

TITLE: Basic Usage Example of Phaser 3 Camera 3D Plugin
DESCRIPTION: This comprehensive example demonstrates the full lifecycle of using the Camera 3D plugin. It includes game configuration, preloading the plugin and assets, initializing the 3D camera, creating 3D sprites, and continuously transforming them in the update loop.

SOURCE: https://github.com/phaserjs/phaser/blob/master/plugins/camera3d/readme.md#_snippet_3

LANGUAGE: JavaScript
CODE:
```
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var camera;
var transform;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.scenePlugin('Camera3DPlugin', 'plugins/camera3d.min.js', 'Camera3DPlugin', 'cameras3d');

    this.load.image('particle', 'assets/sprites/mushroom2.png');
}

function create ()
{
    camera = this.cameras3d.add(85).setZ(300).setPixelScale(128);

    var sprites = camera.createRect({ x: 4, y: 4, z: 16 }, { x: 48, y: 48, z: 32 }, 'particle');

    //  Our rotation matrix
    transform = new Phaser.Math.Matrix4().rotateX(-0.01).rotateY(-0.02).rotateZ(0.01);
}

function update ()
{
    camera.transformChildren(transform);
}
```

----------------------------------------

TITLE: Installing Dependencies for Spine Runtimes (npm)
DESCRIPTION: This command installs all necessary Node.js dependencies for the Spine Runtimes project, as defined in its `package.json` file. It should be executed within the `spine-runtimes` directory.

SOURCE: https://github.com/phaserjs/phaser/blob/master/plugins/spine/README.md#_snippet_0

LANGUAGE: bash
CODE:
```
npm i
```

----------------------------------------

TITLE: Installing Phaser via npm
DESCRIPTION: This command installs the Phaser game framework as a dependency in your project using the Node Package Manager (npm). It's the recommended way to include Phaser in modern JavaScript/TypeScript development workflows.

SOURCE: https://github.com/phaserjs/phaser/blob/master/README.md#_snippet_1

LANGUAGE: bash
CODE:
```
npm install phaser
```

----------------------------------------

TITLE: Sequencing Multiple Events with Phaser Timeline (JavaScript)
DESCRIPTION: This comprehensive example illustrates how to sequence multiple diverse events within a single Phaser Timeline using an array of configuration objects. It demonstrates scheduling a sprite creation with sound, a tween animation with another sound, and a custom event with property setting, showcasing the Timeline's flexibility for complex game sequences. The timeline is started with `play()` after its definition.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/Timeline.md#_snippet_2

LANGUAGE: JavaScript
CODE:
```
const timeline = this.add.timeline([
    {
        at: 1000,
        run: () => { this.logo = this.add.sprite(400, 300, 'logo'); },
        sound: 'TitleMusic'
    },
    {
        at: 2500,
        tween: {
            targets: this.logo,
            y: 600,
            yoyo: true
        },
        sound: 'Explode'
    },
    {
        at: 8000,
        event: 'HURRY_PLAYER',
        target: this.background,
        set: {
            tint: 0xff0000
        }
    }
]);

timeline.play();
```

----------------------------------------

TITLE: Defining Tween Property with Start and To Values in Phaser
DESCRIPTION: This example shows how to define a tween property using `start` and `to` values. The target's property (e.g., `alpha`) is immediately set to the `start` value (0) as soon as the tween becomes active. It then tweens to the `to` value (1) over the duration of the tween, regardless of any delays. This is useful for setting an immediate initial state.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.19/CHANGELOG-v3.19.md#_snippet_10

LANGUAGE: JavaScript
CODE:
```
alpha: { start: 0, to: 1 }
```

----------------------------------------

TITLE: Installing Spine-TS Dependencies (Shell)
DESCRIPTION: This command installs the necessary Node.js dependencies for the Spine-TS runtime within its specific directory (`spine-runtimes/spine-ts`). It's crucial for building the Spine runtimes correctly.

SOURCE: https://github.com/phaserjs/phaser/blob/master/plugins/spine4.1/README.md#_snippet_1

LANGUAGE: Shell
CODE:
```
npm i
```

----------------------------------------

TITLE: Listening for Tween Start Event in Phaser
DESCRIPTION: This code demonstrates how to subscribe to the `start` event of a Phaser Tween. The `Tween.START_EVENT` is dispatched precisely when the tween begins actively animating its properties, after any initial delays have passed. This event is distinct from `active` and is ideal for actions that should occur only when the visual animation commences.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.19/CHANGELOG-v3.19.md#_snippet_6

LANGUAGE: JavaScript
CODE:
```
tween.on('start')
```

----------------------------------------

TITLE: Initializing a Phaser Game with ESM Imports
DESCRIPTION: This snippet demonstrates how to set up a basic Phaser game using ES Module (ESM) imports. It shows how to import core Phaser classes like `AUTO`, `Scene`, and `Game` directly from the `phaser.esm.js` bundle, allowing for direct browser usage without a separate bundler. The example initializes a `Game` instance with a simple `Scene` that adds text to the display.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/ESMSupport.md#_snippet_0

LANGUAGE: JavaScript
CODE:
```
import { AUTO, Scene, Game } from './phaser.esm.js';

class Test extends Scene
{
    constructor ()
    {
        super();
    }

    create ()
    {
        this.add.text(10, 10, 'Welcome to Phaser ESM');
    }
}

const config = {
    type: AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    scene: [ Test ]
};

const game = new Game(config);
```

----------------------------------------

TITLE: Handling Animation Start Event in Phaser 3
DESCRIPTION: This snippet demonstrates how to listen for the 'animationstart' event on a Game Object (e.g., a Sprite) when its animation begins. This replaces the old global 'onStart' callback, allowing for per-Game Object event handling and providing more granular control over animation events.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.4/CHANGELOG-v3.4.md#_snippet_0

LANGUAGE: JavaScript
CODE:
```
sprite.on('animationstart')
```

----------------------------------------

TITLE: Starting WebGL Capture with Spector.js (Phaser)
DESCRIPTION: Initiates a capture on the Phaser canvas. The capture automatically stops after reaching a specified number of commands or after 10 seconds. The `quickCapture` parameter can be set to `true` to skip thumbnail capture for faster performance.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/Spector.md#_snippet_4

LANGUAGE: JavaScript
CODE:
```
// Capture 100 commands, without quick capture
game.renderer.startCapture(100, false);

// Capture 50 commands, with quick capture (no thumbnails)
game.renderer.startCapture(50, true);
```

----------------------------------------

TITLE: Listening for Tween Loop Event in Phaser
DESCRIPTION: This example shows how to listen for the `loop` event on a Phaser Tween. The `Tween.LOOP_EVENT` is dispatched each time a tween completes a loop and is about to start a new one, specifically after any `loopDelay` has expired. This allows for specific actions to be performed at the beginning of each loop iteration.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.19/CHANGELOG-v3.19.md#_snippet_4

LANGUAGE: JavaScript
CODE:
```
tween.on('loop')
```

----------------------------------------

TITLE: Adding OffscreenCanvas Type Definition (npm)
DESCRIPTION: This command installs the TypeScript type definitions for the `OffscreenCanvas` API as a development dependency. This is crucial for projects using TypeScript that interact with `OffscreenCanvas`.

SOURCE: https://github.com/phaserjs/phaser/blob/master/plugins/spine/README.md#_snippet_1

LANGUAGE: bash
CODE:
```
npm i --save-dev @types/offscreencanvas
```

----------------------------------------

TITLE: Defining Tween Property with Start, From, and To Values in Phaser
DESCRIPTION: This snippet illustrates the most comprehensive way to define a tween property using `start`, `from`, and `to` values. The target's property (e.g., `alpha`) is immediately set to the `start` value (0) upon tween activation. After any delays, it transitions to the `from` value (0.5) and then tweens to the `to` value (1) over the tween's duration. This provides maximum control over initial, pre-tween, and final states.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.19/CHANGELOG-v3.19.md#_snippet_11

LANGUAGE: JavaScript
CODE:
```
alpha: { start: 0, from: 0.5, to: 1 }
```

----------------------------------------

TITLE: Matter.js Comparison Estimates (OCaml Output)
DESCRIPTION: This snippet displays a sample comparison output, likely generated by an OCaml script, showing the similarity, overlap, and filesize changes between `matter-js@0.19.0` and `matter-js@0.20.0`. It also lists various examples with indicators for detected changes (no change, extrinsics changed, intrinsics changed).

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.85/MatterJS.md#_snippet_0

LANGUAGE: OCaml
CODE:
```
Output sample comparison estimates of 44 examples against previous release matter-js@0.19.0:  

Similarity     99.80%    Overlap    -1.92%   Filesize   +3.38%  81.58 KB  

airFriction · · avalanche ● · ballPool ● · bridge ● · car ● · catapult ● · 
chains ● · circleStack · · cloth ● · collisionFiltering ● · compositeManipulation ● · 
compound · · compoundStack ● · concave ● · constraints ● · doublePendulum · · 
events ● · friction · · gravity ● · gyro ● · manipulation ● ◆ 
mixed ● · newtonsCradle · · pyramid ● · ragdoll ● · raycasting ● · 
remove ● ◆ restitution · · rounded ● · sensors · · sleeping ● ◆ 
slingshot ● · softBody ● · sprites ● · stack · · staticFriction ● · 
stats ● · stress ● · stress2 ● · stress3 ● · stress4 ● · 
timescale ● · views ● · wreckingBall ● ·   

where for the sample  · no change detected  ● extrinsics changed  ◆ intrinsics changed
```

----------------------------------------

TITLE: Configuring Global Plugin with Initial Data (JavaScript)
DESCRIPTION: This snippet demonstrates how to configure a global Phaser plugin, passing initial data directly to its 'init' method via the 'data' object. This allows plugins to receive custom parameters upon instantiation, such as game-specific values like starting gold. This configuration is typically part of the Phaser game configuration object.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.12/CHANGELOG-v3.12.md#_snippet_0

LANGUAGE: JavaScript
CODE:
```
{ key: 'BankPlugin', plugin: BankPluginV3, start: true, data: { gold: 5000 } }
```

----------------------------------------

TITLE: Adding Source Map Module (npm)
DESCRIPTION: This command installs the `source-map` module as a development dependency. This module is typically used for generating or consuming source maps, which aid in debugging compiled or transpiled code.

SOURCE: https://github.com/phaserjs/phaser/blob/master/plugins/spine/README.md#_snippet_2

LANGUAGE: bash
CODE:
```
npm i --save-dev source-map
```

----------------------------------------

TITLE: Creating a Basic Phaser Timeline Instance (JavaScript)
DESCRIPTION: This snippet demonstrates the simplest way to create a new instance of the Timeline Class using Phaser's Game Object Factory. The created timeline starts in a paused state and requires an explicit call to its `play()` method to begin execution.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/Timeline.md#_snippet_0

LANGUAGE: JavaScript
CODE:
```
const timeline = this.add.timeline();
```

----------------------------------------

TITLE: Defining Tween Property with From and To Values in Phaser
DESCRIPTION: This snippet demonstrates how to configure a tween property using `from` and `to` values. The target's property (e.g., `alpha`) is initially set to the `from` value (0) and then tweened to the `to` value (1) after any specified delays have expired. This ensures the starting state is applied before the animation begins.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.19/CHANGELOG-v3.19.md#_snippet_9

LANGUAGE: JavaScript
CODE:
```
alpha: { from: 0, to: 1 }
```

----------------------------------------

TITLE: Loading and Displaying Custom Fonts with FontFile in Phaser
DESCRIPTION: This example demonstrates how to load custom TTF/OTF fonts using the new `FontFile` loader in Phaser's `preload` method. Once loaded, these fonts can be applied to `Text` Game Objects in the `create` method by specifying the `fontFamily` in the text style configuration, eliminating the need for external web font loaders or CSS.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.87/CHANGELOG-v3.87.md#_snippet_0

LANGUAGE: JavaScript
CODE:
```
preload ()
{
    this.load.font('Caroni', 'assets/fonts/ttf/caroni.otf', 'opentype');
    this.load.font('troika', 'assets/fonts/ttf/troika.otf', 'opentype');
}

create ()
{
    this.add.text(32, 32, 'The face of the moon was in shadow.', { fontFamily: 'troika', fontSize: 80, color: '#ff0000' });
    this.add.text(150, 350, 'Waves flung themselves at the blue evening.', { fontFamily: 'Caroni', fontSize: 64, color: '#5656ee' });
}
```

----------------------------------------

TITLE: Accessing WebGLRenderer Uniform Function Mappings in Phaser
DESCRIPTION: The `WebGLRenderer.glFuncMap` object, initialized during the renderer's setup, stores mappings between uniform types (e.g., `mat2`) and their corresponding WebGL functions (e.g., `gl.uniformMatrix2fv`). This provides a lookup for uniform handling.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.17/CHANGELOG-v3.17.md#_snippet_8

LANGUAGE: JavaScript
CODE:
```
const uniformFunc = renderer.glFuncMap['mat2'];
```

----------------------------------------

TITLE: Accessing Facebook Instant Games Plugin in Phaser Scene
DESCRIPTION: This example shows how to access the Facebook Instant Games plugin from within a Phaser Scene using `this.facebook`. It specifically demonstrates retrieving the player's name and displaying it as text.

SOURCE: https://github.com/phaserjs/phaser/blob/master/plugins/fbinstant/readme.md#_snippet_2

LANGUAGE: JavaScript
CODE:
```
this.add.text(0, 0).setText(this.facebook.playerName);
```

----------------------------------------

TITLE: Random Start Frame for Animations in Phaser
DESCRIPTION: Both `Animation Config` and `Play Animation Config` now support a `randomFrame` boolean property, defaulting to `false`. When `true`, a random frame from the animation is selected at the start of playback, increasing visual variety for groups of sprites using the same animation. This is also reflected in `Animation.randomFrame` and `AnimationState.randomFrame` properties.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.70/CHANGELOG-v3.70.md#_snippet_8

LANGUAGE: JavaScript
CODE:
```
this.anims.create({
  key: 'walk',
  frames: this.anims.generateFrameNumbers('player'),
  frameRate: 10,
  repeat: -1,
  randomFrame: true // Pick a random frame to start
});

sprite.play({
  key: 'walk',
  randomFrame: true // Pick a random frame to start
});
```

----------------------------------------

TITLE: Using Phaser setInteractive with Multiple Input Properties
DESCRIPTION: This snippet shows how the `setInteractive` method can now accept a single Input Configuration object to set multiple input-related properties simultaneously. This streamlines the setup of interactive Game Objects, allowing properties like `draggable` and `pixelPerfect` to be configured in one call.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.10/CHANGELOG-v3.10.md#_snippet_4

LANGUAGE: JavaScript
CODE:
```
setInteractive({ draggable: true, pixelPerfect: true })
```

----------------------------------------

TITLE: Setting Line Points from Objects in Phaser Geom.Line
DESCRIPTION: The `Geom.Line.setFromObjects` method sets the start and end points of a Line to match those of two provided objects. These objects can be Game Objects or any Vector2-like structure, simplifying line creation from existing entities.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.70/CHANGELOG-v3.70.md#_snippet_15

LANGUAGE: JavaScript
CODE:
```
const line = new Phaser.Geom.Line();
const objA = new Phaser.GameObjects.Sprite(this, 100, 100, 'star');
const objB = new Phaser.Math.Vector2(200, 200);
line.setFromObjects(objA, objB);
```

----------------------------------------

TITLE: Creating DOM Elements with Inline Styles in Phaser 3
DESCRIPTION: This example illustrates how to create a DOM Element Game Object using `this.add.dom` by directly providing an HTML tag, inline CSS styles, and inner text as string arguments. The parameters include the x and y coordinates, the HTML tag ('div'), a CSS style string, and the inner text for the element.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.17/CHANGELOG-v3.17.md#_snippet_2

LANGUAGE: JavaScript
CODE:
```
this.add.dom(x, y, 'div', 'background-color: lime; width: 220px; height: 100px; font: 48px Arial', 'Phaser');
```

----------------------------------------

TITLE: Handling Numeric Keypad Input in Phaser 3
DESCRIPTION: This snippet demonstrates how to listen for numeric keypad keydown events using Phaser's Input Plugin. It shows an example of binding a callback to the 'keydown_NUMPAD_ZERO' event, allowing specific actions to be triggered when the '0' key on the numeric keypad is pressed. This requires the Input Plugin to be active within the scene.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.8/CHANGELOG-v3.8.md#_snippet_0

LANGUAGE: JavaScript
CODE:
```
this.input.keyboard.on('keydown_NUMPAD_ZERO')
```

----------------------------------------

TITLE: Conditional Timeline Events in Phaser
DESCRIPTION: When creating a `TimelineEvent`, an optional `if` callback can now be set. This callback is invoked at the start of the event; if it returns `true`, the event proceeds, otherwise it is skipped. This enables the creation of conditional events within a Timeline.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.70/CHANGELOG-v3.70.md#_snippet_14

LANGUAGE: JavaScript
CODE:
```
timeline.add({
  at: 1000,
  if: () => {
    // Only play sound if player has enough coins
    return player.coins >= 10;
  },
  sound: 'coinSound'
});
```

----------------------------------------

TITLE: Getting Parent Rotation for GameObjects in Phaser
DESCRIPTION: This snippet shows how to use the new `Transform.getParentRotation` method, available to all GameObjects. It returns the cumulative rotation of all of the Game Objects parent Containers, if it has any.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.18/CHANGELOG-v3.18.md#_snippet_16

LANGUAGE: JavaScript
CODE:
```
const totalRotation = gameObject.getParentRotation();
```

----------------------------------------

TITLE: Getting WebGL Canvas FPS (Phaser)
DESCRIPTION: Retrieves the current frames per second (FPS) of the WebGL canvas. This method provides a real-time performance metric, allowing developers to monitor the rendering speed of their game.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/Spector.md#_snippet_2

LANGUAGE: JavaScript
CODE:
```
const fps = game.renderer.getFps();
console.log(`Current FPS: ${fps}`);
```

----------------------------------------

TITLE: Advanced Animation Control for Particles in Phaser
DESCRIPTION: The `anims` property within the `ParticleEmitter` configuration object now accepts a `Phaser.Types.Animations.PlayAnimationConfig` object. This enhancement provides extensive control over particle animations, including options for random start frames, repeat delays, and yoyo effects.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.70/CHANGELOG-v3.70.md#_snippet_9

LANGUAGE: JavaScript
CODE:
```
const emitter = particles.createEmitter({
  frame: 'star',
  x: 400,
  y: 300,
  speed: 200,
  gravityY: 200,
  anims: {
    key: 'sparkle',
    frameRate: 10,
    repeat: -1,
    randomFrame: true,
    yoyo: true
  }
});
```

----------------------------------------

TITLE: Getting Key Hold Duration in Phaser
DESCRIPTION: The `Key.getDuration` method returns the time, in milliseconds, that a specific keyboard key has been held down. If the key is not currently pressed, the method will return 0.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.17/CHANGELOG-v3.17.md#_snippet_3

LANGUAGE: JavaScript
CODE:
```
const duration = myKey.getDuration();
```

----------------------------------------

TITLE: Configuring Staggered Delay with Range in Phaser Tweens
DESCRIPTION: This example shows how to define a staggered delay using a range of values with `this.tweens.stagger`. The provided range (e.g., `[500, 1000]`) will be distributed evenly across all tween targets, assigning a unique delay to each. This allows for more varied and organic staggered animations compared to a fixed delay.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.19/CHANGELOG-v3.19.md#_snippet_1

LANGUAGE: JavaScript
CODE:
```
delay: this.tweens.stagger([ 500, 1000 ])
```

----------------------------------------

TITLE: Listening for Tween Yoyo Event in Phaser
DESCRIPTION: This example illustrates how to subscribe to the `yoyo` event of a Phaser Tween. The `Tween.YOYO_EVENT` is dispatched when a tween property reverses its animation direction (yoyos), specifically after any `holdDelay` has expired. This event is useful for triggering actions when a property begins its reverse animation phase.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.19/CHANGELOG-v3.19.md#_snippet_8

LANGUAGE: JavaScript
CODE:
```
tween.on('yoyo')
```

----------------------------------------

TITLE: Animating a Post-FX Wipe Effect on a Container in Phaser
DESCRIPTION: This example shows how to apply a 'Wipe' post-effect to a Phaser Container and then animate its `progress` property using a tween. The `postFX` property applies effects after the object has been drawn. Tweens allow for smooth, real-time adjustments of effect properties, causing the wipe effect to play out from 0 to 1.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/FX.md#_snippet_1

LANGUAGE: js
CODE:
```
const fx = container.postFX.addWipe();

this.tweens.add({
    targets: fx,
    progress: 1
});
```

----------------------------------------

TITLE: Setting Custom Cursor for Specific Phaser Game Objects
DESCRIPTION: This snippet illustrates how to assign a custom cursor to individual Phaser Game Objects by setting their `input.cursor` property. It accepts any valid CSS cursor string, including image URLs, which will appear when the pointer hovers over that specific Game Object. Examples include using built-in CSS keywords like 'pointer' or 'help', or a custom image URL.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.10/CHANGELOG-v3.10.md#_snippet_2

LANGUAGE: JavaScript
CODE:
```
button.input.cursor = 'pointer'
```

LANGUAGE: JavaScript
CODE:
```
button.input.cursor = 'help'
```

LANGUAGE: JavaScript
CODE:
```
button.input.cursor = 'url(assets/cursors/sword.cur), pointer'
```

----------------------------------------

TITLE: Listening for Tween Active Event in Phaser
DESCRIPTION: This code snippet illustrates how to listen for the `active` event dispatched by a Phaser Tween. The `Tween.ACTIVE_EVENT` is triggered when the Tween Manager brings the tween to life, even if it hasn't started actively tweening values due to delay settings. This allows developers to execute logic precisely when a tween becomes operational.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.19/CHANGELOG-v3.19.md#_snippet_2

LANGUAGE: JavaScript
CODE:
```
tween.on('active')
```

----------------------------------------

TITLE: Creating a New Phaser Game Project with CLI
DESCRIPTION: This command-line interface (CLI) tool, `create-phaser-game`, provides an interactive way to quickly set up a new Phaser project. It allows users to select from official project templates and demo games, downloading and configuring the necessary packages. It supports various package managers like npm, npx, yarn, pnpm, and bun.

SOURCE: https://github.com/phaserjs/phaser/blob/master/README.md#_snippet_0

LANGUAGE: bash
CODE:
```
npm create @phaserjs/game@latest
npx @phaserjs/create-game@latest
yarn create @phaserjs/game
pnpm create @phaserjs/game@latest
bun create @phaserjs/game@latest
```

----------------------------------------

TITLE: Initializing Phaser Game with Facebook Instant Games SDK
DESCRIPTION: This HTML snippet demonstrates the correct way to initialize a Phaser 3 game after the Facebook Instant Games SDK has loaded and `FBInstant.initializeAsync()` has resolved. It ensures the FBInstant API is ready before the game instance is created.

SOURCE: https://github.com/phaserjs/phaser/blob/master/plugins/fbinstant/readme.md#_snippet_1

LANGUAGE: HTML
CODE:
```
<!DOCTYPE html>
<html>
    <head>
        <title>Phaser 3 Facebook Instant Games</title>
        <meta charset="utf-8">
        <script src="https://connect.facebook.net/en_US/fbinstant.6.2.js"></script>
        <script src="lib/phaser-facebook-instant-games.js"></script>
    </head>
    <body>

    FBInstant.initializeAsync().then(function() {

        var config = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            scene: ...
        };

        new Phaser.Game(config);

    });

    </body>
</html>
```

----------------------------------------

TITLE: Building Spine 4.1 Runtimes for Phaser (Shell)
DESCRIPTION: This command initiates the build process for the Spine 4.1 runtimes, compiling them into the designated `plugins/spine4.1/src/runtimes` folder. This step prepares the runtimes for use by the Phaser Spine plugin.

SOURCE: https://github.com/phaserjs/phaser/blob/master/plugins/spine4.1/README.md#_snippet_2

LANGUAGE: Shell
CODE:
```
npm run plugin.spine4.runtimes
```

----------------------------------------

TITLE: Loading Video in Phaser (Before and After API Changes)
DESCRIPTION: This snippet illustrates the simplified video loading process in Phaser. Previously, the `this.load.video` method required five parameters, including `loadEvent` and `asBlob`. The updated API streamlines this by only requiring the video key, URL, and an optional `noAudio` boolean, making video loading more concise.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/VideoGameObject.md#_snippet_0

LANGUAGE: js
CODE:
```
//  Previously you had to do this. Note the 5 paramters:
this.load.video('wormhole', 'wormhole.mp4', 'loadeddata', false, true);

//  Now, you just specify the key, URL and the 'noAudio' boolean:
this.load.video('wormhole', 'wormhole.mp4', true);
```

----------------------------------------

TITLE: Implementing Spatial Sound with Web Audio in Phaser
DESCRIPTION: This snippet demonstrates how to initialize a sound, set the listener's position, and play a sound with spatial properties in Phaser's Web Audio Sound system. It shows how to define the sound's 3D position, reference distance, and make it automatically track a game object's coordinates.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/SpatialSound.md#_snippet_0

LANGUAGE: JavaScript
CODE:
```
this.music = this.sound.add('theme');

this.sound.setListenerPosition(400, 300);

this.music.play({
    loop: true,
    source: {
        x: 400,
        y: 300,
        refDistance: 50,
        follow: this.playerSprite
    }
});
```

----------------------------------------

TITLE: Implementing Preloader Scene for Facebook Instant Games
DESCRIPTION: This Phaser Scene snippet illustrates how to integrate the game's preloader with the Facebook Instant Games loader. It uses `this.facebook.showLoadProgress(this)` to update the Facebook loader and `this.facebook.once('startgame', ...)` to transition to the next scene after loading is complete.

SOURCE: https://github.com/phaserjs/phaser/blob/master/plugins/fbinstant/readme.md#_snippet_3

LANGUAGE: JavaScript
CODE:
```
class Preloader extends Phaser.Scene {

    constructor ()
    {
        super('Preloader');
    }

    preload ()
    {
        this.facebook.showLoadProgress(this);
        this.facebook.once('startgame', this.startGame, this);

        //  Now load all of your assets
    }

    startGame ()
    {
        this.scene.start('MainMenu');
    }

}
```

----------------------------------------

TITLE: Configuring Webpack for Bundled Phaser 3 Camera 3D Plugin (Part 1)
DESCRIPTION: This snippet shows the initial webpack configuration setting for the `PLUGIN_CAMERA3D` flag, which needs to be changed to `true` to include the Camera 3D plugin during the Phaser build process.

SOURCE: https://github.com/phaserjs/phaser/blob/master/plugins/camera3d/readme.md#_snippet_1

LANGUAGE: JSON
CODE:
```
"typeof PLUGIN_CAMERA3D": JSON.stringify(false)
```

----------------------------------------

TITLE: Building Spine Runtimes for Phaser Plugin (npm)
DESCRIPTION: This command executes a custom npm script named `plugin.spine.runtimes`, which is responsible for compiling and building the Spine Runtimes. The output is directed to the `plugins/spine/src/runtimes` folder, preparing them for integration with the Phaser Spine Plugin.

SOURCE: https://github.com/phaserjs/phaser/blob/master/plugins/spine/README.md#_snippet_3

LANGUAGE: bash
CODE:
```
npm run plugin.spine.runtimes
```

----------------------------------------

TITLE: Loading and Displaying a Video Game Object in Phaser 3
DESCRIPTION: This snippet demonstrates how to preload a video file into the Phaser Video Cache and then add it as a Video Game Object to the scene. The `preload` method handles loading the video from a URL, while the `create` method instantiates and displays the video at specified coordinates using its cache key.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.20/CHANGELOG-v3.20.md#_snippet_0

LANGUAGE: javascript
CODE:
```
preload () {
  this.load.video('pixar', 'nemo.mp4');
}

create () {
  this.add.video(400, 300, 'pixar');
}
```

----------------------------------------

TITLE: Configuring Webpack for Bundled Phaser 3 Camera 3D Plugin (Part 2)
DESCRIPTION: This snippet shows the updated webpack configuration setting for the `PLUGIN_CAMERA3D` flag, which must be set to `true` to enable the inclusion of the Camera 3D plugin when Phaser is rebuilt.

SOURCE: https://github.com/phaserjs/phaser/blob/master/plugins/camera3d/readme.md#_snippet_2

LANGUAGE: JSON
CODE:
```
"typeof PLUGIN_CAMERA3D": JSON.stringify(true)
```

----------------------------------------

TITLE: Preloading Phaser 3 Camera 3D Plugin (External)
DESCRIPTION: This snippet demonstrates how to preload the Phaser 3 Camera 3D Plugin when used as an external file. It uses `this.load.scenePlugin` to register the plugin, making it available in the scene.

SOURCE: https://github.com/phaserjs/phaser/blob/master/plugins/camera3d/readme.md#_snippet_0

LANGUAGE: JavaScript
CODE:
```
function preload ()
{
    this.load.scenePlugin('Camera3DPlugin', 'plugins/camera3d.min.js', 'Camera3DPlugin', 'cameras3d');
}
```

----------------------------------------

TITLE: Building Phaser Spine Plugin Distribution (npm)
DESCRIPTION: This command runs the `plugin.spine.dist` npm script, which builds the final distribution version of the Phaser Spine Plugin. This step packages the plugin, including the newly built Spine Runtimes, for use in Phaser projects.

SOURCE: https://github.com/phaserjs/phaser/blob/master/plugins/spine/README.md#_snippet_4

LANGUAGE: bash
CODE:
```
npm run plugin.spine.dist
```

----------------------------------------

TITLE: Configuring TypeScript for Phaser
DESCRIPTION: This JSON snippet shows the necessary configurations to add to your `tsconfig.json` file when working with Phaser in a TypeScript project. It ensures that the TypeScript compiler correctly recognizes Phaser's types and provides proper type checking and autocompletion.

SOURCE: https://github.com/phaserjs/phaser/blob/master/README.md#_snippet_4

LANGUAGE: json
CODE:
```
"lib": ["es6", "dom", "dom.iterable", "scripthost"],
"typeRoots": ["./node_modules/phaser/types"],
"types": ["Phaser"]
```

----------------------------------------

TITLE: Including Phaser from jsDelivr CDN
DESCRIPTION: These script tags allow you to include the Phaser library directly into your HTML file from the jsDelivr Content Delivery Network (CDN). You can choose between the full development version (`phaser.js`) or the minified production version (`phaser.min.js`) for faster loading.

SOURCE: https://github.com/phaserjs/phaser/blob/master/README.md#_snippet_2

LANGUAGE: html
CODE:
```
<script src="//cdn.jsdelivr.net/npm/phaser@3.88.2/dist/phaser.js"></script>
<script src="//cdn.jsdelivr.net/npm/phaser@3.88.2/dist/phaser.min.js"></script>
```

----------------------------------------

TITLE: Advancing Arcade Physics World by a Single Step in Phaser
DESCRIPTION: The `Physics.Arcade.World.singleStep` method advances the Arcade Physics World simulation by exactly one step. This provides fine-grained control over the physics update cycle.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.70/CHANGELOG-v3.70.md#_snippet_1

LANGUAGE: JavaScript
CODE:
```
this.physics.world.singleStep();
```

----------------------------------------

TITLE: Setting Multiple Data Manager Values with an Object - JavaScript
DESCRIPTION: Illustrates the updated `set` method in the Phaser Data Manager, which now accepts an object literal to set multiple key-value pairs simultaneously. This simplifies batch data initialization.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.10/CHANGELOG-v3.10.md#_snippet_11

LANGUAGE: JavaScript
CODE:
```
data.set({ name: 'Red Gem Stone', level: 2, owner: 'Link', gold: 50 })
```

----------------------------------------

TITLE: Optimizing Line Drawing in Phaser Multi Pipeline
DESCRIPTION: The `batchLine` method within the Multi Tint Pipeline now includes a check for zero-length lines (`dxdy len is zero`). If detected, it aborts the drawing process, preventing erroneous line rendering on older Android devices, particularly when drawing stroked rounded rectangles under WebGL.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/WebGLRenderer.md#_snippet_5

LANGUAGE: JavaScript
CODE:
```
batchLine
```

----------------------------------------

TITLE: Loading and Adding GLSL Shaders in Phaser 3
DESCRIPTION: This snippet demonstrates how to preload a GLSL shader file into Phaser's cache and then create a new Shader Game Object in the scene. The `preload` function uses `this.load.glsl` to load the shader, and the `create` function uses `this.add.shader` to instantiate it, specifying its key, position (x, y), and dimensions (width, height).

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.17/CHANGELOG-v3.17.md#_snippet_0

LANGUAGE: JavaScript
CODE:
```
function preload ()
{
    this.load.glsl('fire', 'shaders/fire.glsl.js');
}
 
function create ()
{
    this.add.shader('fire', 400, 300, 512, 512);
}
```

----------------------------------------

TITLE: Updating Arcade Physics Body Pre-Update in Phaser
DESCRIPTION: This snippet highlights the new arguments for `ArcadePhysics.Body.preUpdate`: `willStep` and `delta`. If `willStep` is true, `resetFlags`, sync, and `Body.update` are called; otherwise, only Game Object sync occurs.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.18/CHANGELOG-v3.18.md#_snippet_19

LANGUAGE: JavaScript
CODE:
```
body.preUpdate(willStep, delta);
```

----------------------------------------

TITLE: Building and Developing Phaser Spine 4 Plugin - Shell
DESCRIPTION: These npm scripts are used to build, distribute, watch, and generate runtimes for the Phaser Spine 4.1 plugin. They facilitate development and deployment of the plugin for both canvas and WebGL environments.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/Spine4.md#_snippet_0

LANGUAGE: Shell
CODE:
```
npm run plugin.spine4.1.full.dist
```

LANGUAGE: Shell
CODE:
```
npm run plugin.spine4.1.dist
```

LANGUAGE: Shell
CODE:
```
npm run plugin.spine4.1.watch
```

LANGUAGE: Shell
CODE:
```
npm run plugin.spine4.1.runtimes
```

----------------------------------------

TITLE: Including Phaser from cdnjs CDN
DESCRIPTION: These script tags provide an alternative method to include the Phaser library from Cloudflare's cdnjs Content Delivery Network (CDN). Similar to jsDelivr, you can opt for either the full or minified version of the library for direct use in web pages.

SOURCE: https://github.com/phaserjs/phaser/blob/master/README.md#_snippet_3

LANGUAGE: html
CODE:
```
<script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/3.88.2/phaser.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/3.88.2/phaser.min.js"></script>
```

----------------------------------------

TITLE: Streamlining Sprite Rendering with setQuad in Phaser
DESCRIPTION: The `setQuad` function now consolidates the logic previously handled by `TransformMatrix.getXRound`, `getYRound`, `getX`, and `getY` methods for sprite rendering in the Multi Tint pipeline. This optimization significantly reduces function calls and getters, improving performance when rendering individual sprites.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/WebGLRenderer.md#_snippet_8

LANGUAGE: JavaScript
CODE:
```
setQuad
```

----------------------------------------

TITLE: Migrating Tiled Pick Utility in Phaser
DESCRIPTION: This snippet highlights the removal of `Phaser.Tilemaps.Parsers.Tiled.Pick`. The functionality has been moved to `Phaser.Utils.Objects.Pick` for better logical organization.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.18/CHANGELOG-v3.18.md#_snippet_13

LANGUAGE: JavaScript
CODE:
```
// Old: Phaser.Tilemaps.Parsers.Tiled.Pick
// New: Phaser.Utils.Objects.Pick
```

----------------------------------------

TITLE: Testing TypeScript Project Compilation - Shell
DESCRIPTION: This command compiles a test TypeScript project to check for any compilation errors. Any errors encountered during the compilation process are outputted to the `output.txt` file, aiding in debugging and validation of the generated definitions.

SOURCE: https://github.com/phaserjs/phaser/blob/master/scripts/tsgen/README.md#_snippet_2

LANGUAGE: Shell
CODE:
```
npm run test-ts
```

----------------------------------------

TITLE: Creating Matter.js Game Object with Wrap Bounds in Phaser
DESCRIPTION: This code shows how to create a Matter.js game object, such as an image, and directly apply the `wrapBounds` during its creation. By passing the `wrapBoundary` object in the configuration, the game object will automatically enable the wrapping behavior within the defined boundaries.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.85/MatterWrapBounds.md#_snippet_1

LANGUAGE: JavaScript
CODE:
```
const gameObject = this.matter.add.image(x, y, 'key', null, {
        wrapBounds: wrapBoundary 
    });
```

----------------------------------------

TITLE: Listening for Gamepad Button Events in Phaser
DESCRIPTION: These snippets illustrate two ways to listen for button events. `this.input.gamepad.on('down')` listens for events globally via the Gamepad Plugin, while `gamepadReference.on('down')` allows listening for events directly on a specific `Gamepad` instance.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.10/CHANGELOG-v3.10.md#_snippet_9

LANGUAGE: JavaScript
CODE:
```
this.input.gamepad.on('down')
```

LANGUAGE: JavaScript
CODE:
```
gamepadReference.on('down')
```

----------------------------------------

TITLE: Configuring Webpack for Phaser Facebook Instant Games Plugin
DESCRIPTION: This snippet shows the Webpack DefinePlugin configuration required to include the Facebook Instant Games plugin in a Phaser 3 build. Setting `typeof PLUGIN_FBINSTANT` to `true` ensures the plugin is bundled.

SOURCE: https://github.com/phaserjs/phaser/blob/master/plugins/fbinstant/readme.md#_snippet_0

LANGUAGE: JavaScript
CODE:
```
"typeof PLUGIN_FBINSTANT": JSON.stringify(true)
```

----------------------------------------

TITLE: Simulating WebGL Context Loss and Restore in Phaser (JavaScript)
DESCRIPTION: This snippet demonstrates how to programmatically test WebGL context loss and restoration in a Phaser game. It retrieves the `WEBGL_lose_context` extension and uses `setTimeout` to simulate a context loss after 1 second, followed by a context restore after another 1 second, aiding in debugging and development.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.80/WebGLContextRestore.md#_snippet_0

LANGUAGE: JavaScript
CODE:
```
const webGLLoseContextExtension = game.renderer.getExtension('WEBGL_lose_context');

setTimeout(function () {
    webGLLoseContextExtension.loseContext();
    setTimeout(function () {
        webGLLoseContextExtension.restoreContext();
    }, 1000)
}, 1000);
```

----------------------------------------

TITLE: Building the TypeScript Definition Generator Tool (tsgen) - Shell
DESCRIPTION: This command compiles the `tsgen` parser locally, which is written in TypeScript. It is a prerequisite for generating the TypeScript definition files and only needs to be run once or if the `tsgen` source code itself is modified.

SOURCE: https://github.com/phaserjs/phaser/blob/master/scripts/tsgen/README.md#_snippet_0

LANGUAGE: Shell
CODE:
```
npm run build-tsgen
```

----------------------------------------

TITLE: Configuring Phaser for Legacy Input Queue (JavaScript)
DESCRIPTION: This snippet demonstrates how to configure the Phaser Game object to revert to the legacy input event queue system. By setting 'input.queue' to 'true' in the game configuration, developers can temporarily restore the Phaser 3.15 and earlier input behavior. This option is provided for compatibility but is slated for removal in future versions.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.16/CHANGELOG-v3.16.md#_snippet_0

LANGUAGE: JavaScript
CODE:
```
input: { queue: true }
```

----------------------------------------

TITLE: Optimized Arcade Physics World Update in Phaser
DESCRIPTION: This snippet describes the optimized `ArcadePhysics.World.update` method. It now intelligently determines if a physics step is needed, avoiding unnecessary `World.step` calls and streamlining body processing.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.18/CHANGELOG-v3.18.md#_snippet_20

LANGUAGE: JavaScript
CODE:
```
world.update(time, delta); // Called internally by Phaser
```

----------------------------------------

TITLE: Optimized Arcade Physics World Post-Update in Phaser
DESCRIPTION: This snippet explains the optimized `ArcadePhysics.World.postUpdate` method. It no longer calls `Body.postUpdate` on all of the bodies if no World step has taken place this frame, improving performance.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.18/CHANGELOG-v3.18.md#_snippet_21

LANGUAGE: JavaScript
CODE:
```
world.postUpdate(); // Called internally by Phaser
```

----------------------------------------

TITLE: Loading Image with Normal Map in Phaser
DESCRIPTION: This snippet demonstrates how to load an image asset along with its associated normal map using a configuration object in Phaser's Loader. This method allows for specifying both the main image URL and the normal map URL concisely, providing an alternative to the previous array-based loading method.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.7.1/CHANGELOG-v3.7.1.md#_snippet_0

LANGUAGE: JavaScript
CODE:
```
load.image({ key: 'shinyRobot', url: 'rob.png', normalMap: 'rob_n.png' });
```

----------------------------------------

TITLE: Generating TypeScript Definition Files with tsgen - Shell
DESCRIPTION: This command executes the `tsgen` tool to build the actual TypeScript definition files for Phaser. It replaces the existing file located in the root `types` folder and should be used to re-generate defs after modifying Phaser's source code.

SOURCE: https://github.com/phaserjs/phaser/blob/master/scripts/tsgen/README.md#_snippet_1

LANGUAGE: Shell
CODE:
```
npm run tsgen
```

----------------------------------------

TITLE: Distributing Phaser Spine 4.1 Plugin (Shell)
DESCRIPTION: This command builds and distributes the Phaser Spine 4.1 plugin, creating the final plugin files ready for integration into a Phaser project. This is the last step to make the updated Spine plugin available.

SOURCE: https://github.com/phaserjs/phaser/blob/master/plugins/spine4.1/README.md#_snippet_3

LANGUAGE: Shell
CODE:
```
npm run plugin.spine4.dist
```

----------------------------------------

TITLE: Creating Bitmap Mask via Scene Factory in Phaser
DESCRIPTION: Demonstrates the new method for creating a Bitmap Mask directly from a Phaser Scene's Game Object Factory, simplifying mask instantiation. This allows for easier integration of masks into game objects by providing optional position and texture arguments.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/Masks.md#_snippet_0

LANGUAGE: JavaScript
CODE:
```
const mask = this.add.bitmapMask(x, y, texture, frame);
```

----------------------------------------

TITLE: Setting Multiple Elements in Phaser Structs.Map
DESCRIPTION: The `Structs.Map.setAll` method allows an array of elements to be efficiently set into the Map. This method is chainable, enabling fluent API usage.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.70/CHANGELOG-v3.70.md#_snippet_13

LANGUAGE: JavaScript
CODE:
```
const myMap = new Phaser.Structs.Map();
myMap.setAll(['item1', 'item2', 'item3']);
```

----------------------------------------

TITLE: Loading SVG with Resizing Options in Phaser.js
DESCRIPTION: This snippet demonstrates how to load an SVG file in Phaser.js and optionally resize it during the loading process. You can specify a fixed `width` and `height` in the configuration object to set exact dimensions, or use a `scale` factor to proportionally enlarge or shrink the SVG. This feature is useful for adjusting SVGs with small viewBoxes or optimizing memory usage for large SVGs.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.12/CHANGELOG-v3.12.md#_snippet_1

LANGUAGE: JavaScript
CODE:
```
this.load.svg('morty', 'file.svg', { width: 300, height: 600 })
```

LANGUAGE: JavaScript
CODE:
```
this.load.svg('morty', 'file.svg', { scale: 4 })
```

----------------------------------------

TITLE: Calling Tiled BuildTilesetIndex in Phaser
DESCRIPTION: This snippet shows how to call the `BuildTilesetIndex` function, which is now a public static function within `Phaser.Tilemaps.Parsers.Tiled`.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.18/CHANGELOG-v3.18.md#_snippet_3

LANGUAGE: JavaScript
CODE:
```
Phaser.Tilemaps.Parsers.Tiled.BuildTilesetIndex()
```

----------------------------------------

TITLE: Importing Phaser in a Web Worker - JavaScript
DESCRIPTION: This snippet demonstrates the method to import the Phaser library within a Web Worker. It's a prerequisite for running Phaser in a worker thread, enabling off-main-thread processing. This specific approach is used when the worker is created with `type: 'classic'`.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.53/CHANGELOG-v3.53.md#_snippet_0

LANGUAGE: JavaScript
CODE:
```
importScripts('phaser.js')
```

----------------------------------------

TITLE: Checking out Spine Runtimes Version 4.1 (Shell)
DESCRIPTION: This command switches the current branch of the cloned Spine Runtimes repository to version 4.1, ensuring compatibility with the Phaser Spine 4.1 plugin. It's a prerequisite for building the correct runtimes.

SOURCE: https://github.com/phaserjs/phaser/blob/master/plugins/spine4.1/README.md#_snippet_0

LANGUAGE: Shell
CODE:
```
git checkout 4.1
```

----------------------------------------

TITLE: Calling Tiled AssignTileProperties in Phaser
DESCRIPTION: This snippet shows how to call the `AssignTileProperties` function, which is now a public static function within `Phaser.Tilemaps.Parsers.Tiled`.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.18/CHANGELOG-v3.18.md#_snippet_1

LANGUAGE: JavaScript
CODE:
```
Phaser.Tilemaps.Parsers.Tiled.AssignTileProperties()
```

----------------------------------------

TITLE: Accessing Specific Gamepads in Phaser
DESCRIPTION: This snippet demonstrates how to directly access a connected gamepad using the new `GamepadPlugin`. The `pad1` property provides direct access to the first connected gamepad, simplifying input handling for specific controllers.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.10/CHANGELOG-v3.10.md#_snippet_5

LANGUAGE: JavaScript
CODE:
```
this.input.gamepad.pad1
```

----------------------------------------

TITLE: Setting Default Game Object Pipeline in Phaser
DESCRIPTION: This Game Configuration property allows developers to specify the default rendering pipeline for Game Objects. By default, it's set to the Multi Tint pipeline, but it can be customized to use any other pipeline, including a custom one, influencing how Game Objects are rendered across the game.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/WebGLRenderer.md#_snippet_2

LANGUAGE: JavaScript
CODE:
```
defaultPipeline
```

----------------------------------------

TITLE: Configuring Webpack for Sound Feature Exclusion in Phaser
DESCRIPTION: A new Webpack configuration option, `FEATURE_SOUND`, allows developers to control the inclusion of the Sound Manager and its related systems in the build. Setting this option to `false` will exclude sound functionalities, reducing the final build size.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.17/CHANGELOG-v3.17.md#_snippet_5

LANGUAGE: JavaScript
CODE:
```
// webpack.config.js
const webpack = require('webpack');

module.exports = {
  // ... other configs
  plugins: [
    new webpack.DefinePlugin({
      'FEATURE_SOUND': JSON.stringify(false)
    })
  ]
};
```

----------------------------------------

TITLE: Querying Gamepad Button Values and Totals in Phaser
DESCRIPTION: These methods allow querying the state of individual buttons and the total number of buttons available on a connected gamepad. `getButtonValue()` retrieves the current value of a specific button, while `getButtonTotal()` returns the count of all buttons.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.10/CHANGELOG-v3.10.md#_snippet_6

LANGUAGE: JavaScript
CODE:
```
Gamepad.getButtonValue()
```

LANGUAGE: JavaScript
CODE:
```
Gamepad.getButtonTotal()
```

----------------------------------------

TITLE: Creating Bitmap Mask on Game Object in Phaser
DESCRIPTION: Illustrates how to create a Bitmap Mask for an existing Game Object using its `createBitmapMask` method. This update allows passing texture and frame parameters directly, streamlining the process of applying a textured mask to a game object.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/Masks.md#_snippet_1

LANGUAGE: JavaScript
CODE:
```
const gameObject = this.add.image(0, 0, 'myImage');
const mask = gameObject.createBitmapMask(x, y, 'maskTexture', 'maskFrame');
```

----------------------------------------

TITLE: Configuring Auto Mobile Pipeline in Phaser
DESCRIPTION: This boolean property in the Game Configuration controls whether the Mobile Pipeline is automatically deployed by Phaser. When set to `true` (default), Phaser attempts to use the Mobile Pipeline for performance. Setting it to `false` forces the use of the Multi Tint pipeline or allows for custom pipeline deployment logic.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/WebGLRenderer.md#_snippet_1

LANGUAGE: JavaScript
CODE:
```
autoMobilePipeline
```

----------------------------------------

TITLE: Setting and Accessing Data Manager Values - JavaScript
DESCRIPTION: Demonstrates how to set a single value in the Phaser Data Manager using the `set` method and how to access and modify it directly via the new `values` property. This allows for easier conditional checks and direct manipulation of stored data.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.10/CHANGELOG-v3.10.md#_snippet_10

LANGUAGE: JavaScript
CODE:
```
data.set('gold', 50)
```

LANGUAGE: JavaScript
CODE:
```
data.values.gold
```

LANGUAGE: JavaScript
CODE:
```
if (data.values.level === 2)
```

LANGUAGE: JavaScript
CODE:
```
data.values.gold += 50
```

----------------------------------------

TITLE: Updating Arcade StaticBody Size in Phaser
DESCRIPTION: This snippet illustrates the updated arguments for `Arcade.StaticBody.setSize`. The method now accepts `(width, height, center)` to align with Dynamic Body and Size Component methods.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.18/CHANGELOG-v3.18.md#_snippet_15

LANGUAGE: JavaScript
CODE:
```
staticBody.setSize(width, height, true); // Example with center argument
```

----------------------------------------

TITLE: Retrieving All Keys from a Phaser Cache
DESCRIPTION: The `BaseCache.getKeys` method provides a way to retrieve an array of all keys currently in use within a specific cache instance. This is useful for inspecting cache contents or iterating through cached assets.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.17/CHANGELOG-v3.17.md#_snippet_9

LANGUAGE: JavaScript
CODE:
```
const shaderKeys = this.cache.shader.getKeys();
```

----------------------------------------

TITLE: Simplifying Shader Max Texture Check in Phaser WebGL
DESCRIPTION: The `WebGL.Utils.checkShaderMax` function has been refactored to directly use `gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)` instead of a large `if/else` GLSL shader check. This streamlines the process of determining the maximum texture units supported by the WebGL context.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/WebGLRenderer.md#_snippet_7

LANGUAGE: JavaScript
CODE:
```
WebGL.Utils.checkShaderMax
```

----------------------------------------

TITLE: Calling Tiled Base64Decode in Phaser
DESCRIPTION: This snippet shows how to call the `Base64Decode` function, which is now a public static function within `Phaser.Tilemaps.Parsers.Tiled`.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.18/CHANGELOG-v3.18.md#_snippet_2

LANGUAGE: JavaScript
CODE:
```
Phaser.Tilemaps.Parsers.Tiled.Base64Decode()
```

----------------------------------------

TITLE: Setting Precision for Multi Tint Fragment Shader
DESCRIPTION: The `Multi.frag` shader now defaults to `highp` precision for improved rendering quality. If `highp` is not supported by the device, it gracefully falls back to `mediump`, ensuring compatibility while maximizing visual fidelity for the Multi Tint pipeline.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/WebGLRenderer.md#_snippet_6

LANGUAGE: GLSL
CODE:
```
Multi.frag
```

----------------------------------------

TITLE: Calling Tiled ParseTilesets in Phaser
DESCRIPTION: This snippet shows how to call the `ParseTilesets` function, which is now a public static function within `Phaser.Tilemaps.Parsers.Tiled`.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.18/CHANGELOG-v3.18.md#_snippet_10

LANGUAGE: JavaScript
CODE:
```
Phaser.Tilemaps.Parsers.Tiled.ParseTilesets()
```

----------------------------------------

TITLE: Calling Tiled ParseGID in Phaser
DESCRIPTION: This snippet shows how to call the `ParseGID` function, which is now a public static function within `Phaser.Tilemaps.Parsers.Tiled`.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.18/CHANGELOG-v3.18.md#_snippet_4

LANGUAGE: JavaScript
CODE:
```
Phaser.Tilemaps.Parsers.Tiled.ParseGID()
```

----------------------------------------

TITLE: Enabling Pixel-Perfect Input for Phaser Game Objects
DESCRIPTION: This snippet demonstrates two ways to enable pixel-perfect input for a Phaser Game Object. The first uses `this.input.makePixelPerfect()` directly, while the second uses the `pixelPerfect: true` property within the `setInteractive` configuration object. This feature allows input checks to be performed against the texture's pixel data, requiring an optional alpha tolerance level. It's an expensive process and should be used judiciously.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.10/CHANGELOG-v3.10.md#_snippet_0

LANGUAGE: JavaScript
CODE:
```
this.add.sprite(x, y, key).setInteractive(this.input.makePixelPerfect())
```

LANGUAGE: JavaScript
CODE:
```
setInteractive({ pixelPerfect: true })
```

----------------------------------------

TITLE: Controlling Size and Origin Update with setTexture in Phaser
DESCRIPTION: The `GameObject.setTexture` method now includes optional `updateSize` and `updateOrigin` parameters. These booleans, passed to `setFrame`, control whether the Game Object's size and origin are automatically updated when its texture is changed.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.70/CHANGELOG-v3.70.md#_snippet_7

LANGUAGE: JavaScript
CODE:
```
gameObject.setTexture('newTextureKey', 'frameName', false, false); // Don't update size or origin
```

----------------------------------------

TITLE: Calling Tiled ParseTileLayers in Phaser
DESCRIPTION: This snippet shows how to call the `ParseTileLayers` function, which is now a public static function within `Phaser.Tilemaps.Parsers.Tiled`.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.18/CHANGELOG-v3.18.md#_snippet_9

LANGUAGE: JavaScript
CODE:
```
Phaser.Tilemaps.Parsers.Tiled.ParseTileLayers()
```

----------------------------------------

TITLE: Fixing Keyboard Input Spacing in Phaser
DESCRIPTION: This snippet illustrates the `keyboard.addKeys` method in Phaser. Previously, providing a string with spaces between key characters (e.g., 'W, A, S, D') would cause the method to fail. The updated implementation now trims the input, allowing for more flexible string formatting.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.12/CHANGELOG-v3.12.md#_snippet_2

LANGUAGE: JavaScript
CODE:
```
keyboard.addKeys("W, A, S, D")
```

----------------------------------------

TITLE: Calling Tiled ParseJSONTiled in Phaser
DESCRIPTION: This snippet shows how to call the `ParseJSONTiled` function, which is now a public static function within `Phaser.Tilemaps.Parsers.Tiled`.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.18/CHANGELOG-v3.18.md#_snippet_6

LANGUAGE: JavaScript
CODE:
```
Phaser.Tilemaps.Parsers.Tiled.ParseJSONTiled()
```

----------------------------------------

TITLE: Controlling Light Iteration with uLightCount Uniform
DESCRIPTION: The `Light.frag` shader now uses the `uLightCount` uniform to dynamically determine when to stop iterating through the maximum number of lights. This allows for efficient processing of varying numbers of active lights without recompiling the shader.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/WebGLRenderer.md#_snippet_11

LANGUAGE: GLSL
CODE:
```
undefined
```

----------------------------------------

TITLE: Changing Default Game Object Pipeline in Phaser
DESCRIPTION: This method allows dynamic modification of the default Game Object pipeline at runtime. It provides fine-grained control over which pipeline (e.g., Multi Tint, Mobile, or custom) Game Objects will use, enabling conditional rendering adjustments based on game state or device capabilities.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/WebGLRenderer.md#_snippet_4

LANGUAGE: JavaScript
CODE:
```
PipelineManager.setDefaultPipeline
```

----------------------------------------

TITLE: Applying Fill-Based Tint to Tilemap Layers in Phaser
DESCRIPTION: The new `TilemapLayer.setTintFill` method applies a fill-based tint to tiles within a specified area, contrasting with the additive tint applied by `setTint`. This offers a different visual effect for coloring tiles.

SOURCE: https://github.com/phaserjs/phaser/blob/master/changelog/3.70/CHANGELOG-v3.70.md#_snippet_10

LANGUAGE: JavaScript
CODE:
```
tilemapLayer.setTintFill(0xff0000, 0, 0, 10, 10); // Tint a 10x10 area red with fill tint
```