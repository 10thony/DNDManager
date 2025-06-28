import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { LocationType, locationTypes } from "../../convex/locations";
import { Id } from "../../convex/_generated/dataModel";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { MapPreview } from "./maps/MapPreview";
import "./LocationForm.css";

interface LocationFormProps {
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

export default function LocationForm({ onSubmitSuccess, onCancel }: LocationFormProps) {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
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

  const selectedMap = formData.mapId ? maps.find(m => m._id === formData.mapId) : null;

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

  const handleCancel = () => {
    if (returnTo === 'campaign-form') {
      navigate("/campaigns/new");
    } else if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="location-form">
      <h2 className="location-form-title">Create New Location</h2>
      
      <div className="form-section">
        <h3 className="form-section-title">Basic Information</h3>
        
        <div className="form-group">
          <label className="form-label">Campaign</label>
          <select
            value={formData.campaignId}
            onChange={(e) => setFormData({ ...formData, campaignId: e.target.value as Id<"campaigns"> })}
            className="form-select"
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

        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as LocationType })}
            className="form-select"
            required
          >
            {locationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="form-textarea"
            rows={4}
            required
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Additional Details</h3>
        
        <div className="form-group">
          <label className="form-label">Notable NPCs</label>
          <select
            multiple
            value={formData.notableNpcIds}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value as Id<"npcs">);
              setFormData({ ...formData, notableNpcIds: selected });
            }}
            className="form-select"
          >
            {npcs.map((npc) => (
              <option key={npc._id} value={npc._id}>
                {npc.name}
              </option>
            ))}
          </select>
          <div className="form-helper">Hold Ctrl/Cmd to select multiple NPCs</div>
        </div>

        <div className="form-group">
          <label className="form-label">Secrets</label>
          <textarea
            value={formData.secrets}
            onChange={(e) => setFormData({ ...formData, secrets: e.target.value })}
            className="form-textarea"
            rows={3}
            placeholder="Any hidden information or secrets about this location..."
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Map Association</h3>
        
        <div className="form-group">
          <label className="form-label">Map</label>
          <div className="map-selection-group">
            <select
              value={formData.mapId || ""}
              onChange={(e) => setFormData({ ...formData, mapId: e.target.value ? (e.target.value as Id<"maps">) : undefined })}
              className="form-select map-select"
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
              className="create-map-btn"
            >
              Create New Map
            </Link>
          </div>
        </div>

        {selectedMap && (
          <div className="map-preview-section">
            <h4 className="form-subsection-title">Selected Map Preview</h4>
            <div className="map-preview-container">
              <div className="flex justify-center items-center p-4">
                <MapPreview map={selectedMap} cellSize={15} />
              </div>
              <div className="map-info">
                <p><strong>{selectedMap.name}</strong></p>
                <p>Dimensions: {selectedMap.width} × {selectedMap.height}</p>
                <p>Last Updated: {new Date(selectedMap.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn-primary"
        >
          Create Location
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary"
          >
            {returnTo === 'campaign-form' ? "Back to Campaign Form" : "Cancel"}
          </button>
        )}
      </div>
    </form>
  );
} 