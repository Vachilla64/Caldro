"use strict"; // LocalStorage

// [SID] [NF]
class localStorageDataCapsule{
	constructor(localStorageID = generateRandomId()){
		this.localStorageID = localStorageID
		this.data = new Array();
		this.save = this.saveToLocalStorage;
		this.load = this.loadFromLocalStorage;
		localStorage.setItem(this.localStorageID, this.data)
	}
	addData(dataID, data){
		if(typeMatch(data, ["string", "object"])){
			this.data[dataID] = data;
		}
	}
	getData(dataID){
		return this.data[dataID]
	}
	delete(dataID){
		delete this.data[dataID]
	}

	save(){
		localStorage.setItem(this.localStorageID, JSON.stringify(this.data))
	}
	load(){
		this.data = JSON.parse(localStorage.getItem(this.localStorageID))
	}
}

function saveToLocalStorage(name, value) {
	localStorage.setItem(name, value);
}

function loadFromLocalStorage(name) {
	let data = localStorage.getItem(name);
	if (data == null) {
		return null;
	} else {
		return data;
	}
}

function deleteFromLocalStorage(name) {
	localStorage.removeItem(name);
	let data = localStorage.getItem(name);
	if (data != null) {}
}
