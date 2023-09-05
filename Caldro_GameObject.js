    "use strict"; // Game_Objects

class GameObjectComponent {
    constructor() {

    }
    affectGameObject(GameObject) {

    }
}

class transformComponent extends GameObjectComponent {
    constructor() {
        super();
        this.position = new Lvector3D(0, 0, 0)
        this.rotation = 0;
        this.scale = new Lvector3D(100, 100, 100)
    }
}

class colliderComponent extends GameObjectComponent {
    constructor() {
        super();
        this.collider = new boxCollider2D();
    }
    setToGameObject(gameObject) {
        let transform = gameObject.getComponent("transformComponent")
        this.gameObject = gameObject;
        place(this.collider, transform.position)
        this.collider.width = transform.scale.x
        this.collider.height = transform.scale.y
    }
}

class rendererComponent extends GameObjectComponent {
    constructor() {
        super()
        this.color = "white"
        this.img = null;
    }
    render(x, y, width, height, rotation) {
        Rect(x, y, width, height, this.color, rotation)
    }
}

class componentMap {
    constructor(gameObject) {
        this.gameObject = gameObject;
        this.hasTransformComponent = true
        this.hasColliderComponent = false;
    }
}

class GameObject {
    constructor() {
        this.id = generateRandomId(); 
        this.components = new Array();
        this.components.length = 0
        this.componentMap = new componentMap(this);
        this.addComponent("transformComponent", new transformComponent());
        if(CALDRO_GAME_OBJECT_MANAGER.autoAdd){
            CALDRO_GAME_OBJECT_MANAGER.addGameObject(this)
        }
    }
    addComponent(componentName, component) {
        if (CALDRO_GAME_OBJECT_MANAGER.isAComponent(getConstructorName(component))) {
            this.components[componentName] = component
            ++this.components.length;
            return true;
        } else {
            console.error("Game Object error: '" + componentName + "' is not a componentName\nActual component names are: " + CALDRO_GAME_OBJECT_MANAGER.componentNames)
            return false;
        }
    }
    add(component) {
        this.components[getConstructorName(component)] = component
    }
    getComponent(componentName) {
        let component = this.components[componentName]
        if (component) {
            return component;
        } else {
            if (!CALDRO_GAME_OBJECT_MANAGER.isAComponent(componentName)) {
                console.error("Game Object error: '" + componentName + "' is not a componentName\nActual component names are: " + CALDRO_GAME_OBJECT_MANAGER.componentNames)
            }
            return undefined;
        }
    }
    deleteComponent(componentName) {
        --this.components.length;
        this.getComponent(componentName) = undefined;
    }

    start() { };
    update() { };
    render() { };
}





const Physics = new colliderResolutionEngine2D();

const CALDRO_GAME_OBJECT_MANAGER = {
    gameObjects: new Array(),
    prefabs: new Array(),
    physicsEngine: new colliderResolutionEngine2D(),
    autoAdd: false,
    componentNames: [
        "transformComponent",
        "colliderComponent",
        "rendererComponent",
    ],
    isAComponent(componentName) {
        return this.componentNames.includes(componentName)
    },
    isGameObject(gameObject) {
        return getConstructorName(gameObject) == "GameObject";
    },
    addGameObject(gameObject) {
        if (getConstructorName(gameObject) != "GameObject") {
            console.error("Game Object Manager error: object is not a 'GameObject'");
            return;
        }
        this.gameObjects.push(gameObject);
    },
    createPrefab(prefabName, gameObject) {
        if (this.isGameObject(gameObject)) {
            let comps = new Array();
            this.prefabs[prefabName] = {
                components: arrUtils.copy([gameObject.components])
            }
        } else {
            console.error("Game Object Manager error: gameObject (argument 2) is not a game object")
        }
    },
    loadPrefab(prefabName) {
        let prefab = this.prefabs[prefabName]
        if (prefab) {
            let object = new GameObject();
            object.components = arrUtils.copy(prefab.components[0])
            console.log(prefab.components[0])
            return object;
        }
    },
    updateAll: function () {
        let collidableObjects = new Array(); //
        let GOM = this

        this.physicsEngine.deleteAllBodies();
        for (let object of this.gameObjects) {
            object.update();
            // let rigid = object.getComponent("rigidBodyComponent");
            // if(rigid){
                
            // }
            let collider = object.getComponent("colliderComponent");
            if (collider) {
                collidableObjects.push(collider)
                place(collider.collider, collider.gameObject.getComponent("transformComponent").position)
                this.physicsEngine.addBody(collider.collider)
            }
        }
        
        this.physicsEngine.resolveColliders();
        for (let i = 0; i < collidableObjects.length; ++i) {
            place(collidableObjects[i].gameObject.getComponent("transformComponent").position, GOM.physicsEngine.bodies[i])
            // place(collidableObjects[i].gameObject.getComponent("transformComponent").position, GOM.physicsEngine.bodies[i])
        }
    },

    renderAll: function () {
        for (let i = 0; i < this.gameObjects.length; ++i) {
            let object = this.gameObjects[i]
            let transform = object.getComponent("transformComponent")
            let renderer = object.getComponent("rendererComponent")
            if (renderer) {
                renderer.render(transform.position.x, transform.position.y, transform.scale.x, transform.scale.y, transform.rotation)
            } else {
                object.render();
            }
        }

        Caldro.renderer.context.save()
        Caldro.renderer.context.globalCompositeOperation = "darker"
        this.physicsEngine.renderColliders();
        Caldro.renderer.context.restore()
    },
}
