import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import MeetingPage from "./pages/MeetingPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<MeetingPage/>}>
            </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}