import { expect, test } from 'vitest'
import { render } from '@testing-library/react'
import Page from '../src/pages'

test('Page', () => {
  render(<Page />)
  expect(true, 'dummy test success!')
})
