import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface VerifyEmailTemplateProps {
  readonly name: string;
  readonly verifyUrl: string;
}

export const VerifyEmailTemplate = ({
  name,
  verifyUrl,
}: VerifyEmailTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>Please verify your email address</Preview>
      <Body className="bg-zinc-50 font-sans">
        <Container className="mx-auto py-12">
          <Section className="mt-8 rounded-md bg-zinc-200 p-px">
            <Section className="rounded-[5px] bg-white p-8">
              <Text className="mb-4 mt-0 text-2xl font-semibold text-zinc-950">
                Welcome to our platform!
              </Text>
              <Text className="m-0 text-zinc-500">Hello {name},</Text>
              <Text className="m-0 text-zinc-500">
                Thank you for signing up! To complete your account setup, please
                verify your email address by clicking the button below:
              </Text>
              <Section className="my-8 text-center">
                <Button
                  className="rounded-md bg-zinc-950 px-6 py-3 text-white no-underline"
                  href={verifyUrl}
                >
                  Verify Email Address
                </Button>
              </Section>
              <Text className="m-0 text-sm text-zinc-400">
                This verification link will expire in 7 days. If you didn't
                create an account, you can safely ignore this email.
              </Text>
              <Hr className="my-4" />
              <Text className="m-0 text-sm text-zinc-400">
                If the button doesn't work, copy and paste this link into your
                browser: {verifyUrl}
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

VerifyEmailTemplate.PreviewProps = {
  name: "Jane Smith",
  verifyUrl: "https://example.com/verify-email?token=abc123",
};
