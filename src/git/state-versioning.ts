/**
 * State Versioning
 *
 * Version control the automaton's own state files (~/.automaton/).
 * Every self-modification triggers a git commit with a descriptive message.
 * The automaton's entire identity history is version-controlled and replayable.
 */

import type { HodlAIClient, AutomatonDatabase } from "../types.js";
import { gitInit, gitCommit, gitStatus, gitLog } from "./tools.js";

const AUTOMATON_DIR = "~/.automaton";

function resolveHome(p: string): string {
  const home = process.env.HOME || "/root";
  if (p.startsWith("~")) {
    return `${home}${p.slice(1)}`;
  }
  return p;
}

/**
 * Initialize git repo for the automaton's state directory.
 * Creates .gitignore to exclude sensitive files.
 */
export async function initStateRepo(
  hodlai: HodlAIClient,
): Promise<void> {
  const dir = resolveHome(AUTOMATON_DIR);

  // Check if already initialized
  const checkResult = await hodlai.exec(
    `test -d ${dir}/.git && echo "exists" || echo "nope"`,
    5000,
  );

  if (checkResult.stdout.trim() === "exists") {
    return;
  }

  // Initialize
  await gitInit(hodlai, dir);

  // Create .gitignore for sensitive files
  const gitignore = `# Sensitive files - never commit
wallet.json
config.json
state.db
state.db-wal
state.db-shm
logs/
*.log
*.err
`;

  await hodlai.writeFile(`${dir}/.gitignore`, gitignore);

  // Configure git user
  await hodlai.exec(
    `cd ${dir} && git config user.name "Automaton" && git config user.email "automaton@hodlai.fun"`,
    5000,
  );

  // Initial commit
  await gitCommit(hodlai, dir, "genesis: automaton state repository initialized");
}

/**
 * Commit a state change with a descriptive message.
 * Called after any self-modification.
 */
export async function commitStateChange(
  hodlai: HodlAIClient,
  description: string,
  category: string = "state",
): Promise<string> {
  const dir = resolveHome(AUTOMATON_DIR);

  // Check if there are changes
  const status = await gitStatus(hodlai, dir);
  if (status.clean) {
    return "No changes to commit";
  }

  const message = `${category}: ${description}`;
  const result = await gitCommit(hodlai, dir, message);
  return result;
}

/**
 * Commit after a SOUL.md update.
 */
export async function commitSoulUpdate(
  hodlai: HodlAIClient,
  description: string,
): Promise<string> {
  return commitStateChange(hodlai, description, "soul");
}

/**
 * Commit after a skill installation or removal.
 */
export async function commitSkillChange(
  hodlai: HodlAIClient,
  skillName: string,
  action: "install" | "remove" | "update",
): Promise<string> {
  return commitStateChange(
    hodlai,
    `${action} skill: ${skillName}`,
    "skill",
  );
}

/**
 * Commit after heartbeat config change.
 */
export async function commitHeartbeatChange(
  hodlai: HodlAIClient,
  description: string,
): Promise<string> {
  return commitStateChange(hodlai, description, "heartbeat");
}

/**
 * Commit after config change.
 */
export async function commitConfigChange(
  hodlai: HodlAIClient,
  description: string,
): Promise<string> {
  return commitStateChange(hodlai, description, "config");
}

/**
 * Get the state repo history.
 */
export async function getStateHistory(
  hodlai: HodlAIClient,
  limit: number = 20,
) {
  const dir = resolveHome(AUTOMATON_DIR);
  return gitLog(hodlai, dir, limit);
}
