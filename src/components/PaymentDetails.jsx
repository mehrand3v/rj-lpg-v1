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
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Amount ($)</Label>
            <Input
              id="totalAmount"
              value={
                !isNaN(formData.totalAmount)
                  ? formData.totalAmount.toFixed(2)
                  : "0.00"
              }
              className="bg-muted"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="previousBalance">Previous Balance ($)</Label>
            <Input
              id="previousBalance"
              value={
                !isNaN(formData.previousBalance)
                  ? formData.previousBalance.toFixed(2)
                  : "0.00"
              }
              className="bg-muted"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amountReceived">Amount Received ($)</Label>
            <Input
              id="amountReceived"
              type="text"
              inputMode="numeric"
              placeholder="Enter amount"
              value={formData.amountReceived}
              onChange={(e) => onChange("amountReceived", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remainingBalance">
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
              className={getRemainingBalanceClasses()}
              readOnly
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentDetails;
