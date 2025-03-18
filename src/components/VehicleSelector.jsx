// VehicleSelector.jsx
import React, { useState } from "react";
import { Truck, Search, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const VehicleSelector = ({
  vehicles = [],
  selectedVehicle,
  onChange,
  onAddNewVehicle,
}) => {
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.registration
        ?.toLowerCase()
        .includes(vehicleSearch.toLowerCase()) ||
      vehicle.make?.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  const handleSelectVehicle = (registration) => {
    onChange(registration);
    setIsModalOpen(false);
  };

  return (
    <div>
      <Button
        variant="outline"
        className="w-full justify-between h-8 text-sm font-normal"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center">
          <Truck className="mr-2 h-3 w-3" />
          <span className={!selectedVehicle ? "text-muted-foreground" : ""}>
            {selectedVehicle || "Select vehicle"}
          </span>
        </div>
        <ChevronDown className="h-3 w-3 opacity-50" />
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Vehicle</DialogTitle>
            <DialogDescription>
              Choose a vehicle from the list
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <div className="pb-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search vehicles..."
                  className="pl-8"
                  value={vehicleSearch}
                  onChange={(e) => {
                    setVehicleSearch(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                />
              </div>
            </div>

            <div className="space-y-1 max-h-[30vh] overflow-y-auto border rounded-md p-1">
              {paginatedVehicles.length > 0 ? (
                paginatedVehicles.map((vehicle, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start font-normal h-8 text-sm"
                    onClick={() => handleSelectVehicle(vehicle.registration)}
                  >
                    <div className="flex flex-col items-start">
                      <div>{vehicle.registration}</div>
                      {(vehicle.make || vehicle.model) && (
                        <div className="text-xs text-muted-foreground">
                          {[vehicle.make, vehicle.model]
                            .filter(Boolean)
                            .join(" ")}
                        </div>
                      )}
                    </div>
                  </Button>
                ))
              ) : (
                <div className="px-4 py-2 text-center text-muted-foreground text-sm">
                  {vehicles.length > 0
                    ? "No matching vehicles"
                    : "No vehicles available"}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="h-7 text-xs"
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="h-7 text-xs"
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VehicleSelector;
