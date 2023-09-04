import type { Meta, StoryObj } from '@storybook/react';
import FormInput from '@/components/ui-kit/FormInput';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof FormInput> = {
  component: FormInput,
};

export default meta;
type Story = StoryObj<typeof FormInput>;

export const FirstStory: Story = {
  args: {
  },
};
