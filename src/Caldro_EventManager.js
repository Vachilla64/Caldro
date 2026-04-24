/// TODO: 
/// and to aid intellisense / code autocompletion
/// how is this almost an ECS
export class EventManager {
    constructor(name) {
        /// name of this event manager, will use in the inspector
        this.name = name

        /// flag to prevent adding listeners for events that dont exsits
        this.filterListenersOnCreation = false

        // this.preventInvalidSubscription = true

        /// a list of available events to prevent typos and
        /// preventing adding listeners for events that will never fire
        /// NOTE: This does not contain the actual events 
        this.registeredEventTypes = new Set();

        /// holds objects where the keys are the event name and the valuu is an Set of Functions
        /// each iten in the set is an event object
        this.events = {};
    }

    addListener(nameOfEvent, callback) {
        /// make sure this event listener can / will provide this event in the first place
        if (!validateEventListener(this, nameOfEvent)) {
            console.warn(`The above error may be recitified by setting the "filterListenersOnCreation" flag to false.\n\nHowever, "${nameOfEvent}" may be a typo!\nDid you mean: ${getSuggestionsForText(nameOfEvent, this.registeredEventTypes)}`)
            return;
        }

        /// get teh set that contains all the callback functions for this specific event
        let callbackSet = this.events[nameOfEvent];

        /// create the event to return here
        let EVENT = createEventListener(nameOfEvent, callback)

        /// if it does not exsits then create a new set and add the callback function to it
        if (!callbackSet) {
            callbackSet = new Set();

            /// add the new created set to the events list
            this.events[nameOfEvent] = callbackSet

            /// add the event to the set
            callbackSet.add(EVENT)
        }
        /// but if there is already the callback set, then we check if this a duplicate event
        else {
            /// add the event to the set
            callbackSet.add(EVENT)
        }

        return EVENT;
    }

    removeListener(event) {
        /// get the set that contains the events of this event's event name
        let callbackSet = this.events[event.name]
        if (!callbackSet) return;

        callbackSet.delete(event)
    }

    fireEvent(nameOfEvent, args) {
        if(!validateEventListener(this, nameOfEvent)){
           console.warn("no events will fire")
           return; 
        }
        /// get the set containing all the events for this event name
        let callbackSet = this.events[nameOfEvent]

        /// end the function if this list of events callbakcs does nto exsist
        if (!callbackSet) return

        /// else perform all the callbacks 
        callbackSet.forEach((eventHandler) => {
            eventHandler.callback(args);
        })
    }

    /// this will specify what events are actually available to listen for / fire
    /// only useful if 
    registerEventType(event) {
        if (!this.filterListenersOnCreation) {
            console.warn(`This EventManager "${this.name}" is not filteringNewListeners against registered listeneres, hence no meed to register an event`)
            console.warn(`Set the 'filterListenersOnCreation' flag of this EventManager to 'true', or did you mean to add an event Listener? (.addListener)`)
        }


        /// add this event name to the list of avaible eents provided by this event manager
        if (typeof event == "string") {

            if (this.hasEvent(event)) {
                console.error(`An eventtype with the same name "${event}" has already been registered, Cannot register the same event more that once`)
                return false
            }

            this.registeredEventTypes.add(event)
        }

        /// allow far passiong an array of event names 
        else if (typeof event == "object") {
            /// javascript is funny, lets veriy this is an array
            /// if not we tell the user
            if (!(event.constructor.name === "Array")) {
                console.error("The event passed is not a string or array of events")
                return
            }
            event.forEach((nameOfEvent) => {
                this.addEvent(nameOfEvent)
            })
        }
    }
    /// remove an event from the avaible events list
    /// if an event is removed it will no longer be dispatched when fired
    /// and future listeners will be unable to subscirte to this event
    unRegisterEventType(event) {
        if (typeof event == "string") {
            this.registeredEventTypes.delete(event)
        }

        /// allow far passiong an array of event names 
        else if (typeof event == "object") {
            /// javascript is funny, lets veriy this is an array
            /// if not we tell the user
            if (!(event.constructor.name === "Array")) {
                console.error("The event passed is not a string or array of events")
                return
            }
            event.forEach((nameOfEvent) => {
                this.removeEvent(nameOfEvent)
            })
        }
    }


    hasEvent(nameOfEvent) {
        return this.registeredEventTypes.has(nameOfEvent);
    }
}

/// checks if an event Manager has an event type registered
function validateEventListener(eventManager, nameOfEvent) {
    /// if its not filtering then leave it alone
    if (!eventManager.filterListenersOnCreation) return true;

    let eventIsRegistered = eventManager.registeredEventTypes.has(nameOfEvent)
    if (eventIsRegistered) {
        return true
    } else {
        console.error(`The event type "${nameOfEvent}" is not A registered event type for the EventManager "${eventManager.name}"`)

        return false;
    }
}

/// TODO:
/// basically a search query
function getSuggestionsForText(item, arrayOfAvailableItems) {
    return ''
}

function createEventListener(nameOfEvent, callback) {
    return {
        name: nameOfEvent,
        callback: callback
    }
}