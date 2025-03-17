// PaymentTypeToggle.jsx
import React from "react";
import { DollarSign, CreditCard, Check } from "lucide-react";
import { Label } from "@/components/ui/label";

const PaymentTypeToggle = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label>Payment Type</Label>

      <div className="grid grid-cols-2 gap-4">
        <div
          className={`flex items-center p-4 rounded-md border-2 cursor-pointer transition-all ${
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
              className={`w-10 h-10 rounded-full flex items-center justify-center hidden sm:flex ${
                value === "cash"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="ml-4">
              <div className="font-medium">Cash</div>
              <div className="text-sm text-muted-foreground hidden sm:block">
                Immediate payment
              </div>
            </div>
          </div>

          {value === "cash" && (
            <div className="flex justify-end">
              <Check className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>

        <div
          className={`flex items-center p-4 rounded-md border-2 cursor-pointer transition-all ${
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
              className={`w-10 h-10 rounded-full flex items-center justify-center hidden sm:flex ${
                value === "credit"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="ml-4">
              <div className="font-medium">Credit</div>
              <div className="text-sm text-muted-foreground hidden sm:block">
                Add to customer balance
              </div>
            </div>
          </div>

          {value === "credit" && (
            <div className="flex justify-end">
              <Check className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentTypeToggle;
