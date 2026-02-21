#!/usr/bin/env node
/**
 * HodlAI Automaton CLI
 *
 * Creator-facing CLI for interacting with an automaton.
 * Usage: hodlai-terminal <command> [args]
 */

const args = process.argv.slice(2);
const command = args[0];

async function main(): Promise<void> {
  switch (command) {
    case "status":
      await import("./commands/status.js");
      break;
    case "logs":
      await import("./commands/logs.js");
      break;
    case "fund":
      await import("./commands/fund.js");
      break;
    case "send":
      await import("./commands/send.js");
      break;
    default:
      console.log(`
HodlAI Automaton CLI - Creator Tools

Usage:
  hodlai-terminal status              Show automaton status
  hodlai-terminal logs [--tail N]     View automaton logs
  hodlai-terminal fund <amount> [--to 0x...]  Transfer HodlAI credits
  hodlai-terminal send <to-address> <message> Send a social message
`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
