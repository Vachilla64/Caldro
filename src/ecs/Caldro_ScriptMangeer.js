export const ScriptManager = {
    /// this object contains all scripts, having keys as script names and values as the scripts themselves
    /// basically, when a standalone JS file creates an new script instance
    /// that script will be registerd here, so the user will not have to manuall register the script
    /// TDLR: Keeps track of scripts and their ID to allow entities to call them by ID / Name
    ///       and helps to reattach functionalyt to entities after deserialization
    /// TODO; might change this to a map
    scriptRegistry: {},


    /// updated functions reference map
    functionMap: new Map(),

    hasScript(scriptName) {
        return Object.hasOwn(scriptName)
    },
    getScript(scriptName) {
        return this.scriptRegistry[scriptName]
    },
    registerScript(script) {
        if (ScriptManager.hasScript(script.name)) throw `A script with the name "${name}' has already been created and registered`
        else
            this.scriptRegistry[script.name] = script
    },
    forEachScriptOfEntity(entity, operation) {

    },
    updateFunctionMap(methodType, scriptName) {
        const map = this.functionMap
        /// if this is the first time we are reginstering this function type
        if (!map.has(methodType)) {
            map.set(methodType, [
                scriptName
            ])
        } else {
            map.get(methodType).push(scriptName)
        }
    },
    getBehavioursWithMethod(method) {
        return this.functionMap.get(method)
    },
    getBehavioursInListWithMethod(behaviorList, method) {
        /// all behavious that have the given method
        if(behaviorList.length==0) return
        let allBehaviors = this.getBehavioursWithMethod(method)
        if(!allBehaviors) return

        /// all behavious that have the given method annnnddd are in the behaviour list passed to the function
        const behavioursWithMethod = new Array();
        for (let behaviour of behaviorList) {
            if (allBehaviors.includes(behaviour))
                behavioursWithMethod.push(behaviour)
        }

        return behavioursWithMethod;
    },

    forEachEntityScriptWithMethod(entityBehavioursList, method, callback) {
        let scriptNames = this.getBehavioursInListWithMethod(entityBehavioursList, method)
        if (scriptNames) {
            scriptNames.forEach((scriptName) => {
                const script = this.getScript(scriptName)
                callback(script)
            })
        }
    }
}

window.ScriptManager = ScriptManager