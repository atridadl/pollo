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
  Tailwind,
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
    <Tailwind>
      <Body className="bg-white my-auto mx-auto font-sans">
        <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
          <Section className="mt-[32px]">
            <Img
              src={`${baseUrl}/logo.webp`}
              width="40"
              height="37"
              alt={`Sprint Padawan Logo`}
              className="my-0 mx-auto"
            />
          </Section>
          <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
            🎉 Welcome to Sprint Padawan, <strong>{name}</strong>! 🎉
          </Heading>
          <Text className="text-black text-[14px] leading-[24px]">
            Hello {name},
          </Text>
          <Text>Thank you for signing up for Sprint Padawan!</Text>
          <Text>
            If at any point you encounter issues, please let me know at
            support@sprintpadawan.dev.
          </Text>
          <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
          <Text>— The Sprint Padawan team</Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
