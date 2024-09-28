import Enquirer from 'enquirer'; // Import the default export
const { prompt } = Enquirer; // Destructure prompt from the default export
import chalk from 'chalk'; // Import chalk for styling
import path from 'path';
import fs from 'fs-extra';

// Function to generate a reusable block component
export default async function generateBlockComponent() {
  // Step: Prompt the user for the block name
  const { blockName } = await prompt([{
    type: 'input',
    name: 'blockName',
    message: 'Enter the name of your new block:',
    validate: (input) => (input ? true : 'Block component name cannot be empty.'),
  }]);

  // Step: Prompt the user for the block description
  const { functionDescription } = await prompt([{
    type: 'input',
    name: 'functionDescription',
    message: 'Describe what the block should do:',
    validate: (input) => (input ? true : 'Description cannot be empty.'),
  }]);

  // Step: Ask if the user wants to save the block in the default reusable blocks folder
  const { useDefaultLocation } = await prompt([{
    type: 'confirm',
    name: 'useDefaultLocation',
    message: 'Do you want to save this block in the default "reusables/blocks" folder?',
    initial: true,
  }]);

  // Define the default path for reusable blocks
  const defaultPath = path.join(process.cwd(), 'reusables', 'blocks');

  // Set the path based on user input
  let blockFolderPath;
  if (useDefaultLocation) {
    blockFolderPath = path.join(defaultPath, blockName);
  } else {
    const { customPath } = await prompt([{
      type: 'input',
      name: 'customPath',
      message: 'Enter the custom path where you want to save your block:',
      validate: (input) => (input ? true : 'Custom path cannot be empty.'),
    }]);
    blockFolderPath = path.join(customPath, blockName);
  }

  // Create the block folder
  try {
    await fs.mkdir(blockFolderPath, { recursive: true });
    console.log(chalk.green(`✔ Created block folder: ${blockFolderPath}`));
  } catch (error) {
    console.error(chalk.red('✖ Error creating block folder:'), chalk.red(error));
    return; // Exit if the folder creation fails
  }

  // File paths for the block files
  const componentFilePath = path.join(blockFolderPath, `${blockName}.tsx`);
  const adminComponentFilePath = path.join(blockFolderPath, `${blockName}.admin.tsx`);
  const readmeFilePath = path.join(blockFolderPath, `${blockName}.readme`);

  // Block template to inject into the .tsx file
  const blockTemplate = (name, description) => 
  `
    import React from 'react';
    import Title from '@/app/reusables/content/title';

    interface ${name}Props {
      content: string;
      title: string;
      type: '${name.toLowerCase()}';
      id?: string;
    }

    interface ${name}UsageProps {
      data: ${name}Props;
    }

    export const ${name.toLowerCase()}Object: ${name}Props = {
      content: '',
      title: '',
      type: '${name.toLowerCase()}',
    };

    const ${name}Component: React.FC<${name}UsageProps> = ({ data }) => {
      return (
        <div className="mt-4">
          <Title title={data.title} variant="subheading1" noMargin={false} />
          <p className="leading-8">
            {data.content}
          </p>
        </div>
      );
    };

    export default ${name}Component;
    export type { ${name}Props, ${name}UsageProps };
  `;

  // Admin block template to inject into the .admin.tsx file
  const adminBlockTemplate = (name) => 
  `
    'use client';
    import React, { useState, useRef } from 'react';
    import { CardContent } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import ${name}Component, { ${name}Props } from './${name.toLowerCase()}';
    import AdminBlockTemplate from '../../templates/admin/admin.block.form';
    import { AdminToolsProps } from '@/app/(pages)/(authed)/admin/_types/type.adminTools';
    import { Textarea } from '@/components/ui/textarea';

    interface ${name}BlockProps {
      data: ${name}Props;
      blockIndex: number;
      adminTools: AdminToolsProps;
    }

    const ${name}AdminBlock: React.FC<${name}BlockProps> = ({
      data,
      adminTools,
      blockIndex,
    }) => {
      const [formData, setFormData] = useState<${name}Props>(data);
      const [savedData, setSavedData] = useState<${name}Props | null>(data);
      const [isSaved, setIsSaved] = useState(true);

      const formRef = useRef(null);

      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
        setIsSaved(false); // Reset the save status when the form changes
      };

      const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSavedData(formData);
        setIsSaved(true); // Set the save status to true
        adminTools.updateDataBlock({ type: 'update', blockData: formData, blockIndex });
      };

      const handleDelete = () => {
        console.log('Clicked to delete example block', blockIndex);
        adminTools.updateDataBlock({ type: 'delete', blockData: null, blockIndex });
      };

      // Function to update content from AddLoremIpsum
      const updateLoremContent = (newContent: string) => {
        setFormData((prevData) => ({
          ...prevData,
          content: newContent,
        }));
        setIsSaved(false); // Reset save status
      };

      const form = (
        <form onSubmit={handleSubmit} ref={formRef}>
          <CardContent className="space-y-2 px-0">
            <div className="space-y-1">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="content">Content</Label>
              <Textarea
                wordLimit={300}
                rows={3}
                updateContentbyLorem={updateLoremContent}
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </CardContent>
        </form>
      );

      const preview = savedData ? (
        <${name}Component data={savedData} />
      ) : (
        <p>No data available. Please fill out the form.</p>
      );

      return (
        <AdminBlockTemplate
          title="${name}"
          description="Fill out the form and click save."
          form={form}
          savedData={preview}
          formRef={formRef}
          isSaved={isSaved}
          removeItem={handleDelete}
        />
      );
    };

    export default ${name}AdminBlock;
  `;

  // Readme template to inject into the .readme file
  const readmeTemplate = (name, description) => `
      # ${name} Block
      
      ## Description
      ${description}
      
      ## Usage
      This block is designed to be used as a reusable component across the application. Customize it according to your needs.
  `;

  // Write the block file
  try {
    await fs.writeFile(componentFilePath, blockTemplate(blockName, functionDescription).trim());
    console.log(chalk.green(`✔ Created file: ${componentFilePath}`));
  } catch (error) {
    console.error(chalk.red('✖ Error creating block file:'), chalk.red(error));
  }

  // Write the admin block file
  try {
    await fs.writeFile(adminComponentFilePath, adminBlockTemplate(blockName).trim());
    console.log(chalk.green(`✔ Created admin file: ${adminComponentFilePath}`));
  } catch (error) {
    console.error(chalk.red('✖ Error creating admin block file:'), chalk.red(error));
  }

  // Write the readme file
  try {
    await fs.writeFile(readmeFilePath, readmeTemplate(blockName, functionDescription).trim());
    console.log(chalk.green(`✔ Created file: ${readmeFilePath}`));
  } catch (error) {
    console.error(chalk.red('✖ Error creating readme file:'), chalk.red(error));
  }
}
