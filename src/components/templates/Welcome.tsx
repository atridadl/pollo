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

export const Welcome: React.FC<Readonly<EmailTemplateProps>> = ({ name }) => (
  <Html>
    <Head />
    <Preview>🎉 Welcome to Sprint Padawan! 🎉</Preview>
    <Body>
      <Container>
        <Heading className="text-4xl">Welcome, {name}!</Heading>
        <Text>Thank you for signing up for Sprint Padawan!</Text>
        <Text>
          If at any point you encounter issues, please let me know at
          support@sprintpadawan.dev.
        </Text>
        <Hr />
        <Text>Sprint Padawan Admin - Atridad</Text>
      </Container>
    </Body>
  </Html>
);
