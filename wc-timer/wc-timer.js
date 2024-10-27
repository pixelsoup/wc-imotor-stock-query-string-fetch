class WcTimer extends HTMLElement {
  constructor() {
    super();
    this.intervalId = null; // Variable to hold the interval ID
    this.count = 0; // Timer count
  }

  connectedCallback() {
    this.startTimer(); // Start the timer when element is added to the DOM
    console.log('Timer started and component added to the DOM');
  }

  disconnectedCallback() {
    this.stopTimer(); // Stop the timer when element is removed from the DOM
    console.log('Timer stopped and component removed from the DOM.');
  }

  startTimer() {
    this.count = 0; // Reset count when starting
    this.updateDisplay(); // Update initial display
    this.intervalId = setInterval(() => {
      this.count++;
      this.updateDisplay(); // Update display every second
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.intervalId); // Clear the interval to stop the timer
    this.intervalId = null; // Reset intervalId
  }

  updateDisplay() {
    this.innerHTML = `<p>Timer: ${this.count} seconds</p>`;
  }
}

// Define the custom element
customElements.define('wc-timer', WcTimer);

// Parent component to manage adding/removing the timer
class TimerManager extends HTMLElement {
  constructor() {
    super();
    this.timerElement = null; // Store reference to the timer element
  }

  connectedCallback() {
    this.render(); // Render initial UI
  }

  render() {
    this.innerHTML = `
            <button id="toggle-timer">Start Timer</button>
            <div id="timer-container"></div>
        `;

    const toggleButton = this.querySelector('#toggle-timer');
    toggleButton.addEventListener('click', () => this.toggleTimer());
  }

  toggleTimer() {
    const toggleButton = this.querySelector('#toggle-timer');

    if (this.timerElement) {
      // If timer exists, remove it
      this.timerElement.remove();
      this.timerElement = null; // Clear reference
      toggleButton.textContent = 'Start Timer'; // Change button text
    } else {
      // If timer does not exist, create and add it
      this.timerElement = document.createElement('wc-timer');
      this.querySelector('#timer-container').appendChild(this.timerElement);
      toggleButton.textContent = 'Stop Timer'; // Change button text
    }
  }
}

// Define the parent component
customElements.define('timer-manager', TimerManager);