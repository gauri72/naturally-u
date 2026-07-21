import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes.jsx';
import './App.css';

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster position="bottom-center" />
    </>
  );
}

export default App;
