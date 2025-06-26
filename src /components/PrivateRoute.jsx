// Importă Navigate pentru redirecționare între rute
import { Navigate } from "react-router-dom";
// Importă instanța Firebase Auth
import { auth } from "../services/firebase";
// Hook-uri React
import { useEffect, useState } from "react";
// Funcție Firebase care ascultă schimbările de autentificare
import { onAuthStateChanged } from "firebase/auth";

// Componentă pentru protejarea rutelor private
const PrivateRoute = ({ children }) => {
  // Stare pentru a afișa un ecran de așteptare cât timp verificăm autentificarea
  const [loading, setLoading] = useState(true);
  // Stare pentru a reține utilizatorul autentificat (sau null)
  const [user, setUser] = useState(null);

  // La montarea componentei, începem să ascultăm schimbările de autentificare
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);   // Salvăm utilizatorul (sau null dacă nu e autentificat)
      setLoading(false);       // Gata verificarea
    });

    // Curățăm listenerul când componenta se demontează
    return () => unsubscribe();
  }, []);

  // Afișează un mesaj temporar cât timp așteptăm răspunsul de la Firebase
  if (loading) {
    return <div className="p-6 text-center text-lg">Se încarcă...</div>;
  }

  // Dacă user este definit => renderizează componenta copil (ruta privată)
  // Dacă nu => redirecționează către pagina de start ("/")
  return user ? children : <Navigate to="/" />;
};

export default PrivateRoute;
