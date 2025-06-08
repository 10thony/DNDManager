import React from "react";
import LocationForm from "../components/LocationForm";
import LocationList from "../components/LocationList";

export default function LocationsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Locations</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <LocationForm />
        </div>
        <div>
          <LocationList />
        </div>
      </div>
    </div>
  );
} 