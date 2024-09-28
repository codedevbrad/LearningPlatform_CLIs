#!/usr/bin/env node

import Enquirer from 'enquirer'; // Import the default export
const { prompt } = Enquirer; // Destructure prompt from the default export
import chalk from 'chalk'; // Import chalk for styling

import generateBlockComponent from './generate/block.js';
import generatReusableComponent from './generate/reusable.js';

async function run() {
  console.log(chalk.blue.bold("Welcome.. You're using the new codingPlatform CLI!..."));

  // Initial prompt to select between reusable or block
  const { choice } = await prompt([{
      type: 'select',
      name: 'choice',
      message: 'What would you like to generate?',
      choices: ['reusable', 'block'],
  }]);

  // Handle the choice
  if (choice === 'reusable') {
    await generatReusableComponent();
    console.log(chalk.green(`✔ Generated reusable component`));
  } 
  else if (choice === 'block') {
    await generateBlockComponent();
    console.log(chalk.green(`✔ Generated new block`));
  }
}

run();