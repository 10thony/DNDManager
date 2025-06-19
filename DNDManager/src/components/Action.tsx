import React from 'react';
import { PlayerCharacterAction } from '../types/dndRules';

interface ActionProps {
  action: PlayerCharacterAction;
}

const Action: React.FC<ActionProps> = ({ action }) => {
  const getActionTypeBadge = (type: string) => {
    switch (type) {
      case 'MELEE_ATTACK':
      case 'RANGED_ATTACK':
        return 'action-type-badge';
      case 'SPELL':
        return 'action-type-badge';
      case 'CLASS_FEATURE':
        return 'action-type-badge';
      case 'COMMONLY_AVAILABLE_UTILITY':
        return 'action-type-badge';
      default:
        return 'action-type-badge';
    }
  };

  const getActionCostBadge = (cost: string) => {
    switch (cost) {
      case 'Action':
        return 'action-cost-badge';
      case 'Bonus Action':
        return 'action-cost-badge';
      case 'Reaction':
        return 'action-cost-badge';
      default:
        return 'action-cost-badge';
    }
  };

  return (
    <div className="action-card">
      <div className="action-header">
        <div className="action-title-section">
          <h3 className="action-name">{action.name}</h3>
        </div>
        <div className="flex gap-2">
          <span className={getActionTypeBadge(action.type)}>
            {action.type.replace(/_/g, ' ')}
          </span>
          <span className={getActionCostBadge(action.actionCost)}>
            {action.actionCost}
          </span>
        </div>
      </div>

      <p className="action-description">{action.description}</p>

      {action.type === 'SPELL' && 'spellLevel' in action && (
        <div className="spell-info mb-2">
          <span className="spell-level">Level {action.spellLevel}</span>
          {action.requiresConcentration && (
            <span className="concentration-badge ml-2">(Concentration)</span>
          )}
        </div>
      )}

      {action.type === 'CLASS_FEATURE' && 'className' in action && (
        <div className="class-info mb-2">
          <span className="class-name">{action.className} Feature</span>
          {action.usesPer && (
            <span className="ml-2 text-sm text-gray-500">
              ({action.maxUses} uses per {action.usesPer})
            </span>
          )}
        </div>
      )}

      {'damageRolls' in action && action.damageRolls && action.damageRolls.length > 0 && (
        <div className="action-details mt-2">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Damage:</h4>
          <div className="flex flex-wrap gap-2">
            {action.damageRolls.map((roll, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                {roll.dice.count}d{roll.dice.type} + {roll.modifier} {roll.damageType.toLowerCase()}
              </div>
            ))}
          </div>
        </div>
      )}

      {action.sourceBook && (
        <div className="source-book mt-2">
          Source: {action.sourceBook}
        </div>
      )}
    </div>
  );
};

export default Action; 