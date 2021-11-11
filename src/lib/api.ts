import buildRoute, { ResponseData } from "./api/rest";
import { Collection, Constructable, ID } from "./util";

export abstract class Manager<Holds> {
  public readonly client: Client;

  public readonly holds: Constructable<Holds>;
  public readonly cache: Collection<ID, Holds>;

  constructor(client: Client, holds: Constructable<Holds>) {
    this.client = client;

    this.holds = holds;
    this.cache = new Collection();
  }
}

export class ContentTypeManager extends Manager<ContentType> {
  constructor(client: Client) {
    super(client, ContentType);
  }

  public async fetch(): Promise<Collection<ID, ContentType>>;
  public async fetch(id: ID, force?: boolean): Promise<ContentType>;

  public async fetch(id?: ID, force?: boolean): Promise<ContentType | Collection<ID, ContentType>> {
    if (id) {
      if (!force) {
        const contentType = this.resolve(id);
        if (contentType) return contentType;
      }

      const response = await this.client.api.node_type.node_type(id).get();
      const data = response.data as ResponseData;

      return this.add(data);
    } else {
      const response = await this.client.api.node_type.node_type.get();
      const data = response.data as ResponseData[];

      return new Collection<ID, ContentType>(data.map(v => [v.id, this.add(v)]));
    }   
  }

  public resolve(id: ID): ContentType | null {
    return this.cache.get(id) ?? null;
  }

  public resolveName(name: string): ContentType | null {
    return this.cache.find(v => v.name === name) ?? null;
  }

  private add(resolvable: ResponseData, cache = true): ContentType {
    const contentType = new ContentType(this.client, resolvable);
    if (cache) this.cache.set(contentType.id, contentType);

    return contentType;
  }
}

export class ContentManager extends Manager<Content> {
  public contentType: ContentType;
  constructor(client: Client, contentType: ContentType) {
    super(client, Content);

    this.contentType = contentType;
  }


  public async fetch(): Promise<Collection<ID, Content>>;
  public async fetch(id: ID, force?: boolean): Promise<Content>;

  public async fetch(id?: ID, force?: boolean): Promise<Content | Collection<ID, Content>> {
    if (id) {
      if (!force) {
        const content = this.resolve(id);
        if (content) return content;
      }

      const response = await this.client.api.node(this.contentType.name!)(id).get();
      const data = response.data as ResponseData;

      return this.add(data);
    } else {
      const response = await this.client.api.node(this.contentType.name!).get();
      const data = response.data as ResponseData[];

      return new Collection<ID, Content>(data.map(v => [v.id, this.add(v)]));
    }   
  }

  public resolve(id: ID): Content | null {
    return this.cache.get(id) || null;
  }

  private add(resolvable: ResponseData, cache = true): Content {
    const contentType = new Content(this.client, resolvable);
    if (cache) this.cache.set(contentType.id, contentType);

    return contentType;
  }
}

export class Content {
  public readonly client: Client;
  public readonly id: string;

  public contentType?: ContentType | null;

  public title?: string;

  private raw: ResponseData;

  constructor(client: Client, resolvable: ResponseData) {
    this.client = client;

    this.id = resolvable.id;
    this.raw = resolvable;

    this.patch(resolvable);
  }

  private patch(data: ResponseData) {
    const contentTypeId = data.relationships.node_type.data.id;
    this.contentType = this.client.contentTypes.resolve(contentTypeId);

    this.title = data.attributes.title;
  }

  static async fetch(client: Client, node: string, id: ID): Promise<Content> {
    const response = await client.api.node(node, id).get();
    const data = response.data as ResponseData;

    const contentType = await client.contentTypes.fetch(data.relationships.node_type.data.id);
    return contentType.content["add"](data);
  }

  async fetchImage(field: string) {
    if (!this.raw.relationships[field]?.data) return null;

    const response = await this.client.api.node(this.contentType?.name!, this.id, field).get();
    const data = response.data as ResponseData;

    return data.attributes;
  }

  async fetch() {
    const response = await this.client.api.node(this.contentType?.name!, this.id).get();
    const data = response.data as ResponseData;

    this.patch(data);
  }
}
export class ContentType {
  public readonly client: Client;
  public readonly id: string;

  public name?: string;

  private raw: ResponseData;

  public content: ContentManager;

  constructor(client: Client, resolvable: ResponseData) {
    this.client = client;

    this.id = resolvable.id;
    this.raw = resolvable;
    
    this.patch(resolvable);

    this.content = new ContentManager(this.client, this);
  }

  private patch(data: ResponseData) {
    this.name = data.attributes.name;
  }

  async fetch() {
    const response = await this.client.api.node_type.node_type(this.id).get();
    const data = response.data as ResponseData;

    this.patch(data);
  }
}

class Client {
  public contentTypes: ContentTypeManager = new ContentTypeManager(this);

  private base: string;
  constructor(base?: string) {
    this.base = base ?? '/api';
  }

  get api() {
    return buildRoute(this.base);
  }
}

export { Client };