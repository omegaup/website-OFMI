import type { Tailwindest } from 'tailwindest'
import { Container, type ContainerProps } from './Container'
import { twCompose } from './twcss'

const vStackStyle: Tailwindest = {
  display: 'flex',
  flexDirection: 'flex-col',
  flexShrink: 'shrink-0'
}

export const VStack = ({ twCss, ...props }: ContainerProps): JSX.Element => {
  return <Container twCss={twCompose(vStackStyle, twCss)} {...props} />
}
