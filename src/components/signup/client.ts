import { userAuthAtom } from '@/atoms/userAuth'
import { CreateUserRequest, CreateUserResponse } from '@/types/auth.schema'
import { BadRequestError } from '@/types/badRequestError.schema'
import { atom } from 'jotai'

export const sendSignUpAtom = atom(
  null,
  async (
    _get,
    set,
    {
      email,
      password
    }: {
      email: string
      password: string
    }
  ): Promise<
  | {
    success: false
    error: BadRequestError
  }
  | {
    success: true
    data: CreateUserResponse
  }
  > => {
    const payload: CreateUserRequest = {
      email,
      password
    }

    const response = await fetch('/api/user/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const data: CreateUserResponse = await response.json()
      set(userAuthAtom, data.user)
      return {
        success: true,
        data
      }
    }

    const data: CreateUserResponse = await response.json()
    set(userAuthAtom, data.user)
    return {
      success: true,
      data
    }
  }
)
