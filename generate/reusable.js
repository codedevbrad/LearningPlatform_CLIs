import Enquirer from 'enquirer'; // Import the default export
const { prompt } = Enquirer; // Destructure prompt from the default export
import chalk from 'chalk'; // Import chalk for styling
import path from 'path';
import fs from 'fs-extra';

// Function to generate a reusable component
export default async function generateReusableComponent() {
  // Step: Prompt the user for the component name
  const { blockName } = await prompt([{
    type: 'input',
    name: 'blockName',
    message: 'Enter the name of your new reusable component:',
    validate: (input) => (input ? true : 'Reusable component name cannot be empty.'),
  }]);

  // Step: Prompt the user for the function description
  const { functionDescription } = await prompt([{
    type: 'input',
    name: 'functionDescription',
    message: 'Describe what the component should do:',
    validate: (input) => (input ? true : 'Description cannot be empty.'),
  }]);

  // Step: Ask if the user wants to save the component in the default reusables folder
  const { useDefaultLocation } = await prompt([{
    type: 'confirm',
    name: 'useDefaultLocation',
    message: 'Do you want to save this component in the default "reusables" folder?',
    initial: true,
  }]);

  // Define the default path for reusable components
  const defaultPath = path.join(process.cwd(), 'reusables');

  // Set the path based on user input
  let blockFolderPath;
  if (useDefaultLocation) {
    blockFolderPath = path.join(defaultPath, blockName);
  } else {
    const { customPath } = await prompt([{
      type: 'input',
      name: 'customPath',
      message: 'Enter the custom path where you want to save your component:',
      validate: (input) => (input ? true : 'Custom path cannot be empty.'),
    }]);
    blockFolderPath = path.join(customPath, blockName);
  }

  // Create the component folder
  try {
    await fs.mkdir(blockFolderPath, { recursive: true });
    console.log(chalk.green(`✔ Created component folder: ${blockFolderPath}`));
  } catch (error) {
    console.error(chalk.red('✖ Error creating component folder:'), chalk.red(error));
    return; // Exit if the folder creation fails
  }

  // File paths for the component files
  const componentFilePath = path.join(blockFolderPath, `${blockName}.tsx`);
  const readmeFilePath = path.join(blockFolderPath, `${blockName}.readme`);

  // Component template to inject into the .tsx file
  const componentTemplate = (name, description) => `
    import React from 'react';
    
    /**
     * Component: ${name}
     * Description: ${description}
     */
    const ${name}: React.FC = () => {
      return (
        <div>
          {/* TODO: Implement the component logic based on the description */}
          <p>Reusable Component: ${name}</p>
        </div>
      );
    };
    
    export default ${name};
  `;

  // Readme template to inject into the .readme file
  const readmeTemplate = (name, description) => `
      # ${name} Component
      
      ## Description
      ${description}
      
      ## Usage
      This component is designed to be used as a reusable component across the application. Customize it according to your needs.
  `;

  // Write the component file
  try {
    await fs.writeFile(componentFilePath, componentTemplate(blockName, functionDescription).trim());
    console.log(chalk.green(`✔ Created file: ${componentFilePath}`));
  } catch (error) {
    console.error(chalk.red('✖ Error creating component file:'), chalk.red(error));
  }

  // Write the readme file
  try {
    await fs.writeFile(readmeFilePath, readmeTemplate(blockName, functionDescription).trim());
    console.log(chalk.green(`✔ Created file: ${readmeFilePath}`));
  } catch (error) {
    console.error(chalk.red('✖ Error creating readme file:'), chalk.red(error));
  }
}
