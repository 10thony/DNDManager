import React, { useState } from 'react';
import { PlayerCharacterAction } from '../types/dndRules';
import Action from './Action';

interface ActionListProps {
  actions: PlayerCharacterAction[];
}

const ActionList: React.FC<ActionListProps> = ({ actions }) => {
  const [filter, setFilter] = useState<string>('all');

  const filteredActions = actions.filter(action => {
    if (filter === 'all') return true;
    return action.type === filter;
  });

  const actionTypes = [
    { value: 'all', label: 'All Actions' },
    { value: 'MELEE_ATTACK', label: 'Melee Attacks' },
    { value: 'RANGED_ATTACK', label: 'Ranged Attacks' },
    { value: 'SPELL', label: 'Spells' },
    { value: 'CLASS_FEATURE', label: 'Class Features' },
    { value: 'COMMONLY_AVAILABLE_UTILITY', label: 'Utility' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {actionTypes.map(type => (
          <button
            key={type.value}
            onClick={() => setFilter(type.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
              ${filter === type.value 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredActions.map(action => (
          <Action key={action.id} action={action} />
        ))}
      </div>

      {filteredActions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No actions found for the selected filter.
        </div>
      )}
    </div>
  );
};

export default ActionList; 