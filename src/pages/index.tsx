import type { NextPage } from 'next';
import React, { useContext, useEffect } from 'react';
import { ClientContext } from '../components/ClientProvider';
import { Content } from '../lib/api';
import Link from 'next/link';

const Home: NextPage = () => {
  const [data, setData] = React.useState<Content[]>();
  const { client } = useContext(ClientContext);

  useEffect(() => {
    if (!client) return;

    const fetch = async () => {
      const types = await client.contentTypes.fetch();
      const contents = await Promise.all(types.map(type => type.content.fetch()));
      const content = contents.map(v => v.map(v => v)).reduce((acc, content) => acc.concat(content), [] as Content[]);

      console.log(content);
      setData(content);
    };
    fetch();
  }, [client]);

  return (
    <div className="h-screen overflow-y-auto">
      <div className="m-4">
        {data && data.map(post => 
          <Link href={`/node/${post.contentType?.name}/${post.id}`}>
            <a className="block p-2">
              {post.title}
            </a>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Home