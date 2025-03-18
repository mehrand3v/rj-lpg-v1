// TransactionTypeToggle.jsx
import React from "react";
import { Package, Scale, Check } from "lucide-react";
import { Label } from "@/components/ui/label";

const TransactionTypeToggle = ({ value, onChange }) => {
  return (
    <div className="space-y-1">
      <Label className="text-sm">Transaction Type</Label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          className={`flex items-center p-2 rounded-md border-2 cursor-pointer transition-all ${
            value === "cylinder"
              ? "border-primary bg-primary/10 shadow"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => onChange("cylinder")}
        >
          <div className="flex-1 flex items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                value === "cylinder"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Package className="h-3 w-3" />
            </div>
            <div className="ml-2">
              <div className="font-medium text-sm">Cylinder Sale</div>
            </div>
          </div>

          {value === "cylinder" && (
            <div className="flex justify-end">
              <Check className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>

        <div
          className={`flex items-center p-2 rounded-md border-2 cursor-pointer transition-all ${
            value === "weight"
              ? "border-primary bg-primary/10 shadow"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => onChange("weight")}
        >
          <div className="flex-1 flex items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                value === "weight"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Scale className="h-3 w-3" />
            </div>
            <div className="ml-2">
              <div className="font-medium text-sm">Weight-Based</div>
            </div>
          </div>

          {value === "weight" && (
            <div className="flex justify-end">
              <Check className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionTypeToggle;
