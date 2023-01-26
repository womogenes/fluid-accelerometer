export let gravity;

const motionHandler = (event) => {
  gravity = event.accelerationIncludingGravity;
};

if (!DeviceMotionEvent.requestPermission) {
  alert(
    'Device motion API not available. 🙁 Try loading this page on a mobile device, such as a phone or tablet.'
  );
}

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
document.body.addEventListener('mouseup', startCapture);
