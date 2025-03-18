// PaymentDetails.jsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const PaymentDetails = ({ formData, onChange }) => {
  const remainingBalance = formData.remainingBalance || 0;
  const getRemainingBalanceClasses = () => {
    if (remainingBalance > 0) {
      return "bg-amber-50 dark:bg-amber-950/30 dark:text-amber-200";
    }
    if (remainingBalance < 0) {
      return "bg-green-50 dark:bg-green-950/30 dark:text-green-200";
    }
    return "bg-muted";
  };

  return (
    <Card className="bg-card/30">
      <CardContent className="pt-3 pb-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="totalAmount" className="text-sm">
              Total Amount ($)
            </Label>
            <Input
              id="totalAmount"
              value={
                !isNaN(formData.totalAmount)
                  ? formData.totalAmount.toFixed(2)
                  : "0.00"
              }
              className="bg-muted h-8"
              readOnly
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="previousBalance" className="text-sm">
              Previous Balance ($)
            </Label>
            <Input
              id="previousBalance"
              value={
                !isNaN(formData.previousBalance)
                  ? formData.previousBalance.toFixed(2)
                  : "0.00"
              }
              className="bg-muted h-8"
              readOnly
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="amountReceived" className="text-sm">
              Amount Received ($)
            </Label>
            <Input
              id="amountReceived"
              type="text"
              inputMode="numeric"
              placeholder="Enter amount"
              value={formData.amountReceived}
              onChange={(e) => onChange("amountReceived", e.target.value)}
              className="h-8"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="remainingBalance" className="text-sm">
              {remainingBalance > 0 ? "Remaining Balance" : "Credit Balance"}{" "}
              ($)
            </Label>
            <Input
              id="remainingBalance"
              value={
                !isNaN(formData.remainingBalance)
                  ? Math.abs(formData.remainingBalance).toFixed(2)
                  : "0.00"
              }
              className={`h-8 ${getRemainingBalanceClasses()}`}
              readOnly
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentDetails;
