import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  type CharacterFormData,
  DND_CLASSES,
  DND_RACES,
  DND_BACKGROUNDS,
  DND_SKILLS,
} from "../types/character";

interface CharacterFormProps {
  onSuccess?: () => void;
}

const CharacterForm: React.FC<CharacterFormProps> = ({ onSuccess }) => {
  const createCharacter = useMutation(api.characters.createCharacter);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CharacterFormData>({
    name: "",
    class: "",
    race: "",
    background: "",
    level: 1,
    hitPoints: { current: 8, maximum: 8, temporary: 0 },
    armorClass: 10,
    speed: 30,
    proficiencyBonus: 2,
    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    savingThrows: {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false,
      charisma: false,
    },
    skills: [],
    languages: ["Common"],
    equipment: [],
    spells: [],
    notes: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: checkbox.checked,
      }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAbilityScoreChange = (ability: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      abilityScores: {
        ...prev.abilityScores,
        [ability]: value,
      },
    }));
  };

  const handleSavingThrowChange = (ability: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      savingThrows: {
        ...prev.savingThrows,
        [ability]: checked,
      },
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleArrayInputChange = (
    field: "languages" | "equipment",
    value: string
  ) => {
    const items = value.split(",").map((item) => item.trim()).filter(Boolean);
    setFormData((prev) => ({
      ...prev,
      [field]: items,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Character name is required");
      return false;
    }
    if (!formData.class) {
      setError("Character class is required");
      return false;
    }
    if (!formData.race) {
      setError("Character race is required");
      return false;
    }
    if (!formData.background) {
      setError("Character background is required");
      return false;
    }
    if (formData.level < 1 || formData.level > 20) {
      setError("Character level must be between 1 and 20");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await createCharacter(formData);
      
      // Reset form
      setFormData({
        name: "",
        class: "",
        race: "",
        background: "",
        level: 1,
        hitPoints: { current: 8, maximum: 8, temporary: 0 },
        armorClass: 10,
        speed: 30,
        proficiencyBonus: 2,
        abilityScores: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        },
        savingThrows: {
          strength: false,
          dexterity: false,
          constitution: false,
          intelligence: false,
          wisdom: false,
          charisma: false,
        },
        skills: [],
        languages: ["Common"],
        equipment: [],
        spells: [],
        notes: "",
      });

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create character");
    } finally {
      setIsLoading(false);
    }
  };

  const getAbilityModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Create New Character
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Character Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level *
            </label>
            <input
              type="number"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              min="1"
              max="20"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class *
            </label>
            <select
              name="class"
              value={formData.class}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a class</option>
              {DND_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Race *
            </label>
            <select
              name="race"
              value={formData.race}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a race</option>
              {DND_RACES.map((race) => (
                <option key={race} value={race}>
                  {race}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background *
            </label>
            <select
              name="background"
              value={formData.background}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a background</option>
              {DND_BACKGROUNDS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ability Scores */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Ability Scores
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(formData.abilityScores).map(([ability, score]) => (
              <div key={ability} className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {ability}
                </label>
                <input
                  type="number"
                  value={score}
                  onChange={(e) =>
                    handleAbilityScoreChange(ability, parseInt(e.target.value) || 0)
                  }
                  min="1"
                  max="20"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Mod: {getAbilityModifier(score) >= 0 ? '+' : ''}
                  {getAbilityModifier(score)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Combat Stats */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Combat Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Armor Class
              </label>
              <input
                type="number"
                name="armorClass"
                value={formData.armorClass}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speed
              </label>
              <input
                type="number"
                name="speed"
                value={formData.speed}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max HP
              </label>
              <input
                type="number"
                value={formData.hitPoints.maximum}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    hitPoints: {
                      ...prev.hitPoints,
                      maximum: parseInt(e.target.value) || 0,
                      current: parseInt(e.target.value) || 0,
                    },
                  }))
                }
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proficiency Bonus
              </label>
              <input
                type="number"
                name="proficiencyBonus"
                value={formData.proficiencyBonus}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Saving Throws */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Saving Throw Proficiencies
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(formData.savingThrows).map(([ability, proficient]) => (
              <label key={ability} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={proficient}
                  onChange={(e) =>
                    handleSavingThrowChange(ability, e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm capitalize">{ability}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Skill Proficiencies
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {DND_SKILLS.map((skill) => (
              <label key={skill} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.skills.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{skill}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Languages and Equipment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Languages (comma-separated)
            </label>
            <input
              type="text"
              value={formData.languages.join(", ")}
              onChange={(e) => handleArrayInputChange("languages", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Common, Elvish, Draconic"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Equipment (comma-separated)
            </label>
            <input
              type="text"
              value={formData.equipment.join(", ")}
              onChange={(e) => handleArrayInputChange("equipment", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Longsword, Shield, Leather Armor"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional character notes, backstory, etc."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create Character"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CharacterForm;
