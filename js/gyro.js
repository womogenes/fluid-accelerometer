const $ = document.querySelector.bind(document);

const format = (value) => {
  return (Math.round(value * 1000) / 1000).toFixed(3).padStart(6, ' ');
};

export let gravity;

const motionHandler = (event) => {
  gravity = event.accelerationIncludingGravity;
};

window.startCapture = () => {
  if (!DeviceMotionEvent.requestPermission) {
    return;
  }

  DeviceMotionEvent.requestPermission()
    .then((response) => {
      if (response === 'granted') {
        window.addEventListener('devicemotion', motionHandler);
      }
    })
    .catch(alert);
};

document.body.addEventListener('touchend', startCapture);
