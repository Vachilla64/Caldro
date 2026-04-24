import { Camera, CURRENT_CAMERA, setCurrentCamera } from "./Caldro_Camera";
import { ClassicPhysicsWorld } from "./Caldro_ClassicPhysics";
import { NULLFUNCTION } from "./Caldro_Utility_Constants";
import { clip } from "./Caldro_Math";


class Scene {
    constructor(name = "") {
        this.name = name;
        this.initialized = false;
        this.paused = false;
        this.camera = new Camera();
        this.world = new ClassicPhysicsWorld();
        this.elapsedTime = 0;
        this.pauseable = false;
        this.pausedByUser = false;
        this.physicsBodies = [];
        this.processInput = true;

        SceneManager.addScene(this)
    };
    isPaused = () => { return this.paused; }
    onLoad() { };
    onUpdate() { };
    ; onEveryFrame() { }
    onRender() { };
    preRender() { };
    postRender() { };
    onUnload() { };
    pause() {
        this.paused = true;
    }
    resume() {
        this.paused = false;
    }
}


/**
 * @param {*function} event1 A function that will run at the very start of the transition
 * @param {*function} leavingTransition A rendering function that takes a 'time' parameter (scaled down to 0-1). This will keep running till the first half of the total transition time is used up and it's time to actually change the scene
 * @param {*function} event2 A function that will run at the very end of the leavingTransition rendering, just before the enteringTransition. This function is expected to be used to actually change the Scene
 * @param {*function} enteringTransition A rendering function that takes a 'time' parameter (scaled down to 0-1). This will keep running till the second half of the total transition time is used up and the transition is finally over, usually will have a similar rendering with the 'leavingTransition'
 * @param {*function} event3 A function that will run at the very end of the transition, after enteringTransition is finished
 * @param {*function} delay delay in seconds before starting the enteringTransition
 */
class TransitionScreen {
    constructor(event1, leavingTransition, event2, enteringTransition, event3, transitionTime = 2, delay = 0) {
        this.firedStartingOfFirstTransitionEvent = this.firedMiddleEvent = this.firedEndingOfSecondTransitionEvent = false
        this.running = false;
        this.resetOnFinish = true;
        this.paused = false;
        this.time = 0;
        this.delay = delay;

        this.transitionTime = transitionTime;
        this.event1 = event1 || NULLFUNCTION;
        this.event2 = event2 || NULLFUNCTION;
        this.event3 = event3 || NULLFUNCTION;
        this.leavingTransition = leavingTransition;
        this.enteringTransition = enteringTransition;
    }
    onTransitionMidway() { };
    update(deltatime) {
        if (!this.running) return;
        if (!this.paused) this.time += deltatime;

        if (this.time >= this.transitionTime) {
            if (!this.firedEndingOfSecondTransitionEvent) {
                this.event3();
                this.firedEndingOfSecondTransitionEvent = true;
                this.running = false;
                return;
                // if (this.resetOnFinish) this.reset(); 
                // causes issues with disablking and enablesing user input durting a transition
            }
        }

        if (this.time <= this.transitionTime / 2) { // during first transition
            if (!this.firedStartingOfFirstTransitionEvent) {
                this.event1();
                this.firedStartingOfFirstTransitionEvent = true
            }
            // this.leavingTransition(clip(this.time / (this.transitionTime / 2)), 0, 1) // normalized time ( 0 - 1 )
        } else {
            if (!this.firedMiddleEvent) {
                this.event2();
                this.onTransitionMidway()
                this.firedMiddleEvent = true
            }
            // this.enteringTransition(clip((this.time - (this.transitionTime / 2)) / (this.transitionTime / 2), 0, 1)) // normalized time ( 0 - 1 )
        }
    }

    render() {
        if (!this.running) return;
        if (this.time < this.transitionTime / 2) { // during first transition
            this.leavingTransition(clip(this.time / (this.transitionTime / 2)), 0, 1) // normalized time ( 0 - 1 )
        } else {
            this.enteringTransition(clip((this.time - (this.transitionTime / 2)) / (this.transitionTime / 2), 0, 1)) // normalized time ( 0 - 1 )
        }
    }

    reset() {
        this.time = 0;
        // this.delay = delay
        this.firedStartingOfFirstTransitionEvent = this.firedMiddleEvent = this.firedEndingOfSecondTransitionEvent = false
    }
    start() {
        this.reset();
        this.running = true;
    }
    pause() {
        this.paused = true;
    }
    resume() {
        this.paused = false;
    }

    leavingTransition() { };
    enteringTransition() { };
    event1() { };
    event2() { };
    event3() { };
}



const SceneManager = {
    scenes: new Array(),
    currentCamera: null,
    currentScene: null,
    currentTransitionScreen: new TransitionScreen(),
    resizeScreen: true,
    renderAlpha: 1,
    updatesPerUpdate: 1,
    addScene(scene) {
        this.scenes.push(scene)
    },
    update(deltatime) {
        if (!this.currentScene) this.startScene(this.currentScene)

        this.currentScene.onEveryFrame();

        for (let u = 0; u < this.updatesPerUpdate; ++u) {
            if (this.currentScene.isPaused()) return false;
            this.currentScene.elapsedTime += deltatime;
            this.currentScene.onUpdate(deltatime);
            this.currentTransitionScreen?.update(deltatime)
        }
    },
    preRender() { },
    postRender() { },
    render() {
        this.preRender();
        if (this.currentScene) {
            this.currentScene.preRender();

            CURRENT_CAMERA.start();
            this.currentScene.onRender();
            CURRENT_CAMERA.end();

            this.currentScene.postRender();
        }
        // Caldro.screen.showPointers()
        this.postRender();
        this.currentTransitionScreen?.render();
    },
    startScene(targetScene) {
        if (!targetScene) return;
        if (this.currentScene) {
            this.currentScene.onUnload();
            for (let body of this.currentScene.physicsBodies) {
                targetScene.world.removeBody(body)
            }
        }
        targetScene.elapsedTime = 0
        setCurrentCamera(targetScene.camera)
        this.currentScene = targetScene;
        for (let body of this.currentScene.physicsBodies) {
            targetScene.world.addBody(body)
        }
        targetScene.onLoad();
        // SceneManager.preRender();
        // SceneManager.postRender();
    },
    startTransitionScreen(transition, nextScene, onChangeCallback) {
        this.currentTransitionScreen = transition;
        transition.start();
        this.currentTransitionScreen.onTransitionMidway = () => {
            this.startScene(nextScene)
            onChangeCallback?.()
        }
    },
    reloadCurrentScene() {
        this.startScene(this.currentScene)
    }
}
window.SceneManager = SceneManager

var DefaultScene = new Scene("DefaultScene");
SceneManager.startScene(DefaultScene)

SceneManager.preRender = function () {

}

SceneManager.postRender = function () {

}




export {
    Scene, SceneManager, TransitionScreen
}
