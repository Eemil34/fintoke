import TemplateWorkspace from '@/components/dashboard/TemplateWorkspace';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <TemplateWorkspace templateId={id} />;
}
