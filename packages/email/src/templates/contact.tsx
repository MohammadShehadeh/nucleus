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

interface ContactTemplateProps {
  readonly name: string;
  readonly email: string;
  readonly message: string;
}

export const ContactTemplate = ({ name, email, message }: ContactTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>New message from {name}</Preview>
      <Body className="bg-zinc-50 font-sans">
        <Container className="mx-auto py-12">
          <Section className="mt-8 rounded-md bg-zinc-200 p-px">
            <Section className="rounded-[5px] bg-white p-8">
              <Text className="mb-4 mt-0 text-2xl font-semibold text-zinc-950">
                New contact message
              </Text>
              <Text className="m-0 text-zinc-500">
                <strong>{name}</strong> ({email}) has sent you a message:
              </Text>
              <Hr className="my-4" />
              <Section className="my-6 rounded-md bg-zinc-50 p-4">
                <Text className="m-0 text-zinc-700">{message}</Text>
              </Section>
              <Section className="my-8 text-center">
                <Button
                  className="rounded-md bg-zinc-950 px-6 py-3 text-white no-underline"
                  href={`mailto:${email}?subject=Re: Your message`}
                >
                  Reply to {name}
                </Button>
              </Section>
              <Hr className="my-4" />
              <Text className="m-0 text-sm text-zinc-400">
                This message was sent through your website contact form.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

ContactTemplate.PreviewProps = {
  name: "Jane Smith",
  email: "jane.smith@example.com",
  message:
    "I'm interested in your services and would like to schedule a consultation to discuss my project requirements.",
};
