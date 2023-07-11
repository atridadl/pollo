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
  Tailwind,
  Section,
  Img,
} from "@react-email/components";

interface GoodbyeTemplateProps {
  name: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const Goodbye: React.FC<Readonly<GoodbyeTemplateProps>> = ({ name }) => (
  <Html>
    <Head />
    <Preview>Sorry to see you go... 😭</Preview>
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
          <Heading className="text-4xl">Farewell, {name}...</Heading>
          <Text>{"Were sorry to see you go."}</Text>
          <Text>
            Your data has been deleted, including all room history, user data,
            votes, etc.
          </Text>
          <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
          <Text>— The Sprint Padawan team</Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
