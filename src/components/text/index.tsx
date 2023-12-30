import { Size } from '@/types/components.types'
import classNames from 'classnames'

export interface TextProps {
  className?: string
  children: React.ReactNode
  size?: Size
  tag?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  fontWeight?: 'bold' | 'semibold' | 'normal' | 'light'
  color?: string
}

export const Text = ({ tag: Tag = 'span', children, fontWeight = 'normal', size = 'base', className, color = 'black', ...rest }: TextProps): JSX.Element => {
  return (
    <Tag
      className={classNames(
        className,
        `text-${size}`,
        `text-${color}`,
        `font-${fontWeight}`
      )} {...rest}
    >
      {children}
    </Tag>
  )
}
