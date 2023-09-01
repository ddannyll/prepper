import type { Meta, StoryObj } from '@storybook/react';

import Badge from '@/components/Badge';
//👇 This default export determines where your story goes in the story list
const meta: Meta = {
  component: Badge,
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Usage: Story = {
  args: {
    children: "Badge"
  },
};
