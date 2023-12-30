import { Size } from '@/types/components.types'
import classNames from 'classnames'
import { Text } from '@/components/text'
import s from './style.module.css'

export interface ButtonProps {
  onClick?: () => {}
  type?: 'primary' | 'secondary'
  size?: Size
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export const Button = ({ className, type = 'primary', size = 'base', children, ...rest }: ButtonProps): JSX.Element => {
  return (
    <button
      className={classNames(
        s.button,
        s[type],
        s[size],
        className
      )}
      {...rest}
    >
      <Text
        color={type === 'primary' ? 'white' : 'blue-500'}
        fontWeight={type === 'primary' ? 'bold' : 'semibold'}
        size={size}
      >
        {children}
      </Text>
    </button>
  )
}
