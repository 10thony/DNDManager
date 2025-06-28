import React, { useState } from "react";
import { useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { useDarkMode } from "../../contexts/DarkModeContext";
import "./CampaignList.css";

const CampaignList: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
  const pageSize = 10;

  const campaigns = useQuery(api.campaigns.getAllCampaigns);

  const toggleCampaignExpansion = (campaignId: string) => {
    setExpandedCampaigns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(campaignId)) {
        newSet.delete(campaignId);
      } else {
        newSet.add(campaignId);
      }
      return newSet;
    });
  };

  const handleCampaignClick = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}`);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getBossMonsterCount = (campaign: any) => {
    // TODO: Implement boss monster counting logic
    // For now, return 0 as placeholder
    return 0;
  };

  if (!campaigns) {
    return (
      <div className="campaigns-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading campaigns...</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(campaigns.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const currentCampaigns = campaigns.slice(startIndex, endIndex);

  return (
    <div className="campaigns-container">
      <div className="campaigns-header">
        <div className="header-content">
          <h2 className="campaigns-title">Campaigns</h2>
          <p className="campaigns-subtitle">
            Manage and organize your D&D campaigns
          </p>
        </div>
        <button
          className="create-button"
          onClick={() => navigate("/campaigns/new")}
        >
          <span className="button-icon">+</span>
          Create New Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No Campaigns Yet</h3>
          <p>Get started by creating your first campaign.</p>
          <button
            className="create-button"
            onClick={() => navigate("/campaigns/new")}
          >
            Create Your First Campaign
          </button>
        </div>
      ) : (
        <>
          <div className="campaigns-list">
            {currentCampaigns.map((campaign: any) => (
              <div key={campaign._id} className="campaign-card">
                <div 
                  className="campaign-header"
                  onClick={() => toggleCampaignExpansion(campaign._id)}
                >
                  <div className="campaign-title-section">
                    <h3 className="campaign-name">{campaign.name}</h3>
                    <div className={`visibility-badge ${campaign.isPublic ? 'public' : 'private'}`}>
                      {campaign.isPublic ? '🌐 Public' : '🔒 Private'}
                    </div>
                  </div>
                  <div className="campaign-meta">
                    <span className="campaign-date">
                      Created {formatDate(campaign.createdAt)}
                    </span>
                    <div className="campaign-quick-actions">
                      <button
                        className="quick-view-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCampaignClick(campaign._id);
                        }}
                        title="View Campaign Details"
                      >
                        👁️
                      </button>
                      <span className="expand-indicator">
                        {expandedCampaigns.has(campaign._id) ? "▼" : "▶"}
                      </span>
                    </div>
                  </div>
                </div>

                {expandedCampaigns.has(campaign._id) && (
                  <div className="campaign-details">
                    {campaign.description && (
                      <p className="campaign-description">{campaign.description}</p>
                    )}
                    
                    <div className="campaign-stats">
                      <div className="stat-item">
                        <span className="stat-label">Player Characters:</span>
                        <span className="stat-value">
                          {campaign.participantPlayerCharacterIds?.length || 0}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">NPCs:</span>
                        <span className="stat-value">
                          {campaign.npcIds?.length || 0}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Quests:</span>
                        <span className="stat-value">
                          {campaign.questIds?.length || 0}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Locations:</span>
                        <span className="stat-value">
                          {campaign.locationIds?.length || 0}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Boss Monsters:</span>
                        <span className="stat-value">
                          {getBossMonsterCount(campaign)}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Timeline Events:</span>
                        <span className="stat-value">
                          {campaign.timelineEventIds?.length || 0}
                        </span>
                      </div>
                    </div>

                    <div className="campaign-actions">
                      <button
                        className="view-button primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCampaignClick(campaign._id);
                        }}
                      >
                        📖 View Details
                      </button>
                      <button
                        className="edit-button secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/campaigns/${campaign._id}/edit`);
                        }}
                      >
                        ✏️ Edit Campaign
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                ← Previous
              </button>
              
              <div className="page-info">
                Page {currentPage + 1} of {totalPages}
              </div>
              
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CampaignList; 