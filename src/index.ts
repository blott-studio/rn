#!/usr/bin/env node
import {Command} from 'commander';
import {init} from '@/commands/init';

const handleSigTerm = () => process.exit(0);

process.on('SIGINT', () => handleSigTerm);
process.on('SIGTERM', () => handleSigTerm);

async function main() {
  const program = new Command()
    .name('shadcn-ui')
    .description('add components and dependencies to your project');

  program.addCommand(init);

  program.parse();
}

main();
