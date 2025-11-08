import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// TODO: Reemplaza la siguiente configuración con la de tu proyecto de Firebase.
// Puedes encontrar esta información en la consola de Firebase, en la configuración de tu proyecto.
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// Validación de la configuración de Firebase
if (firebaseConfig.apiKey === "TU_API_KEY" || firebaseConfig.authDomain === "TU_AUTH_DOMAIN") {
  // Este error detendrá la ejecución y será visible en la consola del navegador.
  // Es una medida deliberada para asegurar que la configuración sea reemplazada.
  throw new Error("La configuración de Firebase no es válida. Por favor, reemplaza los valores de marcador de posición en 'src/firebase/config.ts' con tus propias credenciales de proyecto de Firebase para continuar.");
}


// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los servicios que necesites
export const auth = getAuth(app);