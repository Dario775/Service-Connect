import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Configuración del proyecto de Firebase.
// Esta información se encuentra en la consola de Firebase, en la configuración de tu proyecto.
const firebaseConfig = {
  apiKey: "AIzaSyD7EpX7zOaAYKIdbcJqbL8CRCfFCVyK4_4",
  authDomain: "magnetron-d409f.firebaseapp.com",
  projectId: "magnetron-d409f",
  storageBucket: "magnetron-d409f.firebasestorage.app",
  messagingSenderId: "566418328805",
  appId: "1:566418328805:web:d8778170c4392fe501580c"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los servicios que necesites
export const auth = getAuth(app);
