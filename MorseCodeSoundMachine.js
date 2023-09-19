/*
*
* Morse Code Sound Machine
*
* Class that converts text to Morse Code Audio
*
* by Pedja Supurovic, YT9TP
* https://pedja.supurovic.net
*
*
*/
const MORSE_CODE_SOUND_MACHINE_VERSION = "1.0";

const INITIAL_FREQUENCY = 800; // Hz
const INITIAL_CHAR_SPEED = 20; // Words Per Minute
const INITIAL_OVERALL_SPEED = 12; // Words Per Minute

  const CHAR_TO_MORSECODE_MAP = {
    'A': '.-',
    'B': '-...',
    'C': '-.-.',
    'D': '-..',
    'E': '.',
    'F': '..-.',
    'G': '--.',
    'H': '....',
    'I': '..',
    'J': '.---',
    'K': '-.-',
    'L': '.-..',
    'M': '--',
    'N': '-.',
    'O': '---',
    'P': '.--.',
    'Q': '--.-',
    'R': '.-.',
    'S': '...',
    'T': '-',
    'U': '..-',
    'V': '...-',
    'W': '.--',
    'X': '-..-',
    'Y': '-.--',
    'Z': '--..',
    '1': '.----',
    '2': '..---',
    '3': '...--',
    '4': '....-',
    '5': '.....',
    '6': '-....',
    '7': '--...',
    '8': '---..',
    '9': '----.',
    '0': '-----',
    '?': '..--..',
    '=': '-...-',
    '.': '.-.-.-',
    ',': '--..--',
    '!': '..--.',
    ':': '---...',
    '"': '.-..-.',
    "'": '.----.',
    '@': '.--.-.',
    '&': '.-...',
    '+': '.-.-.',
    ';': '-.-.-',
    '/': '--..-.',
    '-': '-....-',
    '(': '-.--.',
    ')': '-.--.-',
    '_': '..--.-',
    '0': '-----',
    '0': '-----',
    '0': '-----',
    
  };  


class MorseCodeSoundMachine {
  
  constructor (pFrequency = 800, pCharSpeed = 18, pOverallSpeed = 18) {
    this.frequency = pFrequency;
    this.setSpeed (pCharSpeed, pOverallSpeed);
  }
  
  get frequency() {
    return this._frequency;
  }
  
  set frequency(pValue) {
//console.log (pValue, typeof pValue);
    if (typeof pValue !== 'number') {
      pValue = Number (pValue);
    }
    if (pValue < 440 || pValue > 1200) {
      pValue = 800;
    }
    this._frequency = pValue;
  }
  
  get charSpeed() {
    return this._charSpeed;
  }
  
  set charSpeed(pValue) {
    this._charSpeed = pValue;
  }

  get overallSpeed() {
    return this._overallSpeed;
  }
  
  set overallSpeed(pValue) {
    if (pValue <= this.charSpeed) {
      this._overallSpeed = pValue;
    } else {
      this._overallSpeed = this.charSpeed;
    }
  }

  setSpeedString (pSpeed) {
    
    let lCharSpeed;
    let lOverallSpeed;
    
    let lSpeedArray;
    
    lSpeedArray = pSpeed.split(":");
    if(typeof lSpeedArray[0] !== 'undefined') {
      lCharSpeed = Number(lSpeedArray[0]);
      
      if(typeof lSpeedArray[1] !== 'undefined') {
        lOverallSpeed = Number(lSpeedArray[1]);
      } else {
        lOverallSpeed = lCharSpeed;
      }
      this.setSpeed (lCharSpeed, lOverallSpeed);
      
    } else {
      throw new Error('Invalid speed parameter!');
    }
    
  }
 
  setSpeed (pCharSpeed, pOverallSpeed) {
    this.charSpeed = pCharSpeed;
    this.overallSpeed = pOverallSpeed;
    
    this._dotTime = (1.2 / this.charSpeed) * 1000;
    this._dashTime = this.dotTime * 3;
    this._symbolSpacerTime = this.dotTime;
    
   
    if (this.charSpeed == this.overallSpeed) {
      this._charSpacerTime = 3 * this.dotTime;
      this._wordSpacerTime = 7 * this.dotTime;
    } else {
      
      let lCharacterDelay = ((60 * this.charSpeed) - 
                             (37.2 * this.overallSpeed)) 
                            / ( this.charSpeed * this.overallSpeed) * 1000;      
        
      this._charSpacerTime = (3 * lCharacterDelay) / 19;
      this._wordSpacerTime = (7 * lCharacterDelay) / 19;
    }
    
  } // setPlayerSpeed  
  
  get dotTime() {
    return this._dotTime;
  };

  get dashTime() {
    return this._dashTime;
  };
  
  get symbolSpacerTime() {
    return this._symbolSpacerTime;
  };
  
  get charSpacerTime() {
    return this._charSpacerTime;
  };

  get wordSpacerTime() {
    return this._wordSpacerTime;
  };

 
  

  get note_context() {
    return this._note_context;
  };

  get note_node() {
    return this._note_node;
  };

  get gain_node() {
    return this._gain_node;
  };
  
  get audioContextInitialized() {
    return this._audioContextInitialized;
  };

  set audioContextInitialized(pValue) {
    this._audioContextInitialized = pValue;
  };
  
  
  set playStatus (pValue) {
    this._playStatus = (pValue == true);
  }
  
  get playStatus () {
    return this._playStatus;
  }
  
  setPlayStatusOn() {
    if (this.playStatus != true) {
      this.playStatus = true;
    } else {
      throw new Error('Already playing!');
    }
  }
  
  setPlayStatusOff() {
    this.playStatus = false;
  }
  
  
  set onCharStartCallback (pValue) {
    this._onCharStartCallback = pValue;
  }
  
  set onCharEndCallback (pValue) {
    this._onCharEndCallback = pValue;
  }
  
  set onPlayCallback (pValue) {
    this._onPlayCallback = pValue;
  }

  
  initializeAudioContext(pForced) {
    if (typeof this._note_context == "undefined") {
      this._note_context = new AudioContext();
      this._note_node = this.note_context.createOscillator();
      this._gain_node = this.note_context.createGain();
      this.note_node.start();
    }
    if (!this.audioContextInitialized || pForced) {
      this.note_node.frequency.value = this.frequency;
      this.gain_node.gain.value = 0;
      this.note_node.connect(this.gain_node);
      this.gain_node.connect(this.note_context.destination);
      
      this.audioContextInitialized = true;
    }
  }
  
  startPlaying() {
    this.initializeAudioContext();
    
    if (typeof this._onPlayCallback !== "undefined") {
      this._onPlayCallback(true);
    }    
    
//console.debug("start playing", this.getTime());

    this.gain_node.gain.setTargetAtTime(0.1, 0, 0.001)
    
  }

  stopPlaying() {
    if (typeof this._onPlayCallback !== "undefined") {
      this._onPlayCallback(false);
    }     
    
      this.initializeAudioContext();
//console.debug("stop playing", this.getTime());
    this.gain_node.gain.setTargetAtTime(0, 0, 0.001)
  }
  
  makeDelay (pTime) {
//console.debug("pTime", pTime); 
    return new Promise(resolve => setTimeout(resolve, pTime));
  } 
  
  async playDash() {
    this.startPlaying();    
    await this.makeDelay(this.dashTime);
    this.stopPlaying();
  }  

  async playDot() {
  
    this.startPlaying();
    await this.makeDelay(this.dotTime);
    this.stopPlaying();
  }    


  getTime() {

    const zeroPad = (num, places) => String(num).padStart(places, '0')

    let today = new Date();
    let time = zeroPad (today.getHours(),2) + ":" + zeroPad (today.getMinutes(),2) + ":" + zeroPad (today.getSeconds(),2);
    return time;
  } // getTime()
  
  
  async playMorseElements(pElements) {
    this.initializeAudioContext();
    for (let i = 0; i < pElements.length; i++) {
      if (pElements[i] == '-') {
        await this.playDash();
      } else if (pElements[i] == '.') {
        await this.playDot();
      }
      if (i < pElements.length - 1) {
        await this.makeDelay (this.symbolSpacerTime);
      }
    }
  } // playMorseElements()
  
  
  
  convertCharToMorseElements(pChar) {
    let lResult = '';
    if(typeof CHAR_TO_MORSECODE_MAP[pChar] !== 'undefined') {
      lResult = CHAR_TO_MORSECODE_MAP[pChar];
    }
    return lResult;
  }
  
   async playTextAsMorse (pText = '', pDoStartStopCallback = true) {
     
    this.setPlayStatusOn(); 
     
    let lText = pText.toUpperCase();
    
    for (let i = 0; i < lText.length; i++) {
//console.debug ('lWords', i, lWords[i]);       

      if (MorseCodePlayer.playStatus == true) {
    
        let lChar = lText[i];
        if (lChar == ' ') {
          await this.makeDelay (this.wordSpacerTime);  
          if (pDoStartStopCallback && (typeof this._onCharStartCallback !== "undefined")) {
            this._onCharStartCallback(lChar);
          }
          if (pDoStartStopCallback && (typeof this._onCharEndCallback !== "undefined")) {
            this._onCharEndCallback(lChar);
          }
        } else {
          let lCharMorse = this.convertCharToMorseElements(lChar);
  //console.debug (lChar, lCharMorse);
          if (pDoStartStopCallback && (typeof this._onCharStartCallback !== "undefined")) {
            this._onCharStartCallback(lChar);
          }
          //lMorseLine = lMorseLine + lCharMorse;
          await this.playMorseElements(lCharMorse);
          
          if (pDoStartStopCallback && (typeof this._onCharEndCallback !== "undefined")) {
            this._onCharEndCallback(lChar);
          }
          
          if (i < lText.length-1) {
            await this.makeDelay (this.charSpacerTime);
          }
        }
      } else {
        break;
      }
    }
    
    this.setPlayStatusOff();
    
  } 
  
  stopPlay() {
    this.setPlayStatusOff();
  }
  
} // class MorseCodeMachine



