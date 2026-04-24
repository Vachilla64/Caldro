export class SparseSet {
    constructor() {
        this.sparse = [];
        this.dense = [];
        this.size = 0;
    }

    add(key) {
        if (!this.has(key)) {
            this.sparse[key] = this.size;
            this.dense[this.size] = key;
            this.size++;
        }
    }

    remove(key) {
        if (this.has(key)) {
            const index = this.sparse[key];
            const last = this.dense[this.size - 1];
            this.dense[index] = last;
            this.sparse[last] = index;
            this.size--;
            return true;
        }
        return false;
    }

    has(key) {
        return this.sparse[key] < this.size &&
            this.sparse[key] >= 0 &&
            this.dense[this.sparse[key]] === key;
    }
}


/// like a spares set, but keeps data in the dense array
export class Data_SparseSet {
    constructor() {
        /// tightly packed data, no spaces
        this.data = new Array();

        /// this is a map where "indexMap[EntityID] = "Index of component data in the data array above"
        this.indexMap = new Array();

        /// this is the size of the data array, not the indexMap
        this.size = 0;
    }

    /// index will refer to the entity ID, and the data will be the component
    add(index, item) {
        /// data is added regardless of index
        this.data.push(item);

        /// index must be defined
        if (isNaN(index))
            console.error("index is NaN: " + index)

        /// the indexMap is updata, to "this.size" before we updata it, same as "this.data.length -1" after we alrady push the data, which we have   
        this.indexMap[index] = this.size;
        ++this.size;
    }
}
