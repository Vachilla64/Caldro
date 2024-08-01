import { checkNaN, getConstructorName } from "./Caldro_Utility_Functions"

function cloneObject(object) {
    // new copy of the object
    const newCopy = {}

    // logping through each "objcet[parameter]" e.g position[x] will get x as the string 'x' that i can use to get position.x but like position['x']
    for (let param in object) {
        /// using the object[param] syntax to get the 
        let value = object[param]

        /// if this object parameter is an object, clone it to avoid pointers and object referencing, this is recursive
        if (typeof value == "object") {
            /// if this is not an array
            if (!(typeof value.__proto__.length == "number")) {
                newCopy[param] = cloneObject(value)
            } else {
                /// if it is an array, recurively clone
                newCopy[param] = new Array()
                for (let i = 0; i < value.length; ++i) {
                    newCopy[param][i] = cloneObject(value[i])
                }
            }
        } else {
            /// primitives are not pointed to so they can be copied without issue
            newCopy[param] = value
        }
    }

    return newCopy
}

function cloneObjectPreserveDestination(object, objectToCopy) {
    for (let param in objectToCopy) {
        let value = objectToCopy[param]
        if (typeof value == "object") {
            if (!object[param]) {
                // console.log(value)

                if (!value) {
                    object[param] = value
                }
                    const valueType = getConstructorName(value)
                    if (valueType == "Array")
                        object[param] = []
                    else  (valueType == "Object")
                        object[param] = {}
                    // else
                        // console.log("Couldnt clone: ", getConstructorName(value), "\n", value, "\n\n not an object or array")

                    cloneObjectPreserveDestination(object[param], value)
                // console.log(object[param] == value)
            } else {
                if(!value){
                    object[param] = value
                    continue;
                }
                /// if the value (typeof object) is not an array but a pure object type
                if (!(typeof value.__proto__.length == "number")) {
                    cloneObjectPreserveDestination(object[param], value)
                } else {
                    // console.log(value)
                    object[param] = new Array()
                    for (let i = 0; i < value.length; ++i) {
                        object[param][i] = {}
                        cloneObjectPreserveDestination(object[param][i], value[i])
                    }
                }
            }
        } else {
            object[param] = value
        }
    }
    // object.__proto__ = objectToCopy.__proto__
}


window.cloneObject = cloneObject


export {
    cloneObject,
    cloneObjectPreserveDestination,

}