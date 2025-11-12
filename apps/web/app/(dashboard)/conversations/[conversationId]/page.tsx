import ConversationsView from "@/app/(dashboard)/conversations/[conversationId]/view";

type PageProps = {
  params: Promise<{
    conversationId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { conversationId } = await params;

  return <ConversationsView conversationId={conversationId} />;
}
