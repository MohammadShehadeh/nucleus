export default async function CourseEditPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <div>Edit Course: {courseId}</div>;
}
