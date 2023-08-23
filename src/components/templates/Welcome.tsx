import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeTemplateProps {
  name: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const Welcome = ({ name }: WelcomeTemplateProps) => (
  <Html>
    <Head />
    <Preview>🎉 Welcome to Sprint Padawan! 🎉</Preview>
    <Body>
      <Container>
        <Section>
          <Img
            src={`${baseUrl}/logo.webp`}
            width="40"
            height="37"
            alt={`Sprint Padawan Logo`}
          />
        </Section>
        <Heading>
          🎉 Welcome to Sprint Padawan, <strong>{name}</strong>! 🎉
        </Heading>
        <Text>Hello {name},</Text>
        <Text>Thank you for signing up for Sprint Padawan!</Text>
        <Text>
          If at any point you encounter issues, please let me know at
          support@sprintpadawan.dev.
        </Text>
        <Hr />
        <Text>— Atridad Lahiji</Text>
      </Container>
    </Body>
  </Html>
);
