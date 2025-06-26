// Importă componentele de routing
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pagini
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import SensorCharts from "./pages/SensorCharts";
import Notifications from "./pages/Notifications";
import AiAnalysisHistory from "./pages/AiAnalysisHistory";

// Componentă care protejează rutele autentificate
import PrivateRoute from "./components/PrivateRoute";

// Notificări toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context pentru tema (light/dark)
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    // Învelește aplicația în ThemeProvider pentru a gestiona tema
    <ThemeProvider>
      {/* Configurează routerul */}
      <BrowserRouter>
        {/* Containerul pentru toast-uri globale */}
        <ToastContainer position="bottom-right" autoClose={3000} />

        {/* Definește toate rutele aplicației */}
        <Routes>
          {/* Pagina de start (Landing) */}
          <Route path="/" element={<Landing />} />

          {/* Pagini neautentificate */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rute protejate de autentificare */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/grafice/:plantId"
            element={
              <PrivateRoute>
                <SensorCharts />
              </PrivateRoute>
            }
          />

          <Route
            path="/notificari"
            element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            }
          />

          {/* Istoric AI – nu e protejat direct, poate fi accesat public */}
          <Route path="/analize/:uid/:plantId" element={<AiAnalysisHistory />} />

          {/* Rută de fallback pentru pagini inexistente */}
          <Route
            path="*"
            element={
              <div className="p-10 text-center text-xl">
                404 - Pagina nu există
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
