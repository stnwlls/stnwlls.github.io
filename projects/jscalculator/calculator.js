const display = document.getElementById('display');

function appendToDisplay(input) {
    if (display.value.length < 7) {
        display.value += input;
    }
}

function clearDisplay() {
    display.value = '';
}

function calculate() {
    try {
        display.value = eval(display.value);
    } catch {
        display.value = 'error';
    }
}

function toggleSign() {
    if (display.value !== '') {
        display.value = display.value.startsWith('-') ? display.value.substring(1) : '-' + display.value;
    }
}