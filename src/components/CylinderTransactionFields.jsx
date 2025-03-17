// CylinderTransactionFields.jsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const CylinderTransactionFields = ({ formData, errors, onChange }) => {
  return (
    <Card className="bg-card/30">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cylindersSold">Cylinders Sold</Label>
            <Input
              id="cylindersSold"
              type="text"
              inputMode="numeric"
              placeholder="Enter amount"
              aria-invalid={errors.cylindersSold ? "true" : "false"}
              value={formData.cylindersSold}
              onChange={(e) => onChange("cylindersSold", e.target.value)}
              className={
                errors.cylindersSold ? "border-destructive" : undefined
              }
            />
            {errors.cylindersSold && (
              <p className="text-sm text-destructive">{errors.cylindersSold}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cylinderRate">Cylinder Rate ($)</Label>
            <Input
              id="cylinderRate"
              type="text"
              inputMode="numeric"
              placeholder="Enter rate"
              value={formData.cylinderRate}
              onChange={(e) => onChange("cylinderRate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cylindersReturned">Cylinders Returned</Label>
            <Input
              id="cylindersReturned"
              type="text"
              inputMode="numeric"
              placeholder="Enter amount"
              value={formData.cylindersReturned}
              onChange={(e) => onChange("cylindersReturned", e.target.value)}
            />
          </div>

          <div className="space-y-2 col-span-full md:col-span-1">
            <Label htmlFor="totalCylindersDue">Total Cylinders Due</Label>
            <Input
              id="totalCylindersDue"
              value={
                !isNaN(formData.totalCylindersDue) &&
                formData.totalCylindersDue >= 0
                  ? Math.round(formData.totalCylindersDue)
                  : 0
              }
              className="bg-muted"
              readOnly
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CylinderTransactionFields;
