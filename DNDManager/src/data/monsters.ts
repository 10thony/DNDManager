import { MonsterData } from "../types/monsters";

// Import the monsters data from JSON
import monstersJson from "../../monsters.json";

// Type assertion to ensure the imported data matches our MonsterData interface
const monstersData = monstersJson as MonsterData[];

export default monstersData; 