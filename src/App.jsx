import { ThemeProvider } from './components/ThemeProvider'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Customers from '@/pages/Customers'
import Sales from '@/pages/Sales'

// function App() {

//   return (
//      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
//       <Home />
//       <Example />
//     </ThemeProvider>


//   )
// }

// export default App


function App() {
  return (
     <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;