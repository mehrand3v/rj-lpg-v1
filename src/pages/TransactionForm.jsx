// TransactionForm.jsx
import { useState, useEffect } from "react";
import { addDocument, getDocuments } from "@/services/db";
import { logCustomEvent } from "@/services/analytics";
import { getCurrentUser } from "@/services/auth";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { Plus } from "lucide-react";

// Component Imports
import CustomerSelector from "@components/CustomerSelector";
import NewCustomerDialog from "@components/NewCustomerDialog";
import NewVehicleDialog from "@components/NewVehicleDialog";
import TransactionTypeToggle from "@components/TransactionTypeToggle";
import DateSelector from "@components/DateSelector";
import CylinderTransactionFields from "@components/CylinderTransactionFields";
import WeightTransactionFields from "@components/WeightTransactionFields";
import PaymentDetails from "@components/PaymentDetails";
import PaymentTypeToggle from "@components/PaymentTypeToggle";

// shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const TransactionForm = () => {
  const [formData, setFormData] = useState({
    date: new Date(),
    customerId: "",
    customerName: "",
    transactionType: "cylinder",
    vehicleRego: "",
    cylindersSold: "",
    cylinderRate: "100", // Default rate
    gasSoldKg: "",
    gasRateKg: "10", // Default rate
    cylindersReturned: "",
    totalCylindersDue: 0,
    totalAmount: 0,
    amountReceived: "",
    previousBalance: 0,
    remainingBalance: 0,
    paymentType: "cash",
    vehicles: [], // This will hold the vehicles for the selected customer
  });

  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [newCustomerDialogOpen, setNewCustomerDialogOpen] = useState(false);
  const [newVehicleDialogOpen, setNewVehicleDialogOpen] = useState(false);
  const [loading, setLoading] = useState({
    saveTransaction: false,
    fetchingData: true,
  });
  const isSubmitting = loading.saveTransaction; // Add this line to fix the error
  const [errors, setErrors] = useState({});
  // Flag to indicate if validation has been triggered (only after form submission)
  const [validationTriggered, setValidationTriggered] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading((prev) => ({ ...prev, fetchingData: true }));
      try {
        // Fetch customers and vehicles in parallel
        const [customersData, vehiclesData] = await Promise.all([
          getDocuments("customers"),
          getDocuments("vehicles"),
        ]);

        setCustomers(customersData);
        setVehicles(vehiclesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load necessary data");
      } finally {
        setLoading((prev) => ({ ...prev, fetchingData: false }));
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Only calculate when we have valid numbers
    let cylinderTotal = 0;
    let gasTotal = 0;

    if (
      formData.transactionType === "cylinder" &&
      formData.cylindersSold &&
      formData.cylinderRate
    ) {
      cylinderTotal =
        parseFloat(formData.cylindersSold) * parseFloat(formData.cylinderRate);
    }

    if (
      formData.transactionType === "weight" &&
      formData.gasSoldKg &&
      formData.gasRateKg
    ) {
      gasTotal =
        parseFloat(formData.gasSoldKg) * parseFloat(formData.gasRateKg);
    }

    const total =
      formData.transactionType === "cylinder" ? cylinderTotal : gasTotal;

    // Calculate remaining balance only when amountReceived has a value
    let remainingBalance = formData.previousBalance + total;
    if (formData.amountReceived) {
      remainingBalance -= parseFloat(formData.amountReceived);
    }

    // Calculate total cylinders due only when all fields have values
    let totalCylindersDue = 0;
    if (
      formData.transactionType === "cylinder" &&
      formData.cylinderRate &&
      parseFloat(formData.cylinderRate) > 0
    ) {
      const previousCylinders =
        formData.previousBalance / parseFloat(formData.cylinderRate);
      const soldCylinders = formData.cylindersSold
        ? parseFloat(formData.cylindersSold)
        : 0;
      const returnedCylinders = formData.cylindersReturned
        ? parseFloat(formData.cylindersReturned)
        : 0;

      totalCylindersDue = Math.max(
        0,
        previousCylinders + soldCylinders - returnedCylinders
      );
    }

    setFormData((prev) => ({
      ...prev,
      totalAmount: total,
      remainingBalance: remainingBalance,
      totalCylindersDue: totalCylindersDue,
    }));
  }, [
    formData.cylindersSold,
    formData.cylinderRate,
    formData.gasSoldKg,
    formData.gasRateKg,
    formData.amountReceived,
    formData.previousBalance,
    formData.cylindersReturned,
    formData.transactionType,
  ]);

  const handleSelectCustomer = (customer) => {
    console.log("Selected customer:", customer); // Debug log

    // Filter vehicles for this customer
    const customerVehicles = vehicles.filter(
      (vehicle) => vehicle.customerId === customer.id
    );

    // Explicitly set customerId and clear any customer validation errors
    setFormData({
      ...formData,
      customerId: customer.id,
      customerName: customer.name,
      previousBalance: customer.balance || 0,
      vehicles: customerVehicles,
      // Use customer-specific rate if available
      cylinderRate: customer.cylinderRate || formData.cylinderRate,
      gasRateKg: customer.gasRate || formData.gasRateKg,
    });

    // Clear customer error specifically if validation has been triggered
    if (validationTriggered) {
      setErrors((prev) => ({
        ...prev,
        customer: undefined,
      }));
    }

    // Notify user of successful selection
    toast.success(`Selected customer: ${customer.name}`, {
      duration: 2000,
      position: "bottom-right",
    });
  };

  const handleAddNewCustomer = async (newCustomerData) => {
    if (!newCustomerData.name.trim()) {
      toast.error("Customer name is required");
      return false;
    }

    try {
      const newCustomerInfo = {
        name: newCustomerData.name,
        address: newCustomerData.address,
        phone: newCustomerData.phone,
        email: newCustomerData.email,
        balance: 0,
        createdBy: getCurrentUser()?.uid || "unknown",
      };

      const customerId = await addDocument("customers", newCustomerInfo);

      setFormData({
        ...formData,
        customerId,
        customerName: newCustomerData.name,
      });

      // Add the new customer to the local customers array
      setCustomers((prev) => [...prev, { id: customerId, ...newCustomerInfo }]);

      setNewCustomerDialogOpen(false);

      // Use toast.success to show notification
      toast.success(
        `New customer "${newCustomerData.name}" added successfully`
      );

      logCustomEvent("customer_added", {
        customer_id: customerId,
        customer_name: newCustomerData.name,
      });

      return true;
    } catch (error) {
      console.error("Error adding new customer:", error);
      toast.error("Failed to add new customer");
      return false;
    }
  };

  const handleAddNewVehicle = async (newVehicleData) => {
    if (!newVehicleData.registration.trim()) {
      toast.error("Vehicle registration is required");
      return false;
    }

    try {
      const vehicleData = {
        registration: newVehicleData.registration,
        make: newVehicleData.make,
        model: newVehicleData.model,
        customerId: formData.customerId || null,
        gasRate: parseFloat(newVehicleData.gasRate) || 10,
        createdBy: getCurrentUser()?.uid || "unknown",
        createdAt: new Date(),
      };

      // Add to database
      const vehicleId = await addDocument("vehicles", vehicleData);

      // Update the form data with the new vehicle
      setFormData((prev) => ({
        ...prev,
        vehicleRego: newVehicleData.registration,
        // If it's a weight-based transaction, also update the gas rate
        ...(prev.transactionType === "weight"
          ? { gasRateKg: newVehicleData.gasRate }
          : {}),
        // Add the new vehicle to the vehicles array
        vehicles: [
          ...(prev.vehicles || []),
          {
            id: vehicleId,
            ...vehicleData,
          },
        ],
      }));

      // Refresh vehicles list
      const updatedVehicles = await getDocuments("vehicles");
      setVehicles(updatedVehicles);

      setNewVehicleDialogOpen(false);
      toast.success("New vehicle added successfully");
      return true;
    } catch (error) {
      console.error("Error adding new vehicle:", error);
      toast.error("Failed to add new vehicle");
      return false;
    }
  };

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    // Only clear errors if validation has been triggered previously
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

    if (
      formData.transactionType === "cylinder" &&
      (!formData.cylindersSold || parseFloat(formData.cylindersSold) <= 0)
    ) {
      validationErrors.cylindersSold = "Must sell at least one cylinder";
    }

    if (
      formData.transactionType === "weight" &&
      (!formData.gasSoldKg || parseFloat(formData.gasSoldKg) <= 0)
    ) {
      validationErrors.gasSoldKg = "Gas sold must be greater than 0";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading((prev) => ({ ...prev, saveTransaction: true }));

    try {
      const transactionData = {
        ...formData,
        date: formData.date.toISOString(),
        timestamp: new Date(),
        createdBy: getCurrentUser()?.uid || "unknown",
        // Ensure numeric fields are stored as numbers
        cylindersSold: formData.cylindersSold
          ? parseFloat(formData.cylindersSold)
          : 0,
        cylinderRate: formData.cylinderRate
          ? parseFloat(formData.cylinderRate)
          : 0,
        gasSoldKg: formData.gasSoldKg ? parseFloat(formData.gasSoldKg) : 0,
        gasRateKg: formData.gasRateKg ? parseFloat(formData.gasRateKg) : 0,
        cylindersReturned: formData.cylindersReturned
          ? parseFloat(formData.cylindersReturned)
          : 0,
        amountReceived: formData.amountReceived
          ? parseFloat(formData.amountReceived)
          : 0,
      };

      const transactionId = await addDocument("transactions", transactionData);

      if (formData.customerId) {
        await addDocument("customerBalanceUpdates", {
          customerId: formData.customerId,
          transactionId,
          previousBalance: formData.previousBalance,
          newBalance: formData.remainingBalance,
          timestamp: new Date(),
        });
      }

      logCustomEvent("transaction_completed", {
        transaction_id: transactionId,
        transaction_type: formData.transactionType,
        payment_type: formData.paymentType,
        total_amount: formData.totalAmount,
      });

      // Show a clear success notification
      toast.success(
        `Transaction successfully recorded for ${formData.customerName}`,
        {
          duration: 5000, // Display for 5 seconds
          position: "top-center",
        }
      );

      // Reset form but keep current rates that were entered
      const currentCylinderRate = formData.cylinderRate;
      const currentGasRate = formData.gasRateKg;

      setFormData({
        date: new Date(),
        customerId: "",
        customerName: "",
        transactionType: "cylinder",
        vehicleRego: "",
        cylindersSold: "",
        cylinderRate: currentCylinderRate, // Keep current cylinder rate
        gasSoldKg: "",
        gasRateKg: currentGasRate, // Keep current gas rate
        cylindersReturned: "",
        totalCylindersDue: 0,
        totalAmount: 0,
        amountReceived: "",
        previousBalance: 0,
        remainingBalance: 0,
        paymentType: "cash",
        vehicles: [], // Clear vehicles for the customer
      });

      // Reset validation state alongside form
      setValidationTriggered(false);
      setErrors({});
    } catch (error) {
      console.error("Error submitting transaction:", error);
      toast.error("Failed to record transaction. Please try again.", {
        duration: 5000,
        position: "top-center",
      });
    } finally {
      setLoading((prev) => ({ ...prev, saveTransaction: false }));
    }
  };

  return (
    <Card className="max-w-4xl mx-auto shadow">
      <CardHeader className="bg-muted/40">
        <CardTitle className="text-2xl font-bold text-center">
          New Gas Transaction
        </CardTitle>
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
            <span className="text-lg">Loading transaction data...</span>
          </div>
        </CardContent>
      ) : (
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Action Buttons at the top */}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewCustomerDialogOpen(true)}
                className="flex items-center"
              >
                <Plus className="mr-1 h-4 w-4" /> Add Customer
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewVehicleDialogOpen(true)}
                className="flex items-center"
              >
                <Plus className="mr-1 h-4 w-4" /> Add Vehicle
              </Button>
            </div>

            {/* Date and Customer Selection Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DateSelector
                value={formData.date}
                onChange={(date) => handleChange("date", date)}
              />

              <CustomerSelector
                customers={customers}
                selectedCustomer={formData.customerName}
                error={validationTriggered ? errors.customer : undefined}
                onSelectCustomer={handleSelectCustomer}
                onAddNewCustomer={() => setNewCustomerDialogOpen(true)}
              />
            </div>

            {/* Transaction Type Toggle */}
            <TransactionTypeToggle
              value={formData.transactionType}
              onChange={(value) => handleChange("transactionType", value)}
            />

            {/* Transaction Detail Fields */}
            {formData.transactionType === "cylinder" ? (
              <CylinderTransactionFields
                formData={formData}
                errors={validationTriggered ? errors : {}}
                onChange={handleChange}
                onAddNewVehicle={() => setNewVehicleDialogOpen(true)}
              />
            ) : (
              <WeightTransactionFields
                formData={formData}
                errors={validationTriggered ? errors : {}}
                onChange={handleChange}
                onAddNewVehicle={() => setNewVehicleDialogOpen(true)}
              />
            )}

            {/* Payment Details */}
            <PaymentDetails formData={formData} onChange={handleChange} />

            {/* Payment Type */}
            <PaymentTypeToggle
              value={formData.paymentType}
              onChange={(name, value) => handleChange(name, value)}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading.saveTransaction}
              size="lg"
            >
              {loading.saveTransaction ? (
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
                "Record Transaction"
              )}
            </Button>
          </form>
        </CardContent>
      )}

      {/* Dialogs */}
      <NewCustomerDialog
        open={newCustomerDialogOpen}
        onOpenChange={setNewCustomerDialogOpen}
        onAddCustomer={handleAddNewCustomer}
      />

      <NewVehicleDialog
        open={newVehicleDialogOpen}
        onOpenChange={setNewVehicleDialogOpen}
        customerId={formData.customerId}
        onAddVehicle={handleAddNewVehicle}
      />
    </Card>
  );
};

export default TransactionForm;