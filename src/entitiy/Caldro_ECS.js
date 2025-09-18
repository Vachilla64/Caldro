var NextEntityID = 0

class ECS {
    constructor() {
        /// this is an Array of IDs
        this.entities = new Array();

        /// object of all component Arrays, key is component type
        this.conponentArrays = {}

        /// groups that make entity lookups faster
        this.entityGroups = {}
    }

    createEntity() {
        return ++NextEntityID;
    }

    addComponentToEntity(entity, component){
        
    }
}


export class ComponentArray {
    constructor(type) {
        /// tightly packed data, no spaces
        this.components = new Array();

        /// this is a map where "indexMap[EntityID] = "Index of component data in the data array above"
        this.indexMap = new Array();
        
        /// this is is a map where the key is the entityID and the Value is the index of the component in the component Array
        /// basiclaly the reverse of the indexMap
        this.componentIndexToEntityIDMap = new Array();

        /// this is the type of component
        this.type = type;

        /// this is the size of the component array, not the indexMap
        this.size = 0;

    }

    /// index will refer to the entity ID, and the data will be the component
    add(entityID, component) { 
        /// index must be defined
        if (isNaN(entityID))
            console.error("entityID is NaN: " + entityID)

        /// components are added to the component array, regardless of order or index
        this.components.push(component);

        /// the indexMap is updata, to "this.size" before we updata it, same as "this.data.length -1" after we alrady push the data, which we have   
        this.indexMap[entityID] = this.size;

        /// updating reverse indexMap
        this.componentIndexToEntityIDMap[this.size] = entityID
        ++this.size;

    }

    /// get the componnet using the index number in the indexMap i.e Entity ID
    /// index == Entity ID
    get(entityID) {
        /// this is the index of the component that is associated with the Entity of ID "entityID"
        let index = this.indexMap[entityID]
        if(index == undefined) return null;
        
        return this.components[index]
    }
    
    /// convoluted ahh
    delete(entityID){
        /// this is the index of the component that is associated with the Entity of ID "entityID"
        let index = this.indexMap[entityID]
        if(index == undefined) return

        /// getting the actual component data of these two postitions
        let componentToDelete = this.components[index]
        let lastComponent = this.components[this.components.length-1]

        //// save the current index of the component in the component array we will be deleteing 
        let formerComponentIndex = this.componentIndexToEntityIDMap[this.components.length-1]

        /// if the element to delete is not at the back of the list, then put it there
        if(componentToDelete !== lastComponent){
            this.components[index] = lastComponent
            this.components[this.components.length - 1] = componentToDelete
        }

        /// we update the index map to have the correct refernce of the swaped element formerly at the bottom
        this.indexMap[formerComponentIndex] = index

        /// we remove the refernce in the index array, and the correspoinding index in the component index to entityID map
        this.indexMap[entityID] = undefined; 
        this.componentIndexToEntityIDMap[index] = formerComponentIndex;

        /// remove the last reference here, both to remove a now false reference, and to math the size of the component array
        this.componentIndexToEntityIDMap.pop();

        /// remove the last element in the components array, which should be the one we want to delete
        this.components.pop();
        --this.size;
    }
}