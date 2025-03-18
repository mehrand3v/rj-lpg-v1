// TransactionForm.jsx
import { useState, useEffect } from "react";
import { addDocument, getDocuments } from "@/services/db";
import { logCustomEvent } from "@/services/analytics";
import { getCurrentUser } from "@/services/auth";
// Import the useToast hook instead of react-hot-toast
import { useToast } from "@/components/ui/toast";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom animated tabs component with framer-motion
const AnimatedTabsContent = ({ value, activeTab, children }) => (
  <AnimatePresence mode="wait">
    {value === activeTab && (
      <motion.div
        key={value}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="space-y-3"
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

const TransactionForm = () => {
  // Initialize the toast hook
  const { success, error } = useToast();

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

  const [activeTab, setActiveTab] = useState("details");
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [newCustomerDialogOpen, setNewCustomerDialogOpen] = useState(false);
  const [newVehicleDialogOpen, setNewVehicleDialogOpen] = useState(false);
  const [loading, setLoading] = useState({
    saveTransaction: false,
    fetchingData: true,
  });
  const isSubmitting = loading.saveTransaction;
  const [errors, setErrors] = useState({});
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
        // Updated toast.error to error
        error("Failed to load necessary data");
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

    // Updated toast.success to success
    success(`Selected customer: ${customer.name}`, {
      duration: 2000,
      position: "bottom-right",
    });
  };

  const handleAddNewCustomer = async (newCustomerData) => {
    if (!newCustomerData.name.trim()) {
      // Updated toast.error to error
      error("Customer name is required");
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

      // Updated toast.success to success
      success(`New customer "${newCustomerData.name}" added successfully`);

      logCustomEvent("customer_added", {
        customer_id: customerId,
        customer_name: newCustomerData.name,
      });

      return true;
    } catch (error) {
      console.error("Error adding new customer:", error);
      // Updated toast.error to error
      error("Failed to add new customer");
      return false;
    }
  };

  const handleAddNewVehicle = async (newVehicleData) => {
    if (!newVehicleData.registration.trim()) {
      // Updated toast.error to error
      error("Vehicle registration is required");
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
      // Updated toast.success to success
      success("New vehicle added successfully");
      return true;
    } catch (error) {
      console.error("Error adding new vehicle:", error);
      // Updated toast.error to error
      error("Failed to add new vehicle");
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
      validationErrors.customer = "Customer is required";
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

      // Updated toast.success to success
      success(
        `Transaction successfully recorded for ${formData.customerName}`,
        {
          duration: 5000,
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
      // Updated toast.error to error
      error("Failed to record transaction. Please try again.", {
        duration: 5000,
        position: "top-center",
      });
    } finally {
      setLoading((prev) => ({ ...prev, saveTransaction: false }));
    }
  };

  // Animation variants for various components
  const pageTransition = {
    type: "spring",
    damping: 25,
    stiffness: 120,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-4xl mx-auto shadow">
        <CardHeader className="bg-muted/40 pb-2">
          <motion.div
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={pageTransition}
          >
            <CardTitle className="text-xl font-bold">
              New Gas Transaction
            </CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 sm:flex-auto"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewCustomerDialogOpen(true)}
                  className="flex items-center w-full sm:w-auto justify-center sm:justify-start"
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Customer
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 sm:flex-auto"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewVehicleDialogOpen(true)}
                  className="flex items-center w-full sm:w-auto justify-center sm:justify-start"
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Vehicle
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </CardHeader>

        {loading.fetchingData ? (
          <CardContent className="flex items-center justify-center py-6">
            <motion.div
              className="flex items-center space-x-2"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <svg
                className="animate-spin h-5 w-5 text-primary"
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
              <span>Loading transaction data...</span>
            </motion.div>
          </CardContent>
        ) : (
          <CardContent className="pt-3">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Top Row - Date and Customer */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, ...pageTransition }}
              >
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
              </motion.div>

              {/* Tabbed Interface with Animations */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, ...pageTransition }}
              >
                <Tabs
                  defaultValue="details"
                  className="w-full"
                  onValueChange={setActiveTab}
                  value={activeTab}
                >
                  <TabsList className="grid grid-cols-2 mb-2 p-1 bg-muted/40 rounded-lg">
                    <motion.div whileTap={{ scale: 0.98 }} className="w-full">
                      <TabsTrigger
                        value="details"
                        className={`relative w-full ${
                          activeTab === "details"
                            ? "bg-white dark:bg-gray-800 shadow-sm"
                            : "hover:bg-muted/80"
                        } rounded-md text-sm font-medium`}
                      >
                        Transaction Details
                      </TabsTrigger>
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.98 }} className="w-full">
                      <TabsTrigger
                        value="payment"
                        className={`relative w-full ${
                          activeTab === "payment"
                            ? "bg-white dark:bg-gray-800 shadow-sm"
                            : "hover:bg-muted/80"
                        } rounded-md text-sm font-medium`}
                      >
                        Payment Information
                      </TabsTrigger>
                    </motion.div>
                  </TabsList>

                  <AnimatedTabsContent value="details" activeTab={activeTab}>
                    {/* Transaction Type Toggle */}
                    <TransactionTypeToggle
                      value={formData.transactionType}
                      onChange={(value) =>
                        handleChange("transactionType", value)
                      }
                    />

                    {/* Transaction Detail Fields with Animation */}
                    <AnimatePresence mode="wait">
                      {formData.transactionType === "cylinder" ? (
                        <motion.div
                          key="cylinder"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CylinderTransactionFields
                            formData={formData}
                            errors={validationTriggered ? errors : {}}
                            onChange={handleChange}
                            onAddNewVehicle={() =>
                              setNewVehicleDialogOpen(true)
                            }
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="weight"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <WeightTransactionFields
                            formData={formData}
                            errors={validationTriggered ? errors : {}}
                            onChange={handleChange}
                            onAddNewVehicle={() =>
                              setNewVehicleDialogOpen(true)
                            }
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </AnimatedTabsContent>

                  <AnimatedTabsContent value="payment" activeTab={activeTab}>
                    {/* Payment Details */}
                    <PaymentDetails
                      formData={formData}
                      onChange={handleChange}
                    />

                    {/* Payment Type */}
                    <PaymentTypeToggle
                      value={formData.paymentType}
                      onChange={(name, value) => handleChange(name, value)}
                    />
                  </AnimatedTabsContent>
                </Tabs>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, ...pageTransition }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
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
              </motion.div>
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
    </motion.div>
  );
};

export default TransactionForm;
