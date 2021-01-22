const keyLayoutEn = [
  ['`', `~`],
  ['1', '!'],
  ['2', '@'],
  ['3', '#'],
  ['4', '$'],
  ['5', '%'],
  ['6', '^'],
  ['7', '&'],
  ['8', '*'],
  ['9', '('],
  ['0', ')'],
  ['-', '_'],
  ['=', '+'],
  'Backspace',
  'q',
  'w',
  'e',
  'r',
  't',
  'y',
  'u',
  'i',
  'o',
  'p',
  ['[', '{'],
  [']', '}'],
  ['\\', '|'],
  'caps',
  'a',
  's',
  'd',
  'f',
  'g',
  'h',
  'j',
  'k',
  'l',
  [';', ':'],
  ["'", '"'],
  'Enter',
  'done',
  'shift',
  'z',
  'x',
  'c',
  'v',
  'b',
  'n',
  'm',
  [',', '<'],
  ['.', '>'],
  ['/', '?'],
  'mic_off',
  'volume_up',
  'EN',
  ' ',
  'ArrowLeft',
  'ArrowRight',
];
const keyLayoutRu = [
  'ё',
  ['1', '!'],
  ['2', '"'],
  ['3', '№'],
  ['4', ';'],
  ['5', '%'],
  ['6', ':'],
  ['7', '?'],
  ['8', '*'],
  ['9', '('],
  ['0', ')'],
  ['-', '_'],
  ['=', '+'],
  'Backspace',
  'й',
  'ц',
  'у',
  'к',
  'е',
  'н',
  'г',
  'ш',
  'щ',
  'з',
  'х',
  'ъ',
  ['\\', '/'],
  'caps',
  'ф',
  'ы',
  'в',
  'а',
  'п',
  'р',
  'о',
  'л',
  'д',
  'ж',
  'э',
  'Enter',
  'done',
  'shift',
  'я',
  'ч',
  'с',
  'м',
  'и',
  'т',
  'ь',
  'б',
  'ю',
  ['.', ','],
  'mic_off',
  'volume_up',
  'RU',
  ' ',
  'ArrowLeft',
  'ArrowRight',
];

const textArea = document.querySelector('.use-keyboard-input');
window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

const Keyboard = {
  elements: {
    main: null,
    keyboard: null,
    keysContainer: null,
    keys: [],
  },

  eventHandlers: {
    oninput: null,
    onclose: null,
  },

  properties: {
    value: '',
    capsLock: false,
    shift: false,
    langEn: true,
    soundOn: true,
    voiceInput: false,
  },

  init() {
    // Create main elements
    this.elements.main = document.createElement('div');
    this.elements.keysContainer = document.createElement('div');

    // Setup main elements
    this.elements.main.classList.add('keyboard', 'keyboard--hidden');
    this.elements.keysContainer.classList.add('keyboard__keys');

    // Add to DOM
    this.elements.main.appendChild(this.elements.keysContainer);
    document.body.appendChild(this.elements.main);

    // Automatically use keyboard for elements with .use-keyboard-input
    document.querySelectorAll('.use-keyboard-input').forEach((element) => {
      element.addEventListener('focus', () => {
        this.open(element.value, (currentValue) => {
          element.value = currentValue;
        });
      });
    });
  },

  //create layout and setup keys
  _createKeys(keyLayout) {
    if (this.properties.langEn) {
      keyLayout = keyLayoutEn;
    } else {
      keyLayout = keyLayoutRu;
    }

    // Creates HTML for an icon
    const createIconHTML = (icon_name) => {
      return `<i class="material-icons">${icon_name}</i>`;
    };

    keyLayout.forEach((key) => {
      const keyElement = document.createElement('button');

      keyElement.setAttribute('type', 'button');
      keyElement.classList.add('keyboard__key');

      if (key instanceof Array) {
        if (key instanceof Array && this.properties.shift === true) {
          key = key[1];
        } else {
          key = key[0];
        }
      }

      switch (key) {
        case 'Backspace':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.innerHTML = createIconHTML('backspace');

          keyElement.addEventListener('click', () => {
            this.playSound(8);
            let start = undefined;
            let end = undefined;

            if (textArea.selectionEnd < this.properties.value.length) {
              start = this.properties.value.substring(
                0,
                textArea.selectionEnd - 1
              );
              end = this.properties.value.substring(
                textArea.selectionEnd,
                this.properties.value.length
              );
              this.properties.value = start + end;
            } else {
              this.properties.value = this.properties.value.substring(
                0,
                this.properties.value.length - 1
              );
            }
            textArea.value = this.properties.value;

            if (end) {
              textArea.selectionStart = textArea.selectionEnd =
                textArea.selectionEnd - end.length;
            }

            textArea.focus();
          });
          break;

        case 'caps':
          keyElement.classList.add(
            'keyboard__key--wide',
            'keyboard__key--activatable'
          );
          keyElement.id = 'capslock';
          keyElement.innerHTML = createIconHTML('keyboard_capslock');

          keyElement.addEventListener('click', () => {
            this.playSound(20);
            this._toggleCapsLock();
            keyElement.classList.toggle('keyboard__key--active');
          });
          break;

        case 'shift':
          keyElement.classList.add(
            'keyboard__key--wide',
            'keyboard__key--activatable'
          );
          keyElement.innerHTML = `shift${createIconHTML('')}`;

          keyElement.addEventListener('click', (event) => {
            this.playSound(16);
            this._toggleShift(event);
            keyElement.classList.toggle('keyboard__key--active');
          });
          break;

        case 'Enter':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.id = 'return';
          keyElement.innerHTML = createIconHTML('keyboard_return');

          keyElement.addEventListener('click', () => {
            this.playSound(13);
            this.properties.value = '\n';
            this.updateInput();
            textArea.focus();
          });
          break;

        case ' ':
          keyElement.classList.add('keyboard__key--extra-wide');
          keyElement.id = 'space';
          keyElement.innerHTML = createIconHTML('space_bar');

          keyElement.addEventListener('click', () => {
            if (this.properties.langEn) {
              this.playSound('EN');
            } else {
              this.playSound('RU');
            }

            this.properties.value = ' ';
            this.updateInput();
            textArea.focus();
          });
          break;

        case 'done':
          keyElement.classList.add(
            'keyboard__key--wide',
            'keyboard__key--dark'
          );
          keyElement.innerHTML = createIconHTML('check_circle');

          keyElement.addEventListener('click', () => {
            this.close();
            this._triggerEvent('onclose');
          });
          break;

        case 'EN':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.innerHTML = `EN ${createIconHTML('language')}`;

          keyElement.addEventListener('click', () => {
            this._toggleLanguage();
          });
          break;

        case 'RU':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.innerHTML = ` ${createIconHTML('language')} RU`;

          keyElement.addEventListener('click', () => {
            this._toggleLanguage();
          });
          break;

        case 'volume_up':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.innerHTML = createIconHTML('volume_up');

          keyElement.addEventListener('click', (event) => {
            this._toggleSound(event);
          });
          break;

        case 'mic_off':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.innerHTML = createIconHTML('mic_off');

          keyElement.addEventListener('click', (event) => {
            this._toggleVoiceInput(event);
          });
          break;

        case 'ArrowLeft':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.id = 'arrow_left';
          keyElement.innerHTML = createIconHTML('arrow_back');

          keyElement.addEventListener('click', () => {
            if (this.properties.langEn) {
              this.playSound('EN');
            } else {
              this.playSound('RU');
            }
            textArea.selectionEnd--;
            textArea.focus();
          });
          break;

        case 'ArrowRight':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.id = 'arrow_right';
          keyElement.innerHTML = createIconHTML('arrow_forward');

          keyElement.addEventListener('click', () => {
            if (this.properties.langEn) {
              this.playSound('EN');
            } else {
              this.playSound('RU');
            }
            textArea.selectionStart++;
            textArea.focus();
          });
          break;

        default:
          keyElement.textContent = key;

          keyElement.addEventListener('click', () => {
            if (this.properties.langEn) {
              this.playSound('EN');
            } else {
              this.playSound('RU');
            }

            this.properties.value = keyElement.innerText;
            this.updateInput();
            textArea.focus();
          });
          break;
      }

      this.elements.keysContainer.appendChild(keyElement);

      //  add line-break to end line
      if (
        keyElement.innerText === '\\' ||
        keyElement.innerText === '|' ||
        (keyElement.innerText === '/' && this.properties.langEn === false)
      ) {
        keyElement.after(document.createElement('br'));
      }
      let insertLineBreak =
        ['Backspace', 'Enter', '?', '/'].indexOf(key) !== -1;
      if (insertLineBreak && this.properties.langEn === true) {
        this.elements.keysContainer.appendChild(document.createElement('br'));
      } else if (
        (keyElement.innerText === '.' || keyElement.innerText === ',') &&
        this.properties.langEn === false
      ) {
        this.elements.keysContainer.appendChild(document.createElement('br'));
      }

      this.elements.keys = this.elements.keysContainer.querySelectorAll(
        '.keyboard__key'
      );
    });

    return this.elements.keysContainer;
  },

  //handle events
  _triggerEvent(handlerName) {
    if (typeof this.eventHandlers[handlerName] == 'function') {
      this.eventHandlers[handlerName](this.properties.value);
    }
  },

  //setup capslock
  _toggleCapsLock() {
    this.properties.capsLock = !this.properties.capsLock;

    for (const key of this.elements.keys) {
      if (key.childElementCount === 0) {
        if (this.properties.capsLock && this.properties.shift) {
          key.textContent = key.textContent.toLowerCase();
        } else if (
          (this.properties.shift === true &&
            this.properties.capsLock === false) ||
          this.properties.capsLock
        ) {
          key.textContent = key.textContent.toUpperCase();
        } else {
          key.textContent = key.textContent.toLowerCase();
        }
      }
    }
    textArea.focus();
  },

  //setup shift
  _toggleShift() {
    this.properties.shift = !this.properties.shift;

    this.elements.keysContainer
      .querySelectorAll('button')
      .forEach((btn) => btn.remove());

    this.elements.keysContainer
      .querySelectorAll('br')
      .forEach((br) => br.remove());

    this._createKeys();

    for (const key of this.elements.keys) {
      if (key.childElementCount === 0) {
        if (this.properties.capsLock && this.properties.shift) {
          key.textContent = key.textContent.toLowerCase();
        } else if (
          (this.properties.shift === false &&
            this.properties.capsLock === true) ||
          this.properties.shift
        ) {
          key.textContent = key.textContent.toUpperCase();
        } else {
          key.textContent = key.textContent.toLowerCase();
        }
      }
    }
    textArea.focus();
  },

  //update textarea input
  updateInput() {
    textArea.setRangeText(
      this.properties.value,
      textArea.selectionStart,
      textArea.selectionEnd,
      'end'
    );
  },

  // add sound keys
  playSound(keyCode) {
    if (this.properties.soundOn === true) {
      const audio = document.querySelector(`audio[data-key="${keyCode}"]`);
      if (!audio) return;
      audio.currentTime = 0;
      audio.play();
    } else {
      return;
    }
  },

  //setup sound keys
  _toggleSound(event) {
    this.properties.soundOn = !this.properties.soundOn;
    if (this.properties.soundOn === true) {
      event.currentTarget.innerHTML = '<i class="material-icons">volume_up</i>';
    } else {
      event.currentTarget.innerHTML =
        '<i class="material-icons">volume_off</i>';
    }
  },

  //add voice input
  voiceInput() {
    recognition.interimResults = true;

    if (this.properties.voiceInput === true) {
      if (this.properties.langEn === true) recognition.lang = 'en-UK';
      else recognition.lang = 'ru-RU';

      recognition.addEventListener('result', this.resultHandler);

      recognition.addEventListener('end', recognition.start);
      recognition.start();
    }
  },

  //handler for voice input
  resultHandler(event) {
    const transcript = Array.from(event.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join('');
    if (event.results[0].isFinal) {
      textArea.value += transcript + ' ';
      recognition.stop();
    }
  },

  //setup voice input
  _toggleVoiceInput(event) {
    this.properties.voiceInput = !this.properties.voiceInput;

    if (this.properties.voiceInput === true) {
      event.currentTarget.innerHTML = '<i class="material-icons">mic</i>';
      this.voiceInput();
    } else {
      event.currentTarget.innerHTML = '<i class="material-icons">mic_off</i>';
      recognition.removeEventListener('end', recognition.start);
      recognition.removeEventListener('result', this.resultHandler);
      recognition.abort();
      recognition.stop();
    }
  },

  //setup language
  _toggleLanguage() {
    this.properties.langEn = !this.properties.langEn;

    this.elements.keysContainer
      .querySelectorAll('button')
      .forEach((btn) => btn.remove());

    this.elements.keysContainer
      .querySelectorAll('br')
      .forEach((br) => br.remove());

    this.properties.langEn
      ? this._createKeys(keyLayoutEn)
      : this._createKeys(keyLayoutRu);

    textArea.focus();
    textArea.selectionStart = textArea.value.length;

    this.properties.capsLock = false;
    this.properties.shift = false;
    this.properties.soundOn = true;
  },

  //open keyboard
  open(initialValue, oninput, onclose) {
    this.properties.value = initialValue || '';
    this.eventHandlers.oninput = oninput;
    this.eventHandlers.onclose = onclose;
    this.elements.main.classList.remove('keyboard--hidden');
  },

  //close keyboard
  close() {
    this.properties.value = '';
    this.eventHandlers.oninput = oninput;
    this.eventHandlers.onclose = onclose;
    this.elements.main.classList.add('keyboard--hidden');
  },
};

// add key illumination
function keyClicked(event) {
  let keys = document.querySelectorAll('button');
  keys.forEach((key) => {
    if (
      event.key === key.textContent ||
      event.key.toUpperCase() === key.textContent.toUpperCase()
    ) {
      key.classList.add('key_clicked');
    } else if (event.key === 'Enter') {
      key = document.getElementById('return');
      key.classList.add('key_clicked');
    } else if (event.key === ' ') {
      key = document.getElementById('space');
      key.classList.add('key_clicked');
    } else if (event.key === 'CapsLock') {
      key = document.getElementById('capslock');
      key.classList.add('key_clicked');
    } else if (event.key === 'ArrowLeft') {
      key = document.getElementById('arrow_left');
      key.classList.add('key_clicked');
    } else if (event.key === 'ArrowRight') {
      key = document.getElementById('arrow_right');
      key.classList.add('key_clicked');
    }
  });
}

// remove key illumination
function keyNotClicked(event) {
  let keys = document.querySelectorAll('button');
  keys.forEach((key) => {
    key.classList.remove('key_clicked');
  });
}

//event handlers
window.addEventListener('DOMContentLoaded', function () {
  Keyboard.init();
  Keyboard._createKeys();
});
window.addEventListener('keydown', keyClicked);
window.addEventListener('keyup', keyNotClicked);
