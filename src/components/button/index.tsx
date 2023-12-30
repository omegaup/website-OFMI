import { Size } from '@/types/components.types'
import classNames from 'classnames'
import { Text } from '@/components/text'
import s from './style.module.css'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  styleType?: 'primary' | 'secondary'
  size?: Size
}

export const Button = ({ className, styleType = 'primary', size = 'base', children, ...rest }: ButtonProps): JSX.Element => {
  return (
    <button
      className={classNames(
        s.button,
        s[styleType],
        s[size],
        className
      )}
      {...rest}
    >
      <Text
        color='inherit'
        fontWeight={styleType === 'primary' ? 'bold' : 'semibold'}
        size={size}
      >
        {children}
      </Text>
    </button>
  )
}
