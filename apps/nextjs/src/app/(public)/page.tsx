import { api } from "~/trpc/server";

export default async function HomePage() {
  const secretMessage = await api.auth.getSecretMessage();

  return (
    <main className="container py-16">
      <h1>Hello World</h1>
      <p>{secretMessage}</p>
    </main>
  );
}
