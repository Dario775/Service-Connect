

// FIX: Use Firebase v9 compat imports for v8 syntax with default import.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

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
// FIX: Use Firebase v8 compatible initialization and check if it's already initialized.
// FIX: Use optional chaining to prevent crash if firebase.apps is undefined.
if (!firebase.apps?.length) {
  firebase.initializeApp(firebaseConfig);
}

// Exporta los servicios que necesites
// FIX: Use Firebase v8 compatible auth export
export const auth = firebase.auth();