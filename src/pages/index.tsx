import Image from 'next/image'
import { Inter } from 'next/font/google'
import { Container } from '@/components/twcss/Container'
import { Text } from '@/components/twcss/Text'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
	return (
		<Container twCss={{
			backgroundColor: "bg-emerald-950"
		}}>
			<Text>Hello world!</Text>
		</Container>
	)
}
