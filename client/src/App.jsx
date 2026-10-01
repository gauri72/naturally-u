import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes.jsx';
import PwaStatus from './components/common/PwaStatus.jsx';
import './App.css';

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster position="bottom-center" />
      <PwaStatus />
    </>
  );
}

export default App;
