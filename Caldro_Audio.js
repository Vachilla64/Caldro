"use strict"; // Audio

// [SID]
class DOMaudioManager {
	constructor() {
		let audioManager = this;
		this.initState = false;
		this.initialized = false;
		this.loadState = false;
		this.active = true;
		this.addedSounds = 0;
		this.loadedSounds = 0;
		this.masterVolume = 1;
		this.fileSrcPrefix = "";
		this.bank = {};
	}
	onInit() { };
	initialize() {
		if (!this.active)
			return;
		for (let s = 0; s < this.bank.length; ++s) {
			try {
				let sound = this.bank[s];
				let former_volume = sound.volume;
				sound.load();
				sound.currentTime = 1;
				sound.volume = 0;
				setTimeout(() => {
					sound.play();
					setTimeout(function () {
						sound.pause();
						sound.volume = former_volume;
						// this.onInit();
					}, 1000);
				}, 2000);
				sound.currentTime = 0;
			} catch (e) {
				/*window.onerror = function(e){
				  return true;
				}*/
			}
		}
		this.initState = true;
		// console.log("initialized")
	};

	pauseAll() {
		if (!this.active)
			return;
		for (let s in this.bank) {
			if (!this.isAudioFile(s) && Caldro.info.loggingIssus()) {
				//console.log("A non audio file is present in this sound bank \n That file is of type "+typeof this.bank[s]+"\n The non audio file")
				// console.log(this.bank[s])
			}
			this.bank[s].pause();
		}
	};

	stopAll() {
		if (!this.active)
			return;
		for (let s in this.bank) {
			if (!this.isAudioFile(s) && Caldro.info.loggingIssus()) {
				//console.log("A non audio file is present in this sound bank \n That file is of type "+typeof this.bank[s]+"\n The non audio file")
				// console.log(this.bank[s])
			}
			this.bank[s].pause();
			this.bank[s].currentTime = 0;
		}
	};

	play(id, cloneNode = false, time = null, volume = null) {
		if (!this.active || !this.bank[id] || !this.initialized)
			return;
		if (cloneNode) {
			let sound = this.bank[id].cloneNode(true);
			sound.volume = this.bank[id].volume;
			if (time !== null)
				sound.currentTime = time;
			if (volume !== null)
				sound.volume = volume;
			sound.play();
		} else {
			let sound = this.bank[id];
			if (time !== null)
			sound.currentTime = time;
			if (volume !== null)
			sound.volume = volume;
			sound.play();
			sound.isPlaying = true
		}
	};

	pause(id) {
		if (!this.active)
			return;
		// console.log("Trying to pause Audio file tagged **"+id+"**, that file is "+this.bank[id])
		if (this.isAudioFile(id)) {
			this.bank[id].pause();
			this.bank[id].isPlaying = false;
			// console.log(typeof this.bank[id])
		}
	};

	stop(id) {
		if (!this.active)
			return;
		// console.log("Trying to pause Audio file tagged **"+id+"**, that file is "+this.bank[id])
		if (this.isAudioFile(id)) {
			this.bank[id].pause();
			this.bank[id].currentTime = 0;
			this.bank[id].isPlaying = false;
			// console.log(typeof this.bank[id])
		}
	};

	getTime(id) {
		return this.bank[id].currentTime;
	};

	isAudioFile(id) {
		if (this.bank[id]) {
			return getConstructorName(this.bank[id]) == "HTMLAudioElement";
		}
	};

	get(id, cloneNode = false) {
		if (this.bank[id] != undefined) {
			if (!cloneNode) {
				return this.bank[id];
			} else {
				let sound = this.bank[id].cloneNode(true);
				sound.volume = this.bank[id].volume;
				return sound;
			}
		} else {
			// console.log("Tried to get Audio file tagged **"+id+"**");
			// return new Audio();
			return null;
		}
	};

	setTime(id, value = 0) {
		this.bank[id].currentTime = value;
	};

	access() {
		this.initialize();
	};

	getLoadPercenteage() {
		return (this.loadedSounds / this.addedSounds) * 100;
	};

	updateLoadinfo() {
		++this.loadedSounds;
		if (this.loadedSounds == this.addedSounds && this.loadState == false) {
			this.loadState = true;
			this.initialized = true;
			this.onInit();
			//console.l555og("All ssounds have been initialized");
			this.access = function () { };
		} else {
			// console.log(this.loadedSounds)
		}
	};

	createSoundObject() {
		let soundObject = {
			/* audioFile: audioFile,
			volume: volume,
			pitch: 1,
			speed: 1, */
		};
	};

	add(id, src, volume = 1) {
		if (!this.active)
			return;
		// let aud = document.createElement("audio");
		let aud = new Audio();
		aud.src = this.fileSrcPrefix + src;
		aud.volume = volume;
		aud.psuedoVolume = volume;
		aud.id = id;
		aud.preload = "auto";
		aud.controls = false;
		aud.isPlaying = false;
		this.bank[id] = aud;
		++this.addedSounds;
		// document.body.appendChild(aud)
		aud.oncanplaythrough = () => {
			this.updateLoadinfo();
		};
		aud.setVolume = (volume = 1) => {
			aud.psuedoVolume = volume;
			aud.volume = aud.psuedoVolume * this.masterVolume;
		};
		aud.getVolume = function (volume = 1) {
			return aud.psuedoVolume;
		};
		aud.getCurrentTime = function(){
			return aud.currentTime
		}
		aud.setCurrentTime = function(time){
			return aud.currentTime = time;
		}
		aud.setPlaybackRate = function(playbackRate = 1){
			aud.playbackRate = playbackRate;
		}
		aud.getPlaybackRate = function(){
			return aud.playbackRate;
		}
		aud.setLoop = function(loop = true){
			aud.loop = loop
		}
	};

	setMasterVolume(volume = 1) {
		if (!this.active)
			return;
		this.masterVolume = volume;
		for (let b in this.bank) {
			let sound = this.bank[b];
			sound.volume = sound.psuedoVolume * this.masterVolume;
		}
	};

	update() {
		if (!this.active)
			return;
		for (let s in this.bank) {
		}
	};
}

class WAAPIAudioManager {
	constructor() {
		this.active = true
		this.throwErrors = true
		this.audioContext;
		this.addedSounds = 0;
		this.loadedSounds = 0;
		this.loadedData = 0;
		this.totalData = 0;
		this.initData = 0;
		this.audioBuffers = {};
		this.loadingQueue = {};
		this.runningAudio = {};
		this.autoLoad = true;
		this.initialized = false;
		this.loaded = false;
		this.reverbImpulses = {
			hall: "",
			plate: "",
			room: "",
		}
		this.masterGainNode = null;
		this.masterCompressor = null;
		this.masterPlaybackRate = null;
		this.nodeGraphEnd = null
	}
	getMasterVolume() {
		if (!this.initialized) return
		return this.masterGainNode.gain.value
	}
	setMasterVolume(volume) {
		if (!this.initialized) return
		this.masterGainNode.gain.value = volume*0.01
	}
	getLoadPercenteage(actualDataLoaded = false) {
		if (actualDataLoaded)
			if (this.initData == this.addedSounds) {
				return (this.loadedData / this.totalData) * 100
			} else {
				return 0;
			}

		return (this.loadedSounds / this.addedSounds) * 100;
	};
	createSoundObject(audioBuffer) {
		let startTime = 0;
		let currentTime = 0;
		let pausedAtTime = 0;
		let isPlaying = false;
		let gainNode = this.audioContext.createGain();
		let isloop = false;
		let isNativeLoop = false
		let loopStart = 0;
		let loopEnd = 0
		let playbackRate = 1
		let WAAPIam = this;
		let stoppedManually = false
		let getPausedTime = () => {
			if (isPlaying) {
				let time = pausedAtTime + (WAAPIam.audioContext.currentTime - startTime)
				if (time > audioPackage.buffer.duration) {
					time = audioPackage.buffer.duration
				}
				return time
			} else {
				return pausedAtTime
			}
		}
		let audioPackage =
		{
			currentInfo: function () {
				return {
					startTime: startTime,
					currentTime: currentTime,
					pausedAtTime: pausedAtTime,
					isPlaying: isPlaying,
					isloop: isloop,
					loopStart: loopStart,
					loopEnd: loopEnd,
					playbackRate: playbackRate
				}
			},
			buffer: audioBuffer,
			bufferSourceNode: this.audioContext.createBufferSource(),
			duration: audioBuffer.duration,
			hasPlayed: false,
			loadProgress: 100,
			playing: isPlaying,
			isPlaying() { return isPlaying },
			isLooping() { return isloop },
			isNativeLooping() { return isNativeLoop },
			play(clone = false, startAt = 0, delayTime = 0, endAt, volume) {
				let sound;
				if (clone || !isPlaying) {
					sound = WAAPIam.audioContext.createBufferSource();
					this.bufferSourceNode = sound
					sound.buffer = this.buffer;
				} else {
					sound = this.bufferSourceNode
				}
				sound.onended = () => {
					let time;
					if (isPlaying) {
						time = this.getCurrentTime();
						if (time > this.buffer.duration) {
							time = this.buffer.duration
						}
					} else {
						time = pausedAtTime
					}
					if (time == this.buffer.duration) {
						if (!isloop && !stoppedManually) {
							isPlaying = false
							currentTime = time
							startTime = 0;
						}
					}
					if (isloop && !stoppedManually) {
						// console.log("IT TRIES TO LOOP")
						this.bufferSourceNode.onended = () => { };

						if (!this.hasPlayed) return;
						stoppedManually = true;
						this.bufferSourceNode.stop()
						if (getPausedTime() < loopEnd) {
							pausedAtTime = getPausedTime();
						} else {
							pausedAtTime = 0
						}
						isPlaying = false
						startTime = currentTime = 0;

						// console.log(clip(pausedAtTime, loopStart, loopEnd))
						this.play(false, clip(pausedAtTime, loopStart, loopEnd))
						// console.log("SUCCES")
					}
				}
				sound.loop = isNativeLoop
				sound.loopStart = loopStart
				sound.loopEnd = loopEnd

				sound.playbackRate.value = playbackRate
				if (volume) {
					this.setVolume(volume)
				}



				if (clone) {
					startAt = startAt || 0
					endAt = endAt || this.buffer.duration
					sound.connect(gainNode)
					gainNode.connect(WAAPIam.nodeGraphEnd)
					sound.start(WAAPIam.audioContext.currentTime + delayTime, startAt, endAt)
				} else if (!isPlaying) {
					sound.connect(gainNode)
					gainNode.connect(WAAPIam.nodeGraphEnd)
					if (isloop) {
						if (endAt == null) {
							endAt = loopEnd
						}
						if (stoppedManually) {
							pausedAtTime = clip(pausedAtTime, loopStart, loopEnd)
						} else {
							pausedAtTime = loopStart
						}
						sound.start(WAAPIam.audioContext.currentTime + delayTime, pausedAtTime, endAt - pausedAtTime)
					} else {
						if (endAt == null) {
							endAt = this.buffer.duration
						}
						sound.start(WAAPIam.audioContext.currentTime + delayTime, pausedAtTime, endAt)
					}

					startTime = WAAPIam.audioContext.currentTime - pausedAtTime
					currentTime = pausedAtTime// * this.bufferSourceNode.playbackRate.value
					// currentTime = pausedAtTime * this.bufferSourceNode.playbackRate.value
					// currentTime = (pausedAtTime/this.getPlaybackRate()) + (WAAPIam.audioContext.currentTime - startTime) * this.getPlaybackRate();
					pausedAtTime = 0
					isPlaying = true

				}

				this.hasPlayed = true;
				stoppedManually = false
			},
			pause() {
				if (!isPlaying) return;
				stoppedManually = true;
				this.bufferSourceNode.stop()
				pausedAtTime = getPausedTime();
				isPlaying = false;
				startTime = 0
			},
			stop() {
				if (!this.hasPlayed) return;
				stoppedManually = true;
				this.bufferSourceNode.stop()
				isPlaying = false
				startTime = pausedAtTime = currentTime = 0;
			},
			getCurrentTime(isPlayingTime = false) {
				if (isPlaying) {
					let pbr = this.getPlaybackRate();
					let time = (pausedAtTime) + (WAAPIam.audioContext.currentTime / pbr - startTime) //* pbr
					if (time > this.buffer.duration) {
						time = this.buffer.duration
					}
					currentTime = time
					return currentTime
				} else {
					return currentTime
				}
			},
			setCurrentTime(time, isPlayingTime = false) {
				// console.log("recieved time:", time)
				let wasPlaying = isPlaying
				let pbr = this.getPlaybackRate();
				if (this.hasPlayed) {
					if (wasPlaying) {
						this.pause()
					}
				}
				if (time < 0) {
					time = this.buffer.duration - time
					console.wrror("Negative time value passed for the currentTime of the audio when wrapped backwards is geater tanthe lenght of audio\nTime limit fo r the funciotn is [-audioLength, audioLength]")
				} else if (time > this.buffer.duration) {
					time = this.buffer.duration
					console.warn("Provided Time paramerter is greater than the length of the audio")
				}
				if (isloop) {
					time = clip(time, loopStart, loopEnd)
				}
				// time  /= pbr
				currentTime = time
				// time  /= this.bufferSourceNode.playbackRate.value
				pausedAtTime = time
				console.log("set time to", time)
				// currentTime = pausedAtTime

				// console.log("PausedAtTime", pausedAtTime)
				// console.log("CurrentTime", currentTime);
				// console.log("Time", time)
				if (!isPlayingTime) {
					// time  /= this.bufferSourceNode.playbackRate.value
				}
				if (currentTime < this.buffer.duration) {
					if (wasPlaying) {
						this.play()
					}
				} else {
					this.stop()
				}
			},
			getPlaybackRate() {
				return this.bufferSourceNode.playbackRate.value
			},
			setPlaybackRate(playbackrate) {
				this.bufferSourceNode.playbackRate.value = playbackRate = playbackrate
			},
			getVolume() {
				return gainNode.gain.value;
			},
			setVolume(volume) {
				gainNode.gain.value = volume
			},
			getDetune() {
				return this.bufferSourceNode.detune.value
			},
			setDetune(detune) {
				this.bufferSourceNode.detune.value = detune
			},
			setLoop(loop = true, start, end, isNative = false) {
				isNativeLoop = this.bufferSourceNode.loop = isNative
				if (isNativeLoop) {
					loop = false;
					if (this.bufferSourceNode) {
						this.bufferSourceNode.loopStart = loopStart
						this.bufferSourceNode.loopEnd = loopEnd
						// console.log(loopStart, loopEnd)
					}
					return
				}

				isloop = loop;
				if (loop == false) {
					loopStart = 0;
					loopEnd = this.buffer.duration
					this.pause();
					this.play(false);
					return
				}

				loopStart = start || 0
				if (end < 0) {
					loopEnd = this.buffer.duration - end
				} else {
					loopEnd = end || this.buffer.duration
				}
				if (isPlaying) {
					this.pause();
					this.play(false);
				}
			},
		}

		return audioPackage;
	}
	setVolume(id, volume) {
		let soundObject = this.audioBuffers[id];
		if (!soundObject) {
			if (this.throwErrors) console.error("WAAPIAudioManager Error: no sound with an id of '" + id + "' was added to the audioManager")
			return;
		}
		soundObject.setVolume(volume)
	}
	add(id, src, volume = 1) {
		if (!this.active) return;
		if (this.autoLoad) {
			if (!this.audioContext) {
				if (this.throwErrors) throw "WAAPIAudioManager Error: audioManager has not been initialized. Initialize audioManager with [audioManager.initialize] before adding any audio else turn off [audioManager.autoLoad]"
				return;
			}
			this.addedSounds++;
			this.audioBuffers[id] = {
				loadProgress: 0,
			}
			this.loadAudioBuffer(src, (buffer) => {
				this.audioBuffers[id] = this.createSoundObject(buffer);
				this.audioBuffers[id].setVolume(volume)
				this.loadedSounds++;
				this.checkInitState();
			}, id)
		} else {
			this.addedSounds++;
			this.audioBuffers[id] = {
				loadProgress: 0,
			}
			this.loadingQueue[id] = {
				src: src,
			}
		}
	}
	checkInitState() {
		if (this.loadedSounds == this.addedSounds) {
			this.initialized = true
			this.onInit();
		}
	}
	onInit() { };
	hasLoaded(id) {
		if (this.audioBuffers[id].loadProgress = 100) return true;
		return false;
	}
	play(id, clone = false, startAt, delayTime = 0, volume, endAt) {
		if (!this.active) return;
		let soundObject = this.audioBuffers[id]
		if (delayTime <= 0) delayTime = 0;
		if (!soundObject) {
			// throw "WAAPIAudioManager Error: no sound with an id of '"+id+"' was added to the audioManager"
			if (this.throwErrors) console.error("WAAPIAudioManager Error: no audio with an id of '" + id + "' was added to the audioManager")
			return;
		}
		if (!this.initialized) {
			if (!soundObject) return
		}
		soundObject.play(clone, startAt, delayTime, endAt, volume)
	}
	pause(id) {
		if (!this.active) return;
		let soundObject = this.audioBuffers[id]
		if (!soundObject) {
			if (this.throwErrors) throw `WAAPIAudioManager Error: no audio with an id of '${id}' was added to the audio Manager`
			return;
		}
		soundObject.pause();
	}
	stop(id) {
		if (!this.active) return;
		let soundObject = this.audioBuffers[id]
		if (!soundObject) {
			if (this.throwErrors) throw `WAAPIAudioManager Error: no audio with an id of '${id}' was added to the audio Manager`
			return;
		}
		soundObject.stop();
	}
	setLoop(id, loop, start, end, isNative) {
		if (!this.active) return;
		let soundObject = this.audioBuffers[id]
		if (!soundObject) {
			if (this.throwErrors) throw `WAAPIAudioManager Error: no audio with an id of '${id}' was added to the audio Manager`
			return
		}
		soundObject.setLoop(loop, start, end, isNative)
	}
	pauseAll() {
		if (!this.active) return;
		for (let id in this.audioBuffers) {
			let soundObject = this.audioBuffers[id]
			if (soundObject.isPlaying()) {
				soundObject.pause();
			}
		}
	}
	stopAll() {
		if (!this.active) return;
		for (let id in this.audioBuffers) {
			let soundObject = this.audioBuffers[id]
			soundObject.stop();
		}
	}
	getCurrentTime(id) {
		let soundObject = this.audioBuffers[id]
		if (!soundObject) {
			if (this.throwErrors) throw `WAAPIAudioManager Error: no audio with an id of '${id}' was added to the audio Manager`
			return;
		}
		return soundObject.getCurrentTime();
	}
	setCurrentTime(id, currentTime) {
		let soundObject = this.audioBuffers[id]
		if (!soundObject) {
			if (this.throwErrors) throw `WAAPIAudioManager Error: no audio with an id of '${id}' was added to the audio Manager`
			return;
		}
		soundObject.setCurrentTime(currentTime)
	}
	getPlaybackRate(id) {
		let soundObject = this.audioBuffers[id]
		if (!soundObject) {
			if (this.throwErrors) throw `WAAPIAudioManager Error: no audio with an id of '${id}' was added to the audio Manager`
			return;
		}
		return soundObject.getPlaybackRate();
	}
	setPlaybackRate(id, playbackRate) {
		let soundObject = this.audioBuffers[id]
		if (!soundObject) {
			if (this.throwErrors) throw `WAAPIAudioManager Error: no audio with an id of '${id}' was added to the audio Manager`
			return;
		}
		soundObject.setPlaybackRate(playbackRate)
	}
	getDetune(id) {
		let soundObject = this.audioBuffers[id]
		if (!soundObject) {
			if (this.throwErrors) throw `WAAPIAudioManager Error: no audio with an id of '${id}' was added to the audio Manager`
			return;
		}
		return soundObject.getDetune();
	}
	setDetune(id, detune) {
		let soundObject = this.audioBuffers[id]
		if (!soundObject) {
			if (this.throwErrors) throw `WAAPIAudioManager Error: no audio with an id of '${id}' was added to the audio Manager`
			return;
		}
		soundObject.setDetune(detune)
	}
	get(id, clone = false, fullClone = true) {
		if (!this.active) return null;
		// if (!this.active) return this.createSoundObject(this.audioContext.createBuffer(2, this.audioContext.sampleRate, this.audioContext.sampleRate));
		let soundObject = this.audioBuffers[id]
		if (clone) {
			let sloneAudio = this.createSoundObject(soundObject.buffer)
			if(fullClone){
				sloneAudio.setVolume(soundObject.getVolume())
			}
			return sloneAudio
		}
		if (!soundObject) {
			if (this.throwErrors) throw `WAAPIAudioManager Error: no audio with an id of '${id}' was added to the audio Manager`
		}
		return soundObject
	}
	onAudioLoaded(id) { }
	loadQueue() {
		if (!this.active) return;
		for (let id in this.loadingQueue) {
			this.loadFromQueue(id)
		}
	}
	loadFromQueue(id) {
		if (!this.active) return;
		if (!this.audioContext) {
			if (this.throwErrors) throw "WAAPIAudioManager Error: audioManager has not been initialized. Initialize audioManager with [audioManager.initialize] before adding any audio else turn off [audioManager.autoLoad]"
			return;
		}
		this.loadAudioBuffer(this.loadingQueue[id].src, (buffer) => {
			this.audioBuffers[id] = this.createSoundObject(buffer);
			delete this.loadingQueue[id]
			this.loadedSounds++;
			this.checkInitState();
			this.onAudioLoaded(id)
		}, id)
	}
	initialize(load = true, onError) {
		if (!this.active) return;
		this.audioContext = createAudioContext();
		if (!this.audioContext) {
			onError();
			return;
		}
		this.audioContext.resume();

		this.masterGainNode = this.audioContext.createGain();
		this.masterCompressor = this.audioContext.createDynamicsCompressor();

		this.masterCompressor.connect(this.masterGainNode);
		this.masterGainNode.connect(this.audioContext.destination)
		this.nodeGraphEnd = this.masterCompressor
		if (load) {
			this.loadQueue();
		}
	}
	loadAudioBuffer(src, callback, id = null) {
		let xReq = new XMLHttpRequest();
		let audioBuffer;
		xReq.open("GET", src, true);
		xReq.responseType = "arraybuffer"
		xReq.onload = () => {
			this.audioContext.decodeAudioData(xReq.response, (buffer) => {
				audioBuffer = buffer;
				callback(buffer)
			})
		}
		if (id) {
			// console.log(id)
			let firstProgress = true;
			let lastProgress = 0
			xReq.onprogress = (e) => {
				if (firstProgress) {
					this.totalData += e.total
					firstProgress = false;
					this.initData++
				}

				this.loadedData += e.loaded - lastProgress
				lastProgress = e.loaded

				let loadprogress = Math.floor((e.loaded / e.total) * 100)
				this.audioBuffers[id].loadProgress = loadprogress
				this.audioBuffers[id].loadedData = e.loaded
				this.audioBuffers[id].totalData = e.total
				// console.log(`Load for src ${src}: ${loadprogress}%`)
			}
		}
		xReq.send();
		return audioBuffer;
	}
	makeEffectsChain() {
		// TODO: figure out what on earth is supposed to go in here, lol
	}
}



class OWAAPIAudioManager {
	constructor() {
		this.audioContext;
		this.addedSounds = 0;
		this.loadedSounds = 0;
		this.audioBuffers = {};
		this.loadingQueue = {};
		this.runningAudio = {};
		this.autoLoad = true;
		this.initialized = false;
		this.loaded = false;
		this.reverbImpulses = {
			hall: "",
			plate: "",
			room: "",
		}
		this.masterGainNode = null;
		this.masterCompressor = null;
		this.masterPlaybackRate = null;
		this.nodeGraphEnd = null
	}
	getLoadPercenteage() {
		return (this.loadedSounds / this.addedSounds) * 100;
	};
	createSoundObject(audioBuffer) {
		let startTime = 0;
		let currentTime = 0;
		let pausedAtTime = 0;
		let isPlaying = false;
		let gainNode = this.audioContext.createGain();
		let isloop = false;
		let loopStart = 0;
		let loopEnd = 0
		let playbackRate = 1
		let WAAPIam = this;	
		return {
			moreInfo: function () {
				return {
					startTime: startTime,
					currentTime: currentTime,
					pausedAtTime: pausedAtTime,
					isPlaying: isPlaying,
					isloop: isloop,
					loopStart: loopStart,
					loopEnd: loopEnd,
					playbackRate: playbackRate
				}
			},
			buffer: audioBuffer,
			bufferSourceNode: this.audioContext.createBufferSource(),
			duration: audioBuffer.duration,
			hasPlayed: false,
			isPlaying() { return isPlaying },
			play(clone = false, startAt = 0, delayTime = 0, endAt, volume) {
				let sound;
				if (clone || !isPlaying) {
					sound = WAAPIam.audioContext.createBufferSource();
					this.bufferSourceNode = sound
					sound.buffer = this.buffer;
				} else {
					sound = this.bufferSourceNode
				}
				sound.onended = () => {
					/* let time;
					if (isPlaying) {
						time = this.getCurrentTime();
						if (time > this.buffer.duration) {
							time = this.buffer.duration
						}
					} else {
						time = pausedAtTime
					}
					if (time == this.buffer.duration) {
						if (!isloop) {
							isPlaying = false
							currentTime = time
							startTime = 0;
						}
					}
					if (isloop) {
						this.bufferSourceNode.onended = () => { };
						this.stop();
						// console.log(clip(pausedAtTime, loopStart, loopEnd))
						this.play(false, clip(pausedAtTime, loopStart, loopEnd))
					} */
					let time;
					if (isPlaying) {
						time = pausedAtTime + (WAAPIam.audioContext.currentTime - startTime)
						// time = pausedAtTime + (WAAPIam.audioContext.currentTime - startTime)
						if (time > this.buffer.duration) {
							time = this.buffer.duration
						}
					} else {
						time = pausedAtTime
					}
					if (time == this.buffer.duration) {
						isPlaying = false
						currentTime = time
						startTime = 0;
						if (isloop) {
							this.play(false, loopStart, 0, loopEnd)
						}
					}
				}

				// sound.loop = isloop
				// sound.loopStart = loopStart
				// sound.loopEnd = loopEnd
				sound.playbackRate.value = playbackRate
				if (volume) {
					this.setVolume(volume)
				}



				if (clone) {
					startAt = startAt || 0
					endAt = endAt || this.buffer.duration
					sound.connect(gainNode)
					gainNode.connect(WAAPIam.nodeGraphEnd)
					sound.start(WAAPIam.audioContext.currentTime + delayTime, startAt, endAt)
				} else if (!isPlaying) {
					endAt = endAt || this.buffer.duration
					sound.connect(gainNode)
					gainNode.connect(WAAPIam.nodeGraphEnd)
					sound.start(WAAPIam.audioContext.currentTime + delayTime, pausedAtTime, endAt)

					startTime = WAAPIam.audioContext.currentTime - pausedAtTime
					currentTime = pausedAtTime * this.bufferSourceNode.playbackRate.value
					pausedAtTime = 0
					isPlaying = true
				}
				this.hasPlayed = true;
			},
			pause() {
				if (!isPlaying) return;
				this.bufferSourceNode.stop()
				pausedAtTime = this.getCurrentTime();
				startTime = 0
				isPlaying = false;
			},
			stop() {
				if (!this.hasPlayed) return;
				this.bufferSourceNode.stop()
				isPlaying = false
				startTime = pausedAtTime = currentTime = 0;
			},
			getCurrentTime() {
				if (isPlaying) {
					let time = pausedAtTime + ((WAAPIam.audioContext.currentTime - startTime) * (this.bufferSourceNode.playbackRate.value))
					if (time > this.buffer.duration * (1 / this.bufferSourceNode.playbackRate.value)) {
						time = this.buffer.duration
					}
					currentTime = time
					return currentTime
				} else {
					return currentTime
				}
			},
			setCurrentTime(time) {
				let wasPlaying = isPlaying
				if (this.hasPlayed) {
					if (isPlaying) {
						this.bufferSourceNode.stop()
						isPlaying = false;
						startTime = 0
					}
				}
				if (time > this.buffer.duration) {
					time = this.buffer.duration
				}
				currentTime = time
				time *= (1 / this.bufferSourceNode.playbackRate.value)
				pausedAtTime = time
				if (time != this.buffer.duration * (1 / this.bufferSourceNode.playbackRate.value)) {
					if (wasPlaying) {
						this.play()
					}
				} else {
					this.stop()
				}
			},
			getPlaybackRate() {
				return this.bufferSourceNode.playbackRate.value
			},
			setPlaybackRate(playbackrate) {
				this.bufferSourceNode.playbackRate.value = playbackRate = playbackrate
			},
			getVolume() {
				return gainNode.gain.value;
			},
			setVolume(volume) {
				gainNode.gain.value = volume
			},
			getDetune() {
				return this.bufferSourceNode.detune.value
			},
			setDetune(detune) {
				this.bufferSourceNode.detune.value = detune
			},
			setLoop(loop = true, start, end) {
				isloop = loop;
				if (loop == false) {
					loopStart = 0;
					loopEnd = this.buffer.duration
					return;
				}
				loopStart = start || 0
				if (end < 0) {
					loopEnd = this.buffer.duration - end
				} else {
					loopEnd = loopEnd || this.buffer.duration
				}
				return
				if (this.bufferSourceNode) {
					this.bufferSourceNode.loop = loop
					this.bufferSourceNode.loopStart = loopStart
					this.bufferSourceNode.loopEnd = loopEnd
				}
			}
		}

	}
	setVolume(id, volume) {
		let soundObject = this.audioBuffers[id];
		if (!soundObject) {
			console.error("WAAPIAudioManager Error: no sound with an id of '" + id + "' was added to the audioManager")
		}
		soundObject.setVolume(volume)
	}
	setMasterVolume(volume) {
		if (!this.initialized) return
		this.masterGainNode.gain.value = volume
	}
	add(id, src, volume = 1) {
		if (this.autoLoad) {
			if (!this.audioContext) {
				throw "WAAPIAudioManager Error: audioManager has not been initialized. Initialize audioManager with [audioManager.initialize] before adding any audio else turn off [audioManager.autoLoad]"
			}
			this.addedSounds++;
			this.loadAudioBuffer(src, (buffer) => {
				this.audioBuffers[id] = this.createSoundObject(buffer);
				this.audioBuffers[id].setVolume(volume)
				this.loadedSounds++;
				this.checkInitState();
			})
		} else {
			this.addedSounds++;
			this.loadingQueue[id] = src;
		}
	}
	checkInitState() {
		if (this.loadedSounds == this.addedSounds) {
			this.initialized = true
			this.onInit();
		}
	}
	onInit() { };
	hasLoaded(id) {
		if (this.audioBuffers[id]) return true;
		return false;
	}
	play(id, clone = false, startAt, delayTime = 0, volume, endAt) {
		let soundObject = this.audioBuffers[id]
		if (delayTime <= 0) delayTime = 0;
		if (!soundObject) {
			// throw "WAAPIAudioManager Error: no sound with an id of '"+id+"' was added to the audioManager"
			console.error("WAAPIAudioManager Error: no audio with an id of '" + id + "' was added to the audioManager")
			return;
		}
		if (!this.initialized) {
			if (!soundObject) return
		}
		soundObject.play(clone, startAt, delayTime, endAt, volume)
	}
	pause(id) {
		let soundObject = this.audioBuffers[id]
		if (!soundObject) {
			throw `WAAPIAudioManager Error: no audio with an id of '${id}' was added to the audio Manager`
		}
		soundObject.pause();
	}
	stop(id) {
		let soundObject = this.audioBuffers[id]
		if (!soundObject) {
			throw `WAAPIAudioManager Error: no audio with an id of '${id}' was added to the audio Manager`
		}
		soundObject.stop();
	}
	setLoop(id, loop, start, end) {
		let soundObject = this.audioBuffers[id]
		if (!soundObject) {
			throw `WAAPIAudioManager Error: no audio with an id of '${id}' was added to the audio Manager`
		}
		soundObject.setLoop(loop, start, end)
	}
	pauseAll() {
		for (let id in this.audioBuffers) {
			let soundObject = this.audioBuffers[id]
			if (soundObject.isPlaying()) {
				soundObject.pause();
			}
		}
	}
	stopAll() {
		for (let id in this.audioBuffers) {
			let soundObject = this.audioBuffers[id]
			soundObject.stop();
		}
	}
	getCurrentTime(id) {
		let soundObject = this.audioBuffers[id]
		if (!soundObject) {
			throw `WAAPIAudioManager Error: no audio with an id of '${id}' was added to the audio Manager`
		}
		return soundObject.getCurrentTime();
	}
	setCurrentTime(id, currentTime) {
		let soundObject = this.audioBuffers[id]
		if (!soundObject) {
			throw `WAAPIAudioManager Error: no audio with an id of '${id}' was added to the audio Manager`
		}
		soundObject.setCurrentTime(currentTime)
	}
	getPlaybackRate(id) {
		let soundObject = this.audioBuffers[id]
		if (!soundObject) {
			throw `WAAPIAudioManager Error: no audio with an id of '${id}' was added to the audio Manager`
		}
		return soundObject.getPlaybackRate();
	}
	setPlaybackRate(id, playbackRate) {
		let soundObject = this.audioBuffers[id]
		if (!soundObject) {
			throw `WAAPIAudioManager Error: no audio with an id of '${id}' was added to the audio Manager`
		}
		soundObject.setPlaybackRate(playbackRate)
	}
	getDetune(id) {
		let soundObject = this.audioBuffers[id]
		if (!soundObject) {
			throw `WAAPIAudioManager Error: no audio with an id of '${id}' was added to the audio Manager`
		}
		return soundObject.getDetune();
	}
	setDetune(id, detune) {
		let soundObject = this.audioBuffers[id]
		if (!soundObject) {
			throw `WAAPIAudioManager Error: no audio with an id of '${id}' was added to the audio Manager`
		}
		soundObject.setDetune(detune)
	}
	get(id, clone = false) {
		let soundObject = this.audioBuffers[id]
		if (!soundObject) {
			throw `WAAPIAudioManager Error: no audio with an id of '${id}' was added to the audio Manager`
		}
		if (clone) {
			return this.createSoundObject(soundObject.buffer)
		}
		return soundObject
	}
	loadQueue() {
		for (let id in this.loadingQueue) {
			this.loadFromQueue(id)
		}
	}
	loadFromQueue(id) {
		if (!this.audioContext) {
			throw "WAAPIAudioManager Error: audioManager has not been initialized. Initialize audioManager with [audioManager.initialize] before adding any audio else turn off [audioManager.autoLoad]"
		}
		this.loadAudioBuffer(this.loadingQueue[id], (buffer) => {
			this.audioBuffers[id] = this.createSoundObject(buffer);
			delete this.loadingQueue[id]
			this.loadedSounds++;
			this.checkInitState();
		})
	}
	initialize(load = true, onError) {
		this.audioContext = createAudioContext();
		if (!this.audioContext) {
			onError();
			return;
		}
		this.audioContext.resume();

		this.masterGainNode = this.audioContext.createGain();
		this.masterCompressor = this.audioContext.createDynamicsCompressor();

		this.masterCompressor.connect(this.masterGainNode);
		this.masterGainNode.connect(this.audioContext.destination)
		this.nodeGraphEnd = this.masterCompressor
		if (load) {
			this.loadQueue();
		}
	}
	loadAudioBuffer(src, callback) {
		let xReq = new XMLHttpRequest();
		let audioBuffer;
		xReq.open("GET", src, true);
		xReq.responseType = "arraybuffer"
		xReq.onload = () => {
			this.audioContext.decodeAudioData(xReq.response, (buffer) => {
				audioBuffer = buffer;
				callback(buffer)
			})
		}
		xReq.send();
		return audioBuffer;
	}
	makeEffectsChain() {
		// TODO: figure out what on earth is supposed to go in here, lol
	}
}

function createAudioContext() {
	let context = new window.AudioContext()
	context = context || new (
		window.webkitAudioContext ||
		window.mozAudioContext ||
		window.oAudioContext ||
		window.msAudioContext
	);
	if (context) return context;
	console.error("Web Audio API is not supported on the current browser")
}