let activeSocket = null;
const subscribers = new Set();

function notifySubscribers() {
  subscribers.forEach((callback) => {
    try {
      callback(activeSocket);
    } catch (error) {
      console.warn('[socketClient] subscriber error:', error);
    }
  });
}

export function setActiveSocket(socket) {
  activeSocket = socket;
  notifySubscribers();
}

export function clearActiveSocket(socket) {
  if (socket && activeSocket !== socket) {
    return;
  }

  activeSocket = null;
  notifySubscribers();
}

export function subscribeToSocket(callback) {
  subscribers.add(callback);
  callback(activeSocket);

  return () => {
    subscribers.delete(callback);
  };
}
