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
                for (let item of value) {
                    newCopy[param][item] = cloneObject(value[item])
                }
            }
        } else {
            /// primitives are not pointed to so they can be copied without issue
            newCopy[param] = value
        }
    }

    return newCopy
}

function cloneObjectPreserveReference(object, objectToCopy) {
    for (let param in objectToCopy) {
        let value = objectToCopy[param]
        if (typeof value == "object") {
            if (!object[param]) {
                console.log(getConstructorName(value))
                object[param] = {}
                // cloneObjectPreserveReference(object[param], value)
                console.log(object[param] == value)
            } else {
                /// if the value (typeof object) is not an array but a pure object type
                if (!(typeof value.__proto__.length == "number")) {
                    cloneObjectPreserveReference(object[param], value)
                } else {
                    // console.log(value)
                    object[param] = new Array()
                    for (let i = 0; i < value.length; ++i) {
                        object[param][i] = {}
                        cloneObjectPreserveReference(object[param][i], value[i])
                    }
                }
            }
        } else {
            object[param] = value
        }
    }
    object.__proto__ = objectToCopy.__proto__
}


window.cloneObject = cloneObject


export {
    cloneObject,
    cloneObjectPreserveReference,

}