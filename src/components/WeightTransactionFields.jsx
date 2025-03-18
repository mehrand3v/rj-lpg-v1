// WeightTransactionFields.jsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import VehicleSelector from "./VehicleSelector";

const WeightTransactionFields = ({
  formData,
  errors,
  onChange,
  onAddNewVehicle,
}) => {
  // Ensure vehicles is an array even if it's not provided
  const vehicles = formData.vehicles || [];

  return (
    <Card className="bg-card/30">
      <CardContent className="pt-3 pb-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="vehicleRego" className="text-sm">
              Vehicle Registration
            </Label>
            <VehicleSelector
              vehicles={vehicles}
              selectedVehicle={formData.vehicleRego}
              onChange={(value) => onChange("vehicleRego", value)}
              onAddNewVehicle={onAddNewVehicle}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="gasRateKg" className="text-sm">
              Gas Rate ($/kg)
            </Label>
            <Input
              id="gasRateKg"
              type="text"
              inputMode="numeric"
              placeholder="Enter rate"
              value={formData.gasRateKg}
              onChange={(e) => onChange("gasRateKg", e.target.value)}
              className="h-8"
            />
          </div>

          <div className="space-y-1 col-span-1 sm:col-span-3">
            <Label htmlFor="gasSoldKg" className="text-sm">
              Gas Sold (kg)
            </Label>
            <Input
              id="gasSoldKg"
              type="text"
              inputMode="numeric"
              placeholder="Enter amount"
              aria-invalid={errors.gasSoldKg ? "true" : "false"}
              value={formData.gasSoldKg}
              onChange={(e) => onChange("gasSoldKg", e.target.value)}
              className={`h-8 ${
                errors.gasSoldKg ? "border-destructive" : undefined
              }`}
            />
            {errors.gasSoldKg && (
              <p className="text-xs text-destructive">{errors.gasSoldKg}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeightTransactionFields;
