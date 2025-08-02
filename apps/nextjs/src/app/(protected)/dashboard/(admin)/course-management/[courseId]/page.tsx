export default async function CourseManagementPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <div>Course: {courseId}</div>;
}
