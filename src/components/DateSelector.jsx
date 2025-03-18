// DateSelector.jsx
import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const DateSelector = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value || new Date());
  const [localValue, setLocalValue] = useState(value);

  // Generate month name
  const monthName = format(viewDate, "MMMM yyyy");

  // Generate days for the current month
  const generateDaysForMonth = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startDayIndex = firstDay.getDay(); // 0-6, where 0 is Sunday

    // Create array for days
    const days = [];

    // Add empty slots for days before the first of the month
    for (let i = 0; i < startDayIndex; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = generateDaysForMonth();

  // Get day names (Sun, Mon, etc.)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Navigate to previous/next month
  const goToPreviousMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // Helper to check if a date is the same as the selected date
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Handle date selection
  const handleSelectDate = (date) => {
    if (!date) return;
    setLocalValue(date);
    onChange(date);
    setOpen(false);
  };

  return (
    <div className="space-y-1">
      <Label htmlFor="date" className="text-sm">
        Transaction Date
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal h-9"
            id="date"
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            {localValue ? format(localValue, "PPP") : "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-3">
            {/* Calendar header with navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousMonth}
                className="h-7 w-7 p-0"
              >
                &lt;
              </Button>
              <div className="font-medium">{monthName}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextMonth}
                className="h-7 w-7 p-0"
              >
                &gt;
              </Button>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {dayNames.map((day) => (
                <div key={day} className="text-xs text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <div key={index}>
                  {day ? (
                    <Button
                      variant={isSameDay(day, localValue) ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleSelectDate(day)}
                      className={`h-7 w-7 p-0 ${
                        isSameDay(day, localValue)
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                    >
                      {day.getDate()}
                    </Button>
                  ) : (
                    <div className="h-7 w-7"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Today button */}
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  setViewDate(today);
                  handleSelectDate(today);
                }}
              >
                Today
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateSelector;
