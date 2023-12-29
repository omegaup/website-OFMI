import { Tailwindest } from 'tailwindest'
import { WidgetProps, twClassName, twCompose } from './twcss'

export interface ContainerProps extends WidgetProps<HTMLDivElement> {}

const defaultStyle: Tailwindest = {
  container: 'container',
  marginX: 'mx-auto',
  position: 'relative'
}

export function Container ({ twCss, className, ...props }: ContainerProps): JSX.Element {
  return <div className={twClassName(twCompose(defaultStyle, twCss), className)} {...props} />
}
