import { Button } from '../button'
import { classNames, navbarStyle } from './styles'

const buttonStyleClassNames = 'p-2 rounded-lg w-32 m-1'

export const Unauthenticated = (): JSX.Element => {
  return (
    <div className='space-x-2'>
      <Button
        size='sm'
        onClick={(ev) => {
          ev.preventDefault()
          console.log('Iniciar sesión')
        }}
      >
        Iniciar sesión
      </Button>
      <Button styleType='secondary' size='sm'>
        Regístrate
      </Button>
    </div>
  )
}
