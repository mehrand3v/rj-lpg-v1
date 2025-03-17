// TransactionTypeToggle.jsx
import React from "react";
import { Package, Scale, Check } from "lucide-react";
import { Label } from "@/components/ui/label";

const TransactionTypeToggle = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label>Transaction Type</Label>

      <div className="grid grid-cols-2 gap-4">
        <div
          className={`flex items-center p-4 rounded-md border-2 cursor-pointer transition-all ${
            value === "cylinder"
              ? "border-primary bg-primary/10 shadow"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => onChange("cylinder")}
        >
          <div className="flex-1 flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center hidden sm:flex ${
                value === "cylinder"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Package className="h-5 w-5" />
            </div>
            <div className="ml-4">
              <div className="font-medium">Cylinder Sale</div>
              <div className="text-sm text-muted-foreground hidden sm:block">
                Fixed price per cylinder
              </div>
            </div>
          </div>

          {value === "cylinder" && (
            <div className="flex justify-end">
              <Check className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>

        <div
          className={`flex items-center p-4 rounded-md border-2 cursor-pointer transition-all ${
            value === "weight"
              ? "border-primary bg-primary/10 shadow"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => onChange("weight")}
        >
          <div className="flex-1 flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center hidden sm:flex ${
                value === "weight"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Scale className="h-5 w-5" />
            </div>
            <div className="ml-4">
              <div className="font-medium">Weight-Based</div>
              <div className="text-sm text-muted-foreground hidden sm:block">
                Price per kg
              </div>
            </div>
          </div>

          {value === "weight" && (
            <div className="flex justify-end">
              <Check className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionTypeToggle;
