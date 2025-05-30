import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  type CreateCharacterForm,
  DND_CLASSES,
  DND_RACES,
  DND_BACKGROUNDS,
  DND_SKILLS,
  type AbilityScores,
} from "../types/character";

interface CharacterFormProps {
  onSuccess?: () => void;
}

const initialAbilityScores: AbilityScores = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
};

const CharacterForm: React.FC<CharacterFormProps> = ({ onSuccess }) => {
  const createCharacter = useMutation(api.playerCharacter.createPlayerCharacter);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateCharacterForm>({
    name: "",
    class: "",
    race: "",
    background: "",
    level: 1,
    hitPoints: 8,
    armorClass: 10,
    proficiencyBonus: 2,
    speed: 30,
    abilityScores: { ...initialAbilityScores },
    savingThrows: { ...initialAbilityScores },
    skills: [],
    languages: [],
    proficiencies: [],
    equipment: [],
    spells: [],
    notes: "",
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Character name is required";
    }
    if (!formData.class) {
      newErrors.class = "Character class is required";
    }
    if (!formData.race) {
      newErrors.race = "Character race is required";
    }
    if (!formData.background) {
      newErrors.background = "Character background is required";
    }
    if (formData.level < 1 || formData.level > 20) {
      newErrors.level = "Level must be between 1 and 20";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createCharacter(formData);
      
      // Reset form
      setFormData({
        name: "",
        class: "",
        race: "",
        background: "",
        level: 1,
        hitPoints: 8,
        armorClass: 10,
        proficiencyBonus: 2,
        speed: 30,
        abilityScores: { ...initialAbilityScores },
        savingThrows: { ...initialAbilityScores },
        skills: [],
        languages: [],
        proficiencies: [],
        equipment: [],
        spells: [],
        notes: "",
      });
      
      onSuccess?.();
    } catch (error) {
      console.error("Error creating character:", error);
      setErrors({ submit: "Failed to create character. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAbilityScoreChange = (
    type: "abilityScores" | "savingThrows",
    ability: keyof AbilityScores,
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [ability]: value,
      },
    }));
  };

  const handleArrayFieldChange = (
    field: "skills" | "languages" | "proficiencies" | "equipment" | "spells",
    value: string
  ) => {
    const values = value.split(",").map((v) => v.trim()).filter(Boolean);
    setFormData((prev) => ({
      ...prev,
      [field]: values,
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Create New Character
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Character Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter character name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class *
            </label>
            <select
              value={formData.class}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, class: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a class</option>
              {DND_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
            {errors.class && (
              <p className="text-red-500 text-sm mt-1">{errors.class}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Race *
            </label>
            <select
              value={formData.race}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, race: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a race</option>
              {DND_RACES.map((race) => (
                <option key={race} value={race}>
                  {race}
                </option>
              ))}
            </select>
            {errors.race && (
              <p className="text-red-500 text-sm mt-1">{errors.race}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background *
            </label>
            <select
              value={formData.background}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, background: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a background</option>
              {DND_BACKGROUNDS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
            {errors.background && (
              <p className="text-red-500 text-sm mt-1">{errors.background}</p>
            )}
          </div>
        </div>

        {/* Character Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.level}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  level: parseInt(e.target.value) || 1,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hit Points
            </label>
            <input
              type="number"
              min="1"
              value={formData.hitPoints}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  hitPoints: parseInt(e.target.value) || 1,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Armor Class
            </label>
            <input
              type="number"
              min="1"
              value={formData.armorClass}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  armorClass: parseInt(e.target.value) || 10,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proficiency Bonus
            </label>
            <input
              type="number"
              min="1"
              value={formData.proficiencyBonus}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  proficiencyBonus: parseInt(e.target.value) || 2,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Speed
            </label>
            <input
              type="number"
              min="0"
              value={formData.speed}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  speed: parseInt(e.target.value) || 30,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Ability Scores */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Ability Scores
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {Object.entries(formData.abilityScores).map(([ability, value]) => (
              <div key={ability}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {ability}
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={value}
                  onChange={(e) =>
                    handleAbilityScoreChange(
                      "abilityScores",
                      ability as keyof AbilityScores,
                      parseInt(e.target.value) || 10
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Saving Throws */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Saving Throws
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {Object.entries(formData.savingThrows).map(([ability, value]) => (
              <div key={ability}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {ability}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) =>
                    handleAbilityScoreChange(
                      "savingThrows",
                      ability as keyof AbilityScores,
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Skills</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {DND_SKILLS.map((skill) => (
              <label key={skill} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.skills.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{skill}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Languages (comma-separated)
            </label>
            <input
              type="text"
              value={formData.languages.join(", ")}
              onChange={(e) => handleArrayFieldChange("languages", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Common, Elvish, Draconic"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proficiencies (comma-separated)
            </label>
            <input
              type="text"
              value={formData.proficiencies.join(", ")}
              onChange={(e) =>
                handleArrayFieldChange("proficiencies", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Light Armor, Simple Weapons"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Equipment (comma-separated)
          </label>
          <textarea
            value={formData.equipment.join(", ")}
            onChange={(e) => handleArrayFieldChange("equipment", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Longsword, Shield, Leather Armor, Backpack"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Spells (comma-separated, optional)
          </label>
          <textarea
            value={formData.spells?.join(", ") || ""}
            onChange={(e) => handleArrayFieldChange("spells", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Fireball, Magic Missile, Cure Wounds"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={formData.notes || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Character backstory, personality traits, etc."
          />
        </div>

        {errors.submit && (
          <div className="text-red-500 text-sm">{errors.submit}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating Character..." : "Create Character"}
        </button>
      </form>
    </div>
  );
};

export default CharacterForm;
