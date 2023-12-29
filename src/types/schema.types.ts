type Role = 'user' | 'admin'

export type User = {
	id: string
	name: string
	email: string
	role: Role
	avatar?: string
	post_id: string
	createdAt: string
	updatedA: string
}

export type Post = {
	id: string
	name: string
	image: string
	createdAt: string
	updatedA: string
}
