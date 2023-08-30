import AnswerInput from '@/components/AnswerInput'
import QuestionCard from '@/components/QuestionCard'
import { Box, Group, Stack} from '@mantine/core'


export default function Home() {
  return  <Stack
    justify='space-between'
    align='stretch'
    sx={theme => ({
      backgroundColor: theme.colors.gray[0],
      height: '100vh',
    })}
    py="xl"
  >
    <QuestionCard
      totalQuestionNum={5}
      prompt={'Tell me about yourself.'.split(' ')}
      promptReadIndex={2}
      tags={['background']} questionNum={2}
    />
    <Group
      position='center'
    >
      <AnswerInput />
    </Group>
  </Stack>
}
