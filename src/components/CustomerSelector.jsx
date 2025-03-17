import React, { useState, useEffect } from "react";

import { User, Search, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const CustomerSelector = ({
  customers,
  selectedCustomer,
  error,
  onSelectCustomer,
  onAddNewCustomer,
}) => {
  const [customerSearch, setCustomerSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );
  useEffect(() => {
    // When a customer is selected, log it to confirm the component knows about it
    if (selectedCustomer) {
      console.log("CustomerSelector has selected customer:", selectedCustomer);
    }
  }, [selectedCustomer]); // CustomerSelector.jsx
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const handleSelectCustomer = (customer) => {
    onSelectCustomer(customer);
    setIsModalOpen(false);
    toast.success(`Selected customer: ${customer.name}`, {
      duration: 2000,
      position: "bottom-right",
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <Label>Customer</Label>
      </div>

      <div className="flex">
        <Button
          variant="outline"
          className="w-full justify-between"
          aria-invalid={error ? "true" : "false"}
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span className={!selectedCustomer ? "text-muted-foreground" : ""}>
              {selectedCustomer || "Select a customer"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </div>

      {error && <p className="text-sm text-destructive mt-1">{error}</p>}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
            <DialogDescription>
              Choose a customer from the list or search by name
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="pb-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search customers..."
                  className="pl-8"
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                />
              </div>
            </div>

            <div className="space-y-1 h-64 overflow-y-auto border rounded-md p-1">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <Button
                    key={customer.id}
                    variant="ghost"
                    className="w-full justify-start font-normal h-auto py-2"
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <div className="flex flex-col items-start">
                      <div>{customer.name}</div>
                      {customer.balance > 0 && (
                        <Badge
                          variant="outline"
                          className="mt-1 bg-accent text-accent-foreground"
                        >
                          Outstanding: ${Math.round(customer.balance)}
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))
              ) : (
                <div className="px-4 py-3 text-center text-muted-foreground">
                  No matching customers
                </div>
              )}
            </div>

            {/* Remove pagination controls - per request */}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerSelector;
