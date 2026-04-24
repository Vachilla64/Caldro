import { psuedoUUID } from "../Caldro_Utility_Functions"
import { ScriptManager } from "./Caldro_ScriptMangeer"

// a behavior script class
/// This class can act like a component, but unlike others it will not be serialized
/// these components are created on each startup of the game and linked to their entities
/// by the script manager
class BehaviourScript {
    constructor(name) {
        if (!name) throw SyntaxError("No name was defined for this script, it will be unable to be referenced")
      
        this.name = name
        this.ID = psuedoUUID();
        ScriptManager.registerScript(this)


        return new Proxy(this, {
            set: (target, property, value) => {
                // console.log(`Property "${property}" is being set to`, value);

                // console.log(`Caching or registering method "${property}"`);
                ScriptManager.updateFunctionMap(property, this.name)

                target[property] = value;
                return true;
            },
            get: (target, property) => {
                // console.log(`Accessing property "${property}"`);
                return target[property];
            },
        });
    }

    //// these are all default behaviours, can be  edited for each script instance
    //// they will be called by the systes hadling the entities
    /// this is gonna be hella long soon

    /// ___ECS MANAGER CALLS___
    onAdd(entitiy) { };
    onRemove(entity) { };

    /// ___ENGINE UPDATE CALLS___
    update(entitiy, deltatime) { };
    fixedUpdate(entity, deltatime) { };

    /// ___ENGINE RENDER CALLS___
    render(entity) { };

    /// ___RIGIDBODY CALLS____
    preCollision(body) { };
    onCollisionStart(body, collisionInformation) { };
    onCollisionContinue(body, collisionInformation) { };
    onCollisionEnd(body, collisionInformation) { };
    beforePhysicsUpdate(deltatime) { };
    onPhysicsUpdate(deltatime) { };
}

export default BehaviourScript;


const behaviorHandler = {
    set(target, property, value) {

    }
}