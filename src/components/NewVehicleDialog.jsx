// NewVehicleDialog.jsx
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

const NewVehicleDialog = ({ open, onOpenChange, customerId, onAddVehicle }) => {
  const [newVehicleData, setNewVehicleData] = useState({
    registration: "",
    make: "",
    model: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddVehicle = async () => {
    if (!newVehicleData.registration.trim()) {
      return;
    }

    setIsSubmitting(true);
    const success = await onAddVehicle(newVehicleData);

    if (success) {
      // Reset form if successful
      setNewVehicleData({
        registration: "",
        make: "",
        model: "",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>
            Enter vehicle details below to associate with the current customer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newVehicleRego" className="required">
              Registration
            </Label>
            <Input
              id="newVehicleRego"
              value={newVehicleData.registration}
              onChange={(e) =>
                setNewVehicleData({
                  ...newVehicleData,
                  registration: e.target.value,
                })
              }
              placeholder="Enter vehicle registration"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newVehicleMake">Make</Label>
              <Input
                id="newVehicleMake"
                value={newVehicleData.make}
                onChange={(e) =>
                  setNewVehicleData({
                    ...newVehicleData,
                    make: e.target.value,
                  })
                }
                placeholder="Enter vehicle make"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newVehicleModel">Model</Label>
              <Input
                id="newVehicleModel"
                value={newVehicleData.model}
                onChange={(e) =>
                  setNewVehicleData({
                    ...newVehicleData,
                    model: e.target.value,
                  })
                }
                placeholder="Enter vehicle model"
              />
            </div>
          </div>

          {!customerId && (
            <div className="py-2 px-3 bg-muted rounded-md text-muted-foreground text-sm">
              Note: This vehicle will not be associated with a customer until
              you select one.
            </div>
          )}
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
            onClick={handleAddVehicle}
            disabled={isSubmitting || !newVehicleData.registration.trim()}
            className="sm:order-2 order-1"
          >
            {isSubmitting ? "Adding..." : "Add Vehicle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewVehicleDialog;
