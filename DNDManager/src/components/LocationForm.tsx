import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LocationType, locationTypes } from "../../convex/locations";
import { Id } from "../../convex/_generated/dataModel";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

interface LocationFormProps {
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

export default function LocationForm({ onSubmitSuccess, onCancel }: LocationFormProps) {
  const { userId } = useAuth();
  const createLocation = useMutation(api.locations.create);
  const campaigns = useQuery(api.locations.getCampaigns) || [];
  const npcs = useQuery(api.locations.getNPCs) || [];
  const maps = useQuery(api.maps.getUserMaps, { userId: userId || "" }) || [];

  const [formData, setFormData] = useState({
    campaignId: "" as Id<"campaigns">,
    name: "",
    type: locationTypes[0] as LocationType,
    description: "",
    notableNpcIds: [] as Id<"npcs">[],
    linkedLocations: [] as Id<"locations">[],
    interactionsAtLocation: [] as Id<"interactions">[],
    imageUrls: [] as string[],
    secrets: "",
    mapId: undefined as Id<"maps"> | undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      console.error("No user ID available");
      return;
    }
    try {
      await createLocation({
        ...formData,
        creatorId: userId,
      });
      // Reset form
      setFormData({
        campaignId: "" as Id<"campaigns">,
        name: "",
        type: locationTypes[0] as LocationType,
        description: "",
        notableNpcIds: [] as Id<"npcs">[],
        linkedLocations: [] as Id<"locations">[],
        interactionsAtLocation: [] as Id<"interactions">[],
        imageUrls: [] as string[],
        secrets: "",
        mapId: undefined,
      });
      onSubmitSuccess?.();
    } catch (error) {
      console.error("Error creating location:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create New Location</h2>
      
      <div>
        <label className="block mb-1">Campaign</label>
        <select
          value={formData.campaignId}
          onChange={(e) => setFormData({ ...formData, campaignId: e.target.value as Id<"campaigns"> })}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select a campaign</option>
          {campaigns.map((campaign) => (
            <option key={campaign._id} value={campaign._id}>
              {campaign.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1">Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as LocationType })}
          className="w-full p-2 border rounded"
          required
        >
          {locationTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-2 border rounded"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block mb-1">Notable NPCs</label>
        <select
          multiple
          value={formData.notableNpcIds}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => option.value as Id<"npcs">);
            setFormData({ ...formData, notableNpcIds: selected });
          }}
          className="w-full p-2 border rounded"
        >
          {npcs.map((npc) => (
            <option key={npc._id} value={npc._id}>
              {npc.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1">Secrets</label>
        <textarea
          value={formData.secrets}
          onChange={(e) => setFormData({ ...formData, secrets: e.target.value })}
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>

      <div>
        <label className="block mb-1">Map</label>
        <div className="flex gap-2 items-center">
          <select
            value={formData.mapId || ""}
            onChange={(e) => setFormData({ ...formData, mapId: e.target.value ? (e.target.value as Id<"maps">) : undefined })}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a map (optional)</option>
            {maps.map((map) => (
              <option key={map._id} value={map._id}>
                {map.name}
              </option>
            ))}
          </select>
          <Link
            to="/maps/new"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 whitespace-nowrap"
          >
            Create New Map
          </Link>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Location
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
} 