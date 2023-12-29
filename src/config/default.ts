const config = {
	isProduction: process.env.NODE_ENV === 'production',
	dummyDataLength: 10, // prisma seed data length
}

export default config
