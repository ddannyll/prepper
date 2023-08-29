import QuestionCard from '@/components/QuestionCard'
import { Box, Paper, createStyles } from '@mantine/core'


export default function Home() {
  return <Box
    sx={theme => ({
      backgroundColor: theme.colors.gray[0],
      height: '100vh',
    })}
  >
    <QuestionCard
      questionNum={2}
      totalQuestionNum={5}
      prompt={'Tell me about yourself.'.split(' ')}
      promptReadIndex={2}
      tags={['background']}
    />
  </Box>
}
