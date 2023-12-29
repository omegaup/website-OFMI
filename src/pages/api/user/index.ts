import { NextApiHandler } from 'next'

import { prisma } from '@/utils/client'

const userApiHandler: NextApiHandler = async (req, res) => {
	try {
		if (req.method === 'GET') {
			const users = await prisma.user.findMany({
				orderBy: {
					createdAt: 'desc',
				},
			})

			if (!users || users.length === 0) {
				return res.status(404).json({
					success: false,
					message: 'Users not found',
				})
			}

			return res.status(200).json({
				success: true,
				message: `Total ${users.length} users found`,
				data: users,
			})
		}

		return res.status(405).json({
			success: false,
			message: 'Method not allowed',
		})
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
		})
	}
}

export default userApiHandler
