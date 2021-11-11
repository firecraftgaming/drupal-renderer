import { useContext, useEffect, useState } from "react";
import { ResponseData } from "../lib/api/rest";
import { ClientContext } from "./ClientProvider";

export type FieldType = 'text' | 'text_formatted_summary' | 'list_text' | 'image' | 'link';

export interface Field {
  key: string;
  type: FieldType;
}

interface RenderFieldProps {
  response: ResponseData;
  field: Field;
}

const ImageField: React.FC<RenderFieldProps> = ({ response, field }) => {
  const { client } = useContext(ClientContext);
  const { key, type } = field;

  const data = response.relationships[key].data;
  if (!data) return null;

  const { meta } = data;
  const { alt, title } = meta!;

  const [image, setImage] = useState<string | null>(null);
  useEffect(() => {
    const fetch = async () => {
      const node_type = await client?.contentTypes.fetch(response.relationships.node_type.data.id);
      const image = await client?.api.node(node_type?.name!, response.id, key).get();
      setImage((image?.data as ResponseData).attributes.uri.url);
    };
    fetch();
  }, [data]);

  return <img src={image ? 'https://eliyah.ny-webb.se' + image : undefined} alt={alt} />;
};

const RenderField: React.FC<RenderFieldProps> = ({ response, field }) => {
  const { key, type } = field;

  switch (type) {
    case "text": {
      const data = response.attributes[key];
      if (!data) return null;

      return <p>{data}</p>;
    }
    case "text_formatted_summary": {
      const data = response.attributes[key];
      if (!data) return null;

      const text = data.value;
      return <p>{text}</p>;
    }
    case "list_text": {
      const data = response.attributes[key];
      if (!data) return null;

      return (
        <ol className="list-disc list-inside">
          {data.map((item: string) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    }
    case "image": {
      return <ImageField response={response} field={field} />;
    }
    case "link": {
      const data = response.attributes[key];
      if (!data) return null;

      const { uri, title } = data;
      return <a className="text-blue-500 underline" href={uri}>{title}</a>;
    }
  }
  
  return null;
};

export default RenderField;