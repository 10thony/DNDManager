import React from 'react';
import { PlayerCharacterAction } from '../types/dndRules';

interface ActionProps {
  action: PlayerCharacterAction;
}

const Action: React.FC<ActionProps> = ({ action }) => {
  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'MELEE_ATTACK':
      case 'RANGED_ATTACK':
        return 'bg-red-100 text-red-800';
      case 'SPELL':
        return 'bg-blue-100 text-blue-800';
      case 'CLASS_FEATURE':
        return 'bg-purple-100 text-purple-800';
      case 'COMMONLY_AVAILABLE_UTILITY':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionCostColor = (cost: string) => {
    switch (cost) {
      case 'Action':
        return 'bg-yellow-100 text-yellow-800';
      case 'Bonus Action':
        return 'bg-orange-100 text-orange-800';
      case 'Reaction':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{action.name}</h3>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getActionTypeColor(action.type)}`}>
            {action.type.replace(/_/g, ' ')}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getActionCostColor(action.actionCost)}`}>
            {action.actionCost}
          </span>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-3">{action.description}</p>

      {action.type === 'SPELL' && 'spellLevel' in action && (
        <div className="mb-2">
          <span className="text-sm font-medium text-gray-700">Level {action.spellLevel}</span>
          {action.requiresConcentration && (
            <span className="ml-2 text-sm text-purple-600">(Concentration)</span>
          )}
        </div>
      )}

      {action.type === 'CLASS_FEATURE' && 'className' in action && (
        <div className="mb-2">
          <span className="text-sm font-medium text-gray-700">{action.className} Feature</span>
          {action.usesPer && (
            <span className="ml-2 text-sm text-gray-500">
              ({action.maxUses} uses per {action.usesPer})
            </span>
          )}
        </div>
      )}

      {'damageRolls' in action && action.damageRolls && action.damageRolls.length > 0 && (
        <div className="mt-2">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Damage:</h4>
          <div className="flex flex-wrap gap-2">
            {action.damageRolls.map((roll, index) => (
              <div key={index} className="bg-gray-50 px-2 py-1 rounded text-sm">
                {roll.dice.count}d{roll.dice.type} + {roll.modifier} {roll.damageType.toLowerCase()}
              </div>
            ))}
          </div>
        </div>
      )}

      {action.sourceBook && (
        <div className="mt-2 text-xs text-gray-500">
          Source: {action.sourceBook}
        </div>
      )}
    </div>
  );
};

export default Action; 