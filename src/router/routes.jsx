import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Sales from "@/pages/Sales";
import PaymentPage from "@/pages/PaymentPage";
import NotFound from "@/pages/NotFound";
import ErrorPage from "@/pages/ErrorPage";
// Ensure that your routes are passed to a React Router component
import { Navigate } from "react-router-dom";
import TransactionForm from "@/pages/TransactionForm";

const routes = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />, // Handles crashes, API failures, etc.
    children: [
      { index: true, element: <Dashboard /> }, // Default to  Dashboard
      { path: "customers", element: <Customers /> }, // Customer list
      { path: "sales", element: <TransactionForm /> }, // Sales list
      { path: "sales/new", element: <TransactionForm /> }, // Sales list
      { path: "payment", element: <PaymentPage /> }, // Payment page
      //   { path: "customers/billing", element: <MonthlyBillingStatement /> }, // Billing statement page
      //   { path: "customers/transactions", element: <TransactionSummary /> }, // Transaction history page
      //   { path: "customers/transactions/new", element: <TransactionForm /> }, // Add new transaction form
      //   { path: "transactions", element: <TransactionSummary /> }, // Direct transactions page
      { path: "dashboard", element: <Navigate to="/" replace /> }, // Redirect to default
      { path: "*", element: <NotFound /> }, // 404 Not Found
    ],
  },
];

export default routes;