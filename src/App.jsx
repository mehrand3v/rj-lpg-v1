// App.jsx
import { ThemeProvider } from "@/components/ThemeProvider";
import { RouterProvider } from "react-router-dom";
import { ToastProvider } from "@/components/ui/toast";
import router from "@/router/appRouter";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
