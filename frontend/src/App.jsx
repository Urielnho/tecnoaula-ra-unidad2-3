import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";
import Navigation from "./routes/Navigation";
export default function App() {
  return (
    <AuthProvider>
      <Navigation />
      <ToastContainer
        position="bottom-right"
        autoClose={4500}
        hideProgressBar
      />
    </AuthProvider>
  );
}
