import { Command } from "commander";
import prompts from "prompts";
import ora from "ora";
import chalk from "chalk";
import { handleError } from "@/utils/handle-error";
import { execSync } from "child_process";

const DEFAULT_DIRECTORY = "blott-app";
const REACT_NATIVE_VERSION = "0.71.12";
const spinner = ora();
const onPromptState = (state: any) => {
  if (state.aborted) {
    // If we don't re-enable the terminal cursor before exiting
    // the program, the cursor will remain hidden
    process.stdout.write("\x1B[?25h");
    process.stdout.write("\n");
    process.exit(1);
  }
};

export const init = new Command()
  .name("init")
  .description("Initialize a new Blott RN")
  .action(async () => {
    try {
      // Prompt for folder name
      const answers = await prompts({
        type: "text",
        name: "appName",
        message: "What are you going to build 🚀",
        initial: DEFAULT_DIRECTORY,
        onState: onPromptState,
      });

      spinner.start("Setting up your project...\n");

      // Download the Code
      execSync(
        `npx react-native@${REACT_NATIVE_VERSION} init ${
          answers.appName || DEFAULT_DIRECTORY
        }`,
        {
          stdio: "inherit", // This will display the CLI output in your terminal
        }
      );

      spinner.succeed(chalk.green("Setting up your project is successful! 🎉"));
    } catch (error) {
      handleError(error);
    }
  });
