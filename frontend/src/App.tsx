import Router from "./routes/Router";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-left" reverseOrder={false} />
      <Router />
    </>
  );
}

export default App;
