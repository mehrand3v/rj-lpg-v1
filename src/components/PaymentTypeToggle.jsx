// PaymentTypeToggle.jsx
import React from "react";
import { DollarSign, CreditCard, Check } from "lucide-react";
import { Label } from "@/components/ui/label";

const PaymentTypeToggle = ({ value, onChange }) => {
  return (
    <div className="space-y-1">
      <Label className="text-sm">Payment Type</Label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          className={`flex items-center p-2 rounded-md border-2 cursor-pointer transition-all ${
            value === "cash"
              ? "border-primary bg-primary/10 shadow"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => onChange("paymentType", "cash")}
          aria-selected={value === "cash"}
          role="option"
        >
          <div className="flex-1 flex items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                value === "cash"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <DollarSign className="h-3 w-3" />
            </div>
            <div className="ml-2">
              <div className="font-medium text-sm">Cash</div>
            </div>
          </div>

          {value === "cash" && (
            <div className="flex justify-end">
              <Check className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>

        <div
          className={`flex items-center p-2 rounded-md border-2 cursor-pointer transition-all ${
            value === "credit"
              ? "border-primary bg-primary/10 shadow"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => onChange("paymentType", "credit")}
          aria-selected={value === "credit"}
          role="option"
        >
          <div className="flex-1 flex items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                value === "credit"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <CreditCard className="h-3 w-3" />
            </div>
            <div className="ml-2">
              <div className="font-medium text-sm">Credit</div>
            </div>
          </div>

          {value === "credit" && (
            <div className="flex justify-end">
              <Check className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentTypeToggle;
