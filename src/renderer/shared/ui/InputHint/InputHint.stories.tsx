import { type ComponentMeta, type ComponentStory } from '@storybook/react';

import { InputHint } from './InputHint';

export default {
  title: 'Input Hint',
  component: InputHint,
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as ComponentMeta<typeof InputHint>;

const Template: ComponentStory<typeof InputHint> = (args) => <InputHint {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  active: true,
  variant: 'hint',
  children: 'Test hint text',
};

// export const Error = Template.bind({});
// Error.args = {
//   active: true,
//   variant: 'error',
//   children: 'Test error text',
// };
