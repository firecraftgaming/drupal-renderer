import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useContext, useEffect } from 'react';
import { ClientContext } from '../../../components/ClientProvider';
import RenderField from '../../../components/RenderField';
import { Content } from '../../../lib/api';

export type FieldType = 'text' | 'text_formatted_summary' | 'list_text' | 'image' | 'link';

export interface Field {
  key: string;
  type: FieldType;
}

const fields: Field[] = [
  { key: 'body', type: 'text_formatted_summary' },
  { key: 'field_friends', type: 'text' },
  { key: 'field_list_test', type: 'list_text' },
  { key: 'field_thumbnail', type: 'image' },
  { key: 'field_website', type: 'link' },
];

interface PostProps {
  post: Content;
}

const Post: React.FC<PostProps> = ({ post }) => {
  return (
    <div className="p-4 h-screen overflow-y-auto">
      <div>
        <h2 className="text-3xl py-2">{post.title}</h2>
        {
          fields.map((field) => <RenderField response={post['raw']} key={field.key} field={field} />)
        }
      </div>
    </div>
  );
};

const Article: NextPage = () => {
  const [data, setData] = React.useState<Content | null>(null);
  const { client } = useContext(ClientContext);

  const router = useRouter();
  const { node, id } = router.query as { [key: string]: string };

  useEffect(() => {
    if (!client || !id || !node) return;

    const fetch = async () => {
      let type = client.contentTypes.cache.find((type) => type.name === node);
      let content: Content;

      if (!type) {
        content = await Content.fetch(client, node, id);
      } else {
        content = await type.content.fetch(id);
      }

      setData(content);
    };
    fetch();
  }, [client, id]);

  return data && <Post key={data.id} post={data} />;
}

export default Article;