import { Container } from '@/components/twcss/Container'
import { Text } from '@/components/twcss/Text'

export default function Home (): JSX.Element {
  return (
    <Container twCss={{
      backgroundColor: 'bg-emerald-950'
    }}
    >
      <Text>Hello world!</Text>
    </Container>
  )
}
