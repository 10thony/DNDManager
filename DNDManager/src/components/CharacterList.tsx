import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import type { AbilityScores } from "../types/character";

// Use the Doc type directly instead of importing from types
type PlayerCharacter = Doc<"playerCharacters">;

const CharacterList: React.FC = () => {
  const characters = useQuery(api.playerCharacter.getAllPlayerCharacters);

  // Rest of the component remains the same...


  if (characters === undefined) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading characters...</span>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg">No characters created yet.</p>
        <p className="text-sm">Create your first character above!</p>
      </div>
    );
  }

  const getAbilityModifier = (score: number): string => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Your Characters ({characters.length})
      </h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {characters.map((character: PlayerCharacter) => (
          <div
            key={character._id}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {character.name}
              </h3>
              <span className="text-sm text-gray-500">
                Level {character.level}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Class:</span>
                <span className="text-gray-800">{character.class}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Race:</span>
                <span className="text-gray-800">{character.race}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Background:</span>
                <span className="text-gray-800">{character.background}</span>
              </div>

              <div className="border-t pt-2 mt-3">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-medium text-gray-600">HP</div>
                    <div className="text-lg font-bold text-red-600">
                      {character.hitPoints}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-600">AC</div>
                    <div className="text-lg font-bold text-blue-600">
                      {character.armorClass}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-600">Speed</div>
                    <div className="text-lg font-bold text-green-600">
                      {character.speed}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-2 mt-3">
                <div className="text-xs font-medium text-gray-600 mb-2">
                  Ability Scores
                </div>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  {Object.entries(character.abilityScores as AbilityScores).map(
                    ([ability, score]) => (
                      <div key={ability} className="text-center">
                        <div className="font-medium text-gray-600 capitalize">
                          {ability.slice(0, 3)}
                        </div>
                        <div className="font-bold">
                          {score} ({getAbilityModifier(Number(score))})
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {character.skills.length > 0 && (
                <div className="border-t pt-2 mt-3">
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    Skills
                  </div>
                  <div className="text-xs text-gray-700">
                    {character.skills.join(", ")}
                  </div>
                </div>
              )}

              {character.notes && (
                <div className="border-t pt-2 mt-3">
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    Notes
                  </div>
                  <div className="text-xs text-gray-700 line-clamp-3">
                    {character.notes}
                  </div>
                </div>
              )}

              <div className="border-t pt-2 mt-3 text-xs text-gray-500">
                Created: {new Date(character.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterList;
