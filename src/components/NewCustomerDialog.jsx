// NewCustomerDialog.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const NewCustomerDialog = ({ open, onOpenChange, onAddCustomer }) => {
  const [newCustomerData, setNewCustomerData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCustomer = async () => {
    if (!newCustomerData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    const success = await onAddCustomer(newCustomerData);

    if (success) {
      // Reset form if successful
      setNewCustomerData({
        name: "",
        address: "",
        phone: "",
        email: "",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Enter customer details below to create a new customer record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newCustomerName" className="required">
              Name
            </Label>
            <Input
              id="newCustomerName"
              value={newCustomerData.name}
              onChange={(e) =>
                setNewCustomerData({
                  ...newCustomerData,
                  name: e.target.value,
                })
              }
              placeholder="Enter customer name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newCustomerAddress">Address</Label>
            <Input
              id="newCustomerAddress"
              value={newCustomerData.address}
              onChange={(e) =>
                setNewCustomerData({
                  ...newCustomerData,
                  address: e.target.value,
                })
              }
              placeholder="Enter address"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newCustomerPhone">Phone</Label>
              <Input
                id="newCustomerPhone"
                value={newCustomerData.phone}
                onChange={(e) =>
                  setNewCustomerData({
                    ...newCustomerData,
                    phone: e.target.value,
                  })
                }
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newCustomerEmail">Email</Label>
              <Input
                id="newCustomerEmail"
                type="email"
                value={newCustomerData.email}
                onChange={(e) =>
                  setNewCustomerData({
                    ...newCustomerData,
                    email: e.target.value,
                  })
                }
                placeholder="Enter email address"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="sm:order-1 order-2"
          >
            Cancel
          </Button>

          <Button
            onClick={handleAddCustomer}
            disabled={isSubmitting || !newCustomerData.name.trim()}
            className="sm:order-2 order-1"
          >
            {isSubmitting ? "Adding..." : "Add Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewCustomerDialog;
