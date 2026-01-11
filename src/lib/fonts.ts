export interface FontOption {
  name: string;
  value: string;
  description: string;
}

export const availableFonts: FontOption[] = [
  { name: 'Inter', value: 'Inter', description: 'Modern & Clean' },
  { name: 'Roboto', value: 'Roboto', description: 'Popular & Versatile' },
  { name: 'Poppins', value: 'Poppins', description: 'Friendly & Rounded' },
  { name: 'Open Sans', value: 'Open Sans', description: 'Neutral & Professional' },
  { name: 'Lato', value: 'Lato', description: 'Elegant & Warm' },
  { name: 'Nunito', value: 'Nunito', description: 'Soft & Approachable' },
  { name: 'Source Sans 3', value: 'Source Sans 3', description: 'Technical & Readable' },
];
