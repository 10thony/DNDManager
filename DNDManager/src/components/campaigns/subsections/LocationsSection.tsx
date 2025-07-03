import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import EntitySelectionModal from "../../modals/EntitySelectionModal";
import LocationCreationModal from "../../modals/LocationCreationModal";
import "./LocationsSection.css";

interface LocationsSectionProps {
  campaignId: Id<"campaigns">;
  locationIds?: Id<"locations">[];
  onUpdate: () => void;
}

type ModalType = "entitySelection" | "locationCreation" | null;

const LocationsSection: React.FC<LocationsSectionProps> = ({
  campaignId,
  locationIds = [],
  onUpdate,
}) => {
  const { user } = useUser();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const locations = useQuery(api.locations.list);
  const updateCampaign = useMutation(api.campaigns.updateCampaign);

  const campaignLocations = locations?.filter(location => 
    locationIds.includes(location._id)
  ) || [];

  const openEntitySelection = () => {
    setActiveModal("entitySelection");
  };

  const openLocationCreation = () => {
    setActiveModal("locationCreation");
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleEntitySelect = async (entityId: Id<any>) => {
    if (!user?.id) {
      alert("You must be logged in to perform this action.");
      return;
    }
    
    try {
      const currentLocations = locationIds || [];
      await updateCampaign({ 
        id: campaignId,
        clerkId: user.id,
        locationIds: [...currentLocations, entityId] 
      });
      onUpdate();
    } catch (error) {
      console.error("Error linking location:", error);
      alert("Failed to link location. Please try again.");
    }
    
    closeModal();
  };

  const handleLocationCreated = async (locationId: Id<"locations">) => {
    if (!user?.id) {
      alert("You must be logged in to perform this action.");
      return;
    }
    
    try {
      const currentLocations = locationIds || [];
      await updateCampaign({ 
        id: campaignId,
        clerkId: user.id,
        locationIds: [...currentLocations, locationId] 
      });
      onUpdate();
      alert("Location created and linked successfully!");
    } catch (error) {
      console.error("Error linking location:", error);
      alert("Location created but failed to link. You can link it manually.");
    }
    
    closeModal();
  };

  const handleUnlinkEntity = async (entityId: Id<any>) => {
    if (!user?.id) {
      alert("You must be logged in to perform this action.");
      return;
    }
    
    try {
      const currentLocations = locationIds || [];
      await updateCampaign({ 
        id: campaignId,
        clerkId: user.id,
        locationIds: currentLocations.filter(id => id !== entityId) 
      });
      onUpdate();
    } catch (error) {
      console.error("Error unlinking location:", error);
      alert("Failed to unlink location. Please try again.");
    }
  };

  return (
    <div className="locations-section">
      <div className="section-header">
        <div className="header-left">
          <button 
            className="collapse-button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand locations section" : "Collapse locations section"}
          >
            {isCollapsed ? "▶️" : "▼"}
          </button>
          <h3 className="section-title">🗺️ Locations ({campaignLocations.length})</h3>
        </div>
        <div className="header-actions">
          <button 
            className="add-button"
            onClick={openEntitySelection}
          >
            + Link Location
          </button>
          <button 
            className="add-button"
            onClick={openLocationCreation}
          >
            + Create Location
          </button>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="section-content">
          {campaignLocations.length > 0 ? (
            <div className="entities-grid">
              {campaignLocations.map((location: any) => (
                <div key={location._id} className="entity-card">
                  <div className="entity-info">
                    <h4 className="entity-name">{location.name}</h4>
                    <p className="entity-description">
                      {location.description?.substring(0, 100)}...
                    </p>
                    <span className="entity-type">{location.type}</span>
                  </div>
                  <div className="entity-actions">
                    <button 
                      className="unlink-button"
                      onClick={() => handleUnlinkEntity(location._id)}
                    >
                      Unlink
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No locations added to this campaign yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {activeModal === "entitySelection" && (
        <EntitySelectionModal
          isOpen={true}
          onClose={closeModal}
          onSelect={handleEntitySelect}
          entityType="locations"
          title="Link Existing Location"
          currentLinkedIds={locationIds}
        />
      )}

      {activeModal === "locationCreation" && (
        <LocationCreationModal
          isOpen={true}
          onClose={closeModal}
          onSuccess={handleLocationCreated}
        />
      )}
    </div>
  );
};

export default LocationsSection; 