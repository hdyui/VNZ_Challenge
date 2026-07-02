// src/features/news/pages/NewsCreatePage.tsx
import { NewsForm } from "../components/NewsForm";
import { useCreateNews } from "../hooks/useNews";
import type { NewsFormSchemaType } from "../schema";

export const NewsCreatePage = () => {
  const { mutate: createNews, isPending } = useCreateNews();

  const handleCreate = (data: NewsFormSchemaType) => {
    createNews({
      title: data.title,
      coverImg: data.coverImg,
      contentHtml: data.contentHtml,
      contentJson: data.contentJson,
      status: data.status,
    });
  };

  return (
    <div className="py-4 animate-in fade-in duration-300">
      <NewsForm onSubmit={handleCreate} isLoading={isPending} />
    </div>
  );
};
