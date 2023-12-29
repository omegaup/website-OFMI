import { Container } from "../components/twcss/Container";
import { Text } from "../components/twcss/Text";

const Main = () => {
  return (
    <Container
      twCss={{
        margin: "m-24",
        backgroundColor: "bg-gray-950",
        borderRadius: "rounded-3xl",
        padding: "p-8",
      }}
    >
      <Text twCss={{ textAlign: "text-center" }}>Hello World!</Text>
    </Container>
  );
};

export default Main;
