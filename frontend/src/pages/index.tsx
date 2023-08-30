import AnswerControls from '@/components/AnswerControls'
import Keyboard from '@/components/Keyboard'
import QuestionCard from '@/components/QuestionCard'
import { Box, Group, Stack} from '@mantine/core'
import { useState } from 'react'


export default function Home() {
  const [ keyboardOn , setKeyboardOn] = useState(false)

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
    <div className='flex flex-col items-center justify-end gap-8'>
      <div className="max-w-lg w-full px-2 grow-0">
        <Keyboard className={!keyboardOn ? 'opacity-0 transition' : 'transition'}/>
      </div>
      <AnswerControls
        onKeyboardClick={() => setKeyboardOn(!keyboardOn)}
        keyboardOn={keyboardOn}
      />
    </div>
  </Stack>
}
