import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import AddSnippet from "./pages/add-snippet";
import EditSnippet from "./pages/edit-snippet";
import Login from "./pages/login";
import Profile from "./pages/profile";
import Navbar from "./pages/navbar";
import Footer from "./pages/footer";

function App() {
  return (<>
  <Navbar />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/add-snippet" element={<AddSnippet />} />
      <Route path="/edit-snippet/:id" element={<EditSnippet />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
    <Footer/>
    </>
  );
}

export default App;