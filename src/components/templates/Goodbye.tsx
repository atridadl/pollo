import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Hr,
} from "@react-email/components";

interface EmailTemplateProps {
  name: string;
}

export const Goodbye: React.FC<Readonly<EmailTemplateProps>> = ({ name }) => (
  <Html>
    <Head />
    <Preview>Sorry to see you go... 😭</Preview>
    <Body>
      <Container>
        <Heading className="text-4xl">Farewell, {name}...</Heading>
        <Text>We're sorry to see you go.</Text>
        <Text>
          Your data has been deleted, including all room history, user data,
          votes, etc.
        </Text>
        <Hr />
        <Text>Sprint Padawan Admin - Atridad</Text>
      </Container>
    </Body>
  </Html>
);
