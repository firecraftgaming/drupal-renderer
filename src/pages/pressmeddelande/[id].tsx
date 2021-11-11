import { useRouter } from "next/router";
import { useState, useContext, useEffect } from "react";
import { ClientContext } from "../../components/ClientProvider";
import { Content } from "../../lib/api";

const Pressmeddelande = () => {
  const [data, setData] = useState<Content | null>(null);
  const [image, setImage] = useState<string | null>(null);

  const { client } = useContext(ClientContext);

  const router = useRouter();
  const { id } = router.query as { id: string };

  const type_name = 'pressmeddelande';

  useEffect(() => {
    if (!client || !id) return;

    const fetch = async () => {
      let type = client.contentTypes.resolveName(type_name);
      if (!type) {
        await client.contentTypes.fetch();
        type = client.contentTypes.resolveName(type_name);
      }

      const content = await type?.content.fetch(id) ?? null;
      setData(content);

      const image = await content?.fetchImage('field_thumbnail');
      setImage(image?.uri.url as string);
    };
    fetch();
  }, [client, id]);

  useEffect(() => {
    if (!data?.title) return;
    document.title = data.title;
  }, [data?.title]);

  console.log(data);

  return (
    <div className="flex flex-col justify-start items-center w-screen h-screen overflow-y-auto">
      <div className="flex flex-col justify-start items-center pt-32" style={{ width: 720 }}>
        <h1 className="text-center text-5xl font-bold mb-4">{data?.title}</h1>
        <h2 className="text-center text-2xl font-thin mb-20">{data?.['raw'].attributes.field_sub_title}</h2>
        <img src={image ? ('https://eliyah.ny-webb.se' + image) : undefined} />

        <div className="text-left text-xl font-thin mb-20 body" dangerouslySetInnerHTML={{ __html: data?.['raw'].attributes.field_body.processed ?? '' }}></div>

        
      </div>
    </div>
  );
};

export default Pressmeddelande;