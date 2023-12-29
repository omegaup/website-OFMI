import { faker } from '@faker-js/faker'

import { prisma } from '../src/utils/client'
import config from '../src/config/default'

/**
 *
 * @param length dummy data length
 * @returns created/failed response
 */
const feedSomeData = async (length: number) => {
	try {
		const createRandomUsers = () => {
			return {
				name: faker.person.fullName(),
				email: faker.internet.email(),
				avatar: faker.internet.avatar(),
				role: 'user',
			} as unknown as any
		}

		// create users
		await prisma.user.createMany({
			data: faker.helpers.multiple(createRandomUsers, { count: length }),
			skipDuplicates: true,
		})

		const users = await prisma.user.findMany({
			where: {
				role: 'user',
			},
			select: {
				id: true,
			},
		})

		const getRandomUserId = () => {
			const index = Math.floor(Math.random() * 11)

			if (users.at(index) !== undefined) {
				return users[index].id
			}

			return ''
		}

		const createRandomPosts = () => {
			return {
				name: faker.lorem.slug(),
				image: faker.image.url(),
				user_id: getRandomUserId(),
			}
		}

		// create posts
		await prisma.post.createMany({
			data: faker.helpers.multiple(createRandomPosts, { count: length }),
			skipDuplicates: true,
		})

		console.log('🚀 ~ file: seed.ts:45 ~ data feeded successfully.')
	} catch (error) {
		console.log('🚀 ~ file: seed.ts:44 ~ feedSomeData ~ error:', error)
	}
}

feedSomeData(config.dummyDataLength)
