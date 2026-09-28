import { createRoot } from "react-dom/client";
import "./styles.css";
import JourneyDashboard from "./JourneyDashboard";
import AuthFlow from "./components/auth/AuthFlow";
import { authService } from "./services/authService";
import { useState } from "react";

function App() {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  return user
    ? <JourneyDashboard
        user={user}
        initialTab="about"
        initialHealthProfile={user.health_profile || "general"}
        onLogout={() => { authService.signOut(); setUser(null); }}
      />
    : <AuthFlow onAuthenticated={setUser} />;
}

createRoot(document.getElementById("root")).render(<App />);
