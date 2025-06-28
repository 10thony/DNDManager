// Simple test script to verify monster import
const fs = require('fs');
const path = require('path');

// Read the monsters.json file
const monstersPath = path.join(__dirname, 'monsters.json');
const monstersData = JSON.parse(fs.readFileSync(monstersPath, 'utf8'));

console.log('Total monsters in JSON file:', monstersData.length);
console.log('Monster names:');
monstersData.forEach((monster, index) => {
  console.log(`${index + 1}. ${monster.name} (CR ${monster.challengeRating})`);
});

// Test the transformation logic
const transformedMonsters = monstersData.map((monster, index) => {
  console.log(`Processing monster ${index + 1}: ${monster.name}`);
  
  // Destructure to exclude timestamp fields
  const { createdAt, updatedAt, ...monsterWithoutTimestamps } = monster;
  
  return {
    ...monsterWithoutTimestamps,
    campaignId: undefined,
    hitDice: {
      count: Number(monster.hitDice.count),
      die: monster.hitDice.die
    },
    size: monster.size,
    armorClass: Number(monster.armorClass),
    hitPoints: Number(monster.hitPoints),
    proficiencyBonus: Number(monster.proficiencyBonus),
    abilityScores: {
      strength: Number(monster.abilityScores.strength),
      dexterity: Number(monster.abilityScores.dexterity),
      constitution: Number(monster.abilityScores.constitution),
      intelligence: Number(monster.abilityScores.intelligence),
      wisdom: Number(monster.abilityScores.wisdom),
      charisma: Number(monster.abilityScores.charisma),
    },
    senses: {
      ...monster.senses,
      passivePerception: Number(monster.senses.passivePerception),
    },
    source: monster.source || undefined,
    page: monster.page || undefined,
    tags: monster.tags || undefined,
    armorType: monster.armorType || undefined,
    savingThrows: monster.savingThrows || undefined,
    skills: monster.skills || undefined,
    damageVulnerabilities: monster.damageVulnerabilities || undefined,
    damageResistances: monster.damageResistances || undefined,
    damageImmunities: monster.damageImmunities || undefined,
    conditionImmunities: monster.conditionImmunities || undefined,
    languages: monster.languages || undefined,
    experiencePoints: monster.experiencePoints ? Number(monster.experiencePoints) : undefined,
    traits: monster.traits || undefined,
    actions: monster.actions || undefined,
    reactions: monster.reactions || undefined,
    legendaryActions: monster.legendaryActions || undefined,
    lairActions: monster.lairActions || undefined,
    regionalEffects: monster.regionalEffects || undefined,
    environment: monster.environment || undefined,
  };
});

console.log('\nTransformed monsters count:', transformedMonsters.length);
console.log('Sample transformed monster:', JSON.stringify(transformedMonsters[0], null, 2)); 