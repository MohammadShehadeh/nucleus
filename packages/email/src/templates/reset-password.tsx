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

interface ResetPasswordTemplateProps {
  readonly name: string;
  readonly resetUrl: string;
}

export const ResetPasswordTemplate = ({
  name,
  resetUrl,
}: ResetPasswordTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body className="bg-zinc-50 font-sans">
        <Container className="mx-auto py-12">
          <Section className="mt-8 rounded-md bg-zinc-200 p-px">
            <Section className="rounded-[5px] bg-white p-8">
              <Text className="mb-4 mt-0 text-2xl font-semibold text-zinc-950">
                Reset your password
              </Text>
              <Text className="m-0 text-zinc-500">Hello {name},</Text>
              <Text className="m-0 text-zinc-500">
                We received a request to reset your password. Click the button
                below to create a new password:
              </Text>
              <Section className="my-8 text-center">
                <Button
                  className="rounded-md bg-zinc-950 px-6 py-3 text-white no-underline"
                  href={resetUrl}
                >
                  Reset Password
                </Button>
              </Section>
              <Text className="m-0 text-sm text-zinc-400">
                This link will expire in 24 hours. If you didn't request a
                password reset, you can safely ignore this email.
              </Text>
              <Hr className="my-4" />
              <Text className="m-0 text-sm text-zinc-400">
                If the button doesn't work, copy and paste this link into your
                browser: {resetUrl}
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

ResetPasswordTemplate.PreviewProps = {
  name: "Jane Smith",
  resetUrl: "https://example.com/reset-password?token=abc123",
};
