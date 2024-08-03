const { initializeApp } = require('firebase/app');

const firebaseConfig = {
  apiKey: "AIzaSyD9KXoQob8sPlGziT8vJNdr72DJwm0xRq9g",
  authDomain: "central-grafica-a134f.firebaseapp.com",
  projectId: "central-grafica-a134f",
  storageBucket: "central-grafica-a134f.appspot.com",
  messagingSenderId: "961137480814",
  appId: "1:961137480814:web:88c35d53a2c9d1fefd0e1f",
  measurementId: "G-WBWTZNR89D"
};

const app = initializeApp(firebaseConfig);

module.exports = app;
