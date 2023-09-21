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
*
* Sample usage:
*
*  var MorseCodePlayer = new MorseCodeSoundMachine(INITIAL_FREQUENCY, INITIAL_CHAR_SPEED, INITIAL_OVERALL_SPEED);
*  
*  MorseCodePlayer.frequency = 800;
*  
*  MorseCodePlayer.setSpeedString ("18:12");
*  //or 
*  //MorseCodePlayer.setSpeed (18, 12);
*  
*  MorseCodePlayer.playTextAsMorse('TEST');
*
*
*/



const MORSE_CODE_SOUND_MACHINE_VERSION = "v1.3";

const INITIAL_FREQUENCY = 800; // Hz
const INITIAL_CHAR_SPEED = 20; // Words Per Minute
const INITIAL_OVERALL_SPEED = 12; // Words Per Minute

// Mapping table for Morse Code 
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
  '_': '..--.-'
};  



class MorseCodeSoundMachine {


  constructor (pFrequency = 800, pCharSpeed = 18, pOverallSpeed = 18) {
    this.frequency = pFrequency;
    this.setSpeed (pCharSpeed, pOverallSpeed);
  }

  /*
  *
  * Get audio tone frequency (Hz)
  *
  */
  get frequency() {
    return this._frequency;
  }
  
  /*
  *
  * Set audio tone frequency (Hz)
  *
  */
  set frequency(pValue) {
    if (typeof pValue !== 'number') {
      pValue = Number (pValue);
    }
    if (pValue < 440 || pValue > 1200) {
      pValue = 800;
    }
    this._frequency = pValue;
  }

  /*
  *
  * Get Morse Code speed for single character (WPM). 
  * If Farnsworth Timing is not used this also means overall text speed.
  *
  */
  get charSpeed() {
    return this._charSpeed;
  }
  
  /*
  *
  * Set Morse Code speed (WPM). This sets character speed. 
  * If Farnsworth Timing is not used this also sets overall text speed.
  *
  */
  set charSpeed(pValue) {
    this._charSpeed = pValue;
  }

  /*
  *
  * Get Overall Morse Code speed (WPM). 
  * If Farnsworth Timing is used this should be different from character speed (slower). 
  * This means overal text speed will be slower than character speed.
  *
  */
  get overallSpeed() {
    return this._overallSpeed;
  }
  
  /*
  *
  * Set Overall Morse Code speed (WPM). 
  * If Farnsworth Timing is used this should be different from character speed (slower). 
  * This means overal text speed will be slower than character speed.
  *
  */
  set overallSpeed(pValue) {
    if (pValue <= this.charSpeed) {
      this._overallSpeed = pValue;
    } else {
      this._overallSpeed = this.charSpeed;
    }
  }

  /*
  *
  * Set Morse Code emiting speed by specifying speed as string (WPM).
  *
  * String format is cc:oo where cc is character speed and oo is overall speed.
  * If oo is omited in a string then oo speed will be the same as cc speed.
  *
  * Examples:
  *   18:12
  *   20:18
  *   22
  *
  */
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

  /*
  *  
  * Set Morse Code speed by specifying numeric parameters.
  * pCharSpeed - character speed (WPM)
  * pOverallSpeed - overall text speed (WPM) used for Farnsoworth mode.
  *
  */
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
    
  } // setSpeed  
  
  /*
  *
  * Get duration of short Morse code element in seconds
  *
  */
  get dotTime() {
    return this._dotTime;
  };

  /*
  *
  * Get duration of long Morse code element in seconds
  *
  */
  get dashTime() {
    return this._dashTime;
  };
  
  /*
  *
  * Get duration of spacing between Morse Code elements in seconds
  *
  */
  get symbolSpacerTime() {
    return this._symbolSpacerTime;
  };

  /*
  *
  * Get duration of spacing between Morse Code characters in seconds
  *
  */
  get charSpacerTime() {
    return this._charSpacerTime;
  };

  /*
  *
  * Get duration of spacing between Morse Code words in seconds
  *
  */
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
  
  /*
  *
  * Playstatus shows if Morse Code Sound Machine is currently playing.
  *
  */
  set playStatus (pValue) {
    this._playStatus = (pValue == true);
  }
  
  get playStatus () {
    return this._playStatus;
  }

  /*
  *
  * PlayStatus is set on when needed (when playing starts).
  * Class user should not call this method.
  *
  */
  setPlayStatusOn() {
    if (this.playStatus != true) {
      this.playStatus = true;
    } else {
      throw new Error('Already playing!');
    }
  }

  /*
  *
  * PlayStatus is set off when needed (when playing is finished).
  * Also, class user may call this method externaly to stop currently played Morse Code.
  *
  */
  setPlayStatusOff() {
    this.playStatus = false;
  }
  
  
  /*
  *
  * Class user may assign function to onCharStartCallback.
  * Function would be called each time new character is played in Morse Code.
  * Parameter is characer played.
  * May be used to display currently played character.
  *
  */
  set onCharStartCallback (pValue) {
    this._onCharStartCallback = pValue;
  }

  /*
  *
  * Class user may assign function to onCharEndCallback.
  * Function would be called each time character playing is finished.
  * Parameter is character played.
  * May be used to display character that is currently finished playing.
  *
  */  
  set onCharEndCallback (pValue) {
    this._onCharEndCallback = pValue;
  }

 /*
  *
  * Class user may assign function to onToneCallback.
  * Function would be called each time tone playing changes.
  * Parameter is status: true / tone is played, false - tone is not played.
  * May be used to visualy show Morse code keying.
  *
  */  
  set onToneCallback (pValue) {
    this._onPlayCallback = pValue;
  }

  /*
  *
  * Audio Context must be initaliyed on user triggered event. 
  * This is handled internaly within class. User should not call this.
  *
  */
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


  /*
  *
  * Start playing tone. 
  * This is handled internaly within class. User should not call this.
  *
  */
  startTone() {
    this.initializeAudioContext();
    
    if (typeof this._onPlayCallback !== "undefined") {
      this._onPlayCallback(true);
    }    
    
    this.gain_node.gain.setTargetAtTime(0.1, 0, 0.001)
    
  }

  /*
  *
  * Stop playing tone. 
  * This is handled internaly within class. User should not call this.
  *
  */
  stopTone() {
    if (typeof this._onPlayCallback !== "undefined") {
      this._onPlayCallback(false);
    }     
    
    this.initializeAudioContext();
    this.gain_node.gain.setTargetAtTime(0, 0, 0.001)
  }

  /*
  *
  * Initiate delay which determines tone duration. 
  * This is handled internaly within class. User should not call this.
  *
  */
  makeDelay (pTime) {
    return new Promise(resolve => setTimeout(resolve, pTime));
  } 

  /*
  *
  * Play long Morse Code element
  * This is handled internaly within class. User should not call this.
  *
  */
  async playDash() {
    this.startTone();    
    await this.makeDelay(this.dashTime);
    this.stopTone();
  }  

  /*
  *
  * Play short Morse Code element
  * This is handled internaly within class. User should not call this.
  *
  */
  async playDot() {
    this.startTone();
    await this.makeDelay(this.dotTime);
    this.stopTone();
  }    

  /*
  *
  * Returns current tiem as formatted string. May be used to check timings. 
  * Not needed for regular function.
  *
  */
  getTime() {

    const zeroPad = (num, places) => String(num).padStart(places, '0')

    let today = new Date();
    let time = zeroPad (today.getHours(),2) + ":" + zeroPad (today.getMinutes(),2) + ":" + zeroPad (today.getSeconds(),2);
    return time;
  } // getTime()
  

  /*
  *
  * Plays Morse Code elements represented as group of dots and dashes.
  * Used internally. Should not be used by class user.
  *
  */
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
  
  
  /*
  *
  * Converts charactr to Morse Code elements. Example: R is converted to .-.
  * Used internally. Should not be used by class user.
  *
  */
  convertCharToMorseElements(pChar) {
    let lResult = '';
    if(typeof CHAR_TO_MORSECODE_MAP[pChar] !== 'undefined') {
      lResult = CHAR_TO_MORSECODE_MAP[pChar];
    }
    return lResult;
  }
  
  /*
  *
  * Plays input text as Morse Code sound.
  * This is main function. User shoudl call this to initiate playing sound.
  *
  */
   async playTextAsMorse (pText = '', pDoStartStopCallback = true) {
     
    this.setPlayStatusOn(); 
     
    let lText = pText.toUpperCase();
    
    for (let i = 0; i < lText.length; i++) {

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
          if (pDoStartStopCallback && (typeof this._onCharStartCallback !== "undefined")) {
            this._onCharStartCallback(lChar);
          }

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


  /*
  *
  * Stop playing Morse Code.
  * User should call this to stop playing sound, lliek when user clicks stop button.
  *
  */
  stopPlay() {
    this.setPlayStatusOff();
  }
  
} // class MorseCodeMachine
