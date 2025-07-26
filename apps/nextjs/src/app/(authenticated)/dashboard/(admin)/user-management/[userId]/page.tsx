export default async function UserManagementPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <div>User: {userId}</div>;
}
