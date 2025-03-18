// CylinderTransactionFields.jsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const CylinderTransactionFields = ({ formData, errors, onChange }) => {
  return (
    <Card className="bg-card/30">
      <CardContent className="pt-3 pb-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="cylindersSold" className="text-sm">
              Cylinders Sold
            </Label>
            <Input
              id="cylindersSold"
              type="text"
              inputMode="numeric"
              placeholder="Enter amount"
              aria-invalid={errors.cylindersSold ? "true" : "false"}
              value={formData.cylindersSold}
              onChange={(e) => onChange("cylindersSold", e.target.value)}
              className={`h-8 ${
                errors.cylindersSold ? "border-destructive" : undefined
              }`}
            />
            {errors.cylindersSold && (
              <p className="text-xs text-destructive">{errors.cylindersSold}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="cylinderRate" className="text-sm">
              Cylinder Rate ($)
            </Label>
            <Input
              id="cylinderRate"
              type="text"
              inputMode="numeric"
              placeholder="Enter rate"
              value={formData.cylinderRate}
              onChange={(e) => onChange("cylinderRate", e.target.value)}
              className="h-8"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="cylindersReturned" className="text-sm">
              Cylinders Returned
            </Label>
            <Input
              id="cylindersReturned"
              type="text"
              inputMode="numeric"
              placeholder="Enter amount"
              value={formData.cylindersReturned}
              onChange={(e) => onChange("cylindersReturned", e.target.value)}
              className="h-8"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="totalCylindersDue" className="text-sm">
              Total Cylinders Due
            </Label>
            <Input
              id="totalCylindersDue"
              value={
                !isNaN(formData.totalCylindersDue) &&
                formData.totalCylindersDue >= 0
                  ? Math.round(formData.totalCylindersDue)
                  : 0
              }
              className="bg-muted h-8"
              readOnly
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CylinderTransactionFields;
