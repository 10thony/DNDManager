import React, { useState } from "react";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import "./LocationCreationModal.css";

interface LocationCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (locationId: Id<"locations">) => void;
}

interface LocationFormData {
  name: string;
  description: string;
  type: "City" | "Town" | "Village" | "Dungeon" | "Forest" | "Mountain" | "Desert" | "Swamp" | "Castle" | "Temple" | "Tavern" | "Shop" | "Other";
}

const LocationCreationModal: React.FC<LocationCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useUser();
  const createLocation = useMutation(api.locations.createLocation);
  
  const [formData, setFormData] = useState<LocationFormData>({
    name: "",
    description: "",
    type: "Other",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Location name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Location description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) {
      return;
    }

    setIsSubmitting(true);

    try {
      const locationData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        creatorId: user.id,
      };

      const locationId = await createLocation(locationData);
      onSuccess(locationId);
      handleClose();
    } catch (error) {
      console.error("Error creating location:", error);
      setErrors({ submit: "Failed to create location. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      type: "Other",
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="location-creation-modal">
        <div className="modal-header">
          <h2>Create New Location</h2>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-content">
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="name">Location Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? "error" : ""}
                placeholder="Enter location name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={errors.description ? "error" : ""}
                placeholder="Describe the location..."
                rows={4}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Location Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="City">City</option>
                  <option value="Town">Town</option>
                  <option value="Village">Village</option>
                  <option value="Dungeon">Dungeon</option>
                  <option value="Forest">Forest</option>
                  <option value="Mountain">Mountain</option>
                  <option value="Desert">Desert</option>
                  <option value="Swamp">Swamp</option>
                  <option value="Castle">Castle</option>
                  <option value="Temple">Temple</option>
                  <option value="Tavern">Tavern</option>
                  <option value="Shop">Shop</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="error-message global-error">{errors.submit}</div>
          )}
        </form>

        <div className="modal-footer">
          <button className="cancel-button" onClick={handleClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="confirm-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Location"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationCreationModal; 