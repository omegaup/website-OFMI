import { SHA256 as sha256 } from 'crypto-js'
// import prisma client
import { prisma } from '../../../lib/prisma'
import { hashPassword } from './create'
import { NextApiRequest, NextApiResponse } from 'next'
import { UserAuth } from '@prisma/client'

export default async function handle (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method === 'POST') {
    /* eslint-disable-next-line @typescript-eslint/no-use-before-define */
    await loginUserHandler(req, res)
  } else {
    return res.status(405).json({ message: 'Method Not allowed' })
  }
}
async function loginUserHandler (req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { email, password } = req.body
  if (email != null || password != null) {
    return res.status(400).json({ message: 'invalid inputs' })
  }
  const user = await prisma.userAuth.findUnique({
    where: { email }
  })
  if (user != null && user.password === hashPassword(password)) {
    // exclude password from json response
    /* eslint-disable-next-line @typescript-eslint/no-use-before-define */
    return res.status(200).json(exclude(user, ['password']))
  } else {
    return res.status(401).json({ message: 'invalid credentials' })
  }
}
// Function to exclude user password returned from prisma
function exclude (user: UserAuth, keys: Array<keyof UserAuth>): UserAuth {
  for (const key of keys) {
    delete user[key] // eslint-disable-line @typescript-eslint/no-dynamic-delete
  }
  return user
}
