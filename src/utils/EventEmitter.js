class EventEmitter {
  
  constructor() {
    this.listeners = {}
  }

  on(event, fn) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(fn);
  }

  removeListener(event, fn) {
    if (this.listeners[event]) {
      const index = this.listeners[event].findIndex(listener => listener === fn);
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(fn => fn(data));
    }
  }
}

export default EventEmitter;
