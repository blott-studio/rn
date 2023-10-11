import {Command} from 'commander';
import fs from 'fs-extra';
import path from 'path';
import tar from 'tar';
import axios from 'axios';
import {pipeline} from 'stream';
import prompts from 'prompts';
import ora from 'ora';
import chalk from 'chalk';
import {handleError} from '@/utils/handle-error';

const DEFAULT_DIRECTORY = 'blott-app';
const spinner = ora();
const onPromptState = (state: any) => {
  if (state.aborted) {
    // If we don't re-enable the terminal cursor before exiting
    // the program, the cursor will remain hidden
    process.stdout.write('\x1B[?25h');
    process.stdout.write('\n');
    process.exit(1);
  }
};

export const init = new Command()
  .name('init')
  .description('Initialize a new Blott RN')
  .action(async () => {
    try {
      // Prompt for folder name
      const answers = await prompts({
        type: 'text',
        name: 'appName',
        message: 'What are you going to build 🚀',
        initial: DEFAULT_DIRECTORY,
        onState: onPromptState,
      });

      spinner.start('Setting up your project...\n');

      const targetPath = path.resolve(
        process.cwd(),
        answers.appName || DEFAULT_DIRECTORY,
      );

      await fs.ensureDir(targetPath);

      // Download the boilerplate
      const response = await axios
        .get(
          'https://github.com/blott-studio/blott-native-boilerplate/archive/refs/heads/master.tar.gz',
          {responseType: 'stream'},
        )
        .catch(() => {
          spinner.fail(
            "Couldn't download because of the connectivity issue between this machine & Github.com. Can you take a look on that?",
          );
          process.exit(1);
        });

      await new Promise<void>((resolve, reject) => {
        pipeline(
          response.data,
          fs.createWriteStream(path.join(targetPath, 'blott-rn.tar.gz')),
          err => (err ? reject(err) : resolve()),
        );
      });

      // Extract and strip the top-level directory
      await tar.x({
        file: path.join(targetPath, 'blott-rn.tar.gz'),
        cwd: targetPath,
        strip: 1,
      });

      // Delete the downloaded tar.gz
      await fs.unlink(path.join(targetPath, 'blott-rn.tar.gz'));

      spinner.succeed(chalk.green('Setting up your project is successful! 🎉'));
    } catch (error) {
      handleError(error);
    }
  });
