// PaymentPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addDocument, getDocuments } from "@/services/db";
import { logCustomEvent } from "@/services/analytics";
import { getCurrentUser } from "@/services/auth";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

// Component Imports
import CustomerSelector from "@components/CustomerSelector";
import DateSelector from "@components/DateSelector";

// shadcn Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PaymentPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: new Date(),
    customerId: "",
    customerName: "",
    previousBalance: 0,
    paymentAmount: "",
    paymentType: "cash",
    cylindersReturned: "",
    notes: "",
  });

  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customerCylinders, setCustomerCylinders] = useState(0);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loading, setLoading] = useState({
    savePayment: false,
    fetchingData: true,
  });
  const [errors, setErrors] = useState({});
  const [validationTriggered, setValidationTriggered] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading((prev) => ({ ...prev, fetchingData: true }));
      try {
        const [customersData, transactionsData] = await Promise.all([
          getDocuments("customers"),
          getDocuments("transactions"),
        ]);

        setCustomers(customersData);
        setTransactions(transactionsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load necessary data");
      } finally {
        setLoading((prev) => ({ ...prev, fetchingData: false }));
      }
    };

    fetchData();
  }, []);

  const handleSelectCustomer = (customer) => {
    console.log("Selected customer:", customer);

    // Calculate cylinders outstanding based on transactions
    const customerTransactions = transactions.filter(
      (t) => t.customerId === customer.id
    );
    let cylindersOutstanding = 0;

    customerTransactions.forEach((transaction) => {
      if (transaction.transactionType === "cylinder") {
        // Add cylinders sold
        if (transaction.cylindersSold) {
          cylindersOutstanding += parseFloat(transaction.cylindersSold) || 0;
        }
        // Subtract cylinders returned
        if (transaction.cylindersReturned) {
          cylindersOutstanding -=
            parseFloat(transaction.cylindersReturned) || 0;
        }
      }
    });

    // Set customer history for display in modal
    setCustomerHistory(customerTransactions);
    setCustomerCylinders(cylindersOutstanding);

    setFormData({
      ...formData,
      customerId: customer.id,
      customerName: customer.name,
      previousBalance: customer.balance || 0,
    });

    if (validationTriggered) {
      setErrors((prev) => ({
        ...prev,
        customer: undefined,
      }));
    }

    toast.success(`Selected customer: ${customer.name}`, {
      duration: 2000,
      position: "bottom-right",
    });
  };

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    if (validationTriggered && errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Set validation as triggered
    setValidationTriggered(true);

    const validationErrors = {};

    // Validate customer selection
    if (!formData.customerId) {
      console.log("Customer validation failed, ID:", formData.customerId); // Debug log
      validationErrors.customer = "Customer is required";
    } else {
      console.log("Customer validation passed, ID:", formData.customerId); // Debug log
    }

    if (!formData.paymentAmount || parseFloat(formData.paymentAmount) <= 0) {
      validationErrors.paymentAmount = "Payment amount is required";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading((prev) => ({ ...prev, savePayment: true }));

    try {
      const paymentData = {
        date: formData.date.toISOString(),
        customerId: formData.customerId,
        customerName: formData.customerName,
        previousBalance: formData.previousBalance,
        paymentAmount: parseFloat(formData.paymentAmount),
        newBalance:
          formData.previousBalance - parseFloat(formData.paymentAmount),
        paymentType: formData.paymentType,
        cylindersReturned: formData.cylindersReturned
          ? parseInt(formData.cylindersReturned)
          : 0,
        previousCylinders: customerCylinders,
        newCylinders:
          customerCylinders -
          (formData.cylindersReturned
            ? parseInt(formData.cylindersReturned)
            : 0),
        notes: formData.notes,
        timestamp: new Date(),
        createdBy: getCurrentUser()?.uid || "unknown",
      };

      const paymentId = await addDocument("payments", paymentData);

      // Also update customer balance records
      await addDocument("customerBalanceUpdates", {
        customerId: formData.customerId,
        paymentId,
        previousBalance: formData.previousBalance,
        newBalance: paymentData.newBalance,
        timestamp: new Date(),
        type: "payment",
      });

      // Update the customer's balance in customers collection
      // This would typically be handled by a backend function/trigger
      // But we'll simulate it here for now

      logCustomEvent("payment_recorded", {
        payment_id: paymentId,
        customer_id: formData.customerId,
        payment_amount: paymentData.paymentAmount,
        payment_type: formData.paymentType,
      });

      toast.success(
        `Payment of $${paymentData.paymentAmount.toFixed(2)} recorded for ${
          formData.customerName
        }`,
        {
          duration: 5000,
          position: "top-center",
        }
      );

      // Reset form
      setFormData({
        date: new Date(),
        customerId: "",
        customerName: "",
        previousBalance: 0,
        paymentAmount: "",
        paymentType: "cash",
        cylindersReturned: "",
        notes: "",
      });

      // Reset validation state alongside form
      setValidationTriggered(false);
      setErrors({});
    } catch (error) {
      console.error("Error submitting payment:", error);
      toast.error("Failed to record payment. Please try again.", {
        duration: 5000,
        position: "top-center",
      });
    } finally {
      setLoading((prev) => ({ ...prev, savePayment: false }));
    }
  };

  return (
    <Card className="max-w-4xl mx-auto shadow">
      <CardHeader className="bg-muted/40 flex flex-row justify-between items-center">
        <CardTitle className="text-2xl font-bold">
          {formData.customerName ? formData.customerName : "Record Payment"}
        </CardTitle>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          size="sm"
          className="flex items-center"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      </CardHeader>

      {loading.fetchingData ? (
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <svg
              className="animate-spin h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-lg">Loading customer data...</span>
          </div>
        </CardContent>
      ) : (
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and Customer Selection Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Payment Date</Label>
                <DateSelector
                  value={formData.date}
                  onChange={(date) => handleChange("date", date)}
                />
              </div>

              <CustomerSelector
                customers={customers}
                selectedCustomer={formData.customerName}
                error={validationTriggered ? errors.customer : undefined}
                onSelectCustomer={handleSelectCustomer}
                onAddNewCustomer={null} // Removed ability to add customer
              />
            </div>

            {/* Customer Information */}
            {formData.customerId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Balance Display */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Current Balance:
                    </span>
                    <span
                      className={`text-xl font-bold ${
                        formData.previousBalance > 0
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      ${formData.previousBalance.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Cylinders Not Returned */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Cylinders Outstanding:
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {customerCylinders}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground text-right">
                    <button
                      type="button"
                      className="text-primary underline hover:text-primary/80"
                      onClick={() => setShowHistoryModal(true)}
                    >
                      View transaction history
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment Amount */}
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount ($)</Label>
                <Input
                  id="paymentAmount"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter amount"
                  value={formData.paymentAmount}
                  onChange={(e) =>
                    handleChange("paymentAmount", e.target.value)
                  }
                  className={
                    validationTriggered && errors.paymentAmount
                      ? "border-destructive"
                      : ""
                  }
                />
                {validationTriggered && errors.paymentAmount && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.paymentAmount}
                  </p>
                )}
              </div>

              {/* Cylinders Returned */}
              <div className="space-y-2">
                <Label htmlFor="cylindersReturned">
                  Empty Cylinders Returned
                </Label>
                <Input
                  id="cylindersReturned"
                  type="text"
                  inputMode="numeric"
                  placeholder="Number of cylinders"
                  value={formData.cylindersReturned}
                  onChange={(e) =>
                    handleChange("cylindersReturned", e.target.value)
                  }
                />
              </div>
            </div>

            {/* New Balance Display */}
            {formData.paymentAmount &&
              !isNaN(parseFloat(formData.paymentAmount)) && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      New Balance After Payment:
                    </span>
                    <span
                      className={`text-xl font-bold ${
                        formData.previousBalance -
                          parseFloat(formData.paymentAmount) >
                        0
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      $
                      {(
                        formData.previousBalance -
                        parseFloat(formData.paymentAmount)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="flex rounded-md overflow-hidden border">
                <Button
                  type="button"
                  variant={
                    formData.paymentType === "cash" ? "default" : "ghost"
                  }
                  className={`flex-1 rounded-none ${
                    formData.paymentType === "cash" ? "" : "border-r"
                  }`}
                  onClick={() => handleChange("paymentType", "cash")}
                >
                  Cash
                </Button>
                <Button
                  type="button"
                  variant={
                    formData.paymentType === "cheque" ? "default" : "ghost"
                  }
                  className="flex-1 rounded-none"
                  onClick={() => handleChange("paymentType", "cheque")}
                >
                  Cheque
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Add any notes about this payment"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>

            {/* Transaction History Modal */}
            {showHistoryModal && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-medium">
                      Transaction History: {formData.customerName}
                    </h2>
                    <button
                      onClick={() => setShowHistoryModal(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <div className="overflow-y-auto p-4 flex-1">
                    {customerHistory.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="text-md font-medium">Transactions</h3>
                        <div className="border rounded-md overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-muted">
                              <tr>
                                <th className="p-2 text-left">Date</th>
                                <th className="p-2 text-left">Type</th>
                                <th className="p-2 text-right">Amount</th>
                                <th className="p-2 text-right">Cylinders</th>
                              </tr>
                            </thead>
                            <tbody>
                              {customerHistory.map((transaction, index) => (
                                <tr key={index} className="border-t">
                                  <td className="p-2">
                                    {new Date(
                                      transaction.date
                                    ).toLocaleDateString()}
                                  </td>
                                  <td className="p-2">
                                    {transaction.transactionType === "cylinder"
                                      ? "Cylinder Sale"
                                      : "Weight-Based"}
                                  </td>
                                  <td className="p-2 text-right">
                                    $
                                    {transaction.totalAmount?.toFixed(2) ||
                                      "0.00"}
                                  </td>
                                  <td className="p-2 text-right">
                                    {transaction.transactionType === "cylinder"
                                      ? `+${
                                          transaction.cylindersSold || 0
                                        } / -${
                                          transaction.cylindersReturned || 0
                                        }`
                                      : "N/A"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No transaction history available
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t">
                    <Button
                      onClick={() => setShowHistoryModal(false)}
                      className="w-full"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      )}

      <CardFooter className="flex justify-center pt-0 pb-6">
        <Button
          type="submit"
          className="w-full max-w-xs"
          disabled={loading.savePayment}
          size="lg"
          onClick={handleSubmit}
        >
          {loading.savePayment ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            "Record Payment"
          )}
        </Button>
      </CardFooter>

      {/* Dialogs - Removed NewCustomerDialog */}
    </Card>
  );
};

export default PaymentPage;
