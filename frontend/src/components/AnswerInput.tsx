import {Text, Popover, Button, Group, Divider, Paper } from '@mantine/core';
import { IconKeyboard, IconMicrophone } from '@tabler/icons-react';

export default function AnswerInput() {
  return (
    <Paper shadow='md'>
      <Group spacing={0}>
        <Button variant='subtle'>
          <IconMicrophone />
        </Button>
        <Divider orientation='vertical'/>
        <Popover>
          <Popover.Target>
            <Button variant='subtle'>
              <IconKeyboard />
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <Text>
            Hello World
            </Text>
          </Popover.Dropdown>
        </Popover>
      </Group>
    </Paper>
  )}
