import axios from "axios";
import { ID } from "../util";

const methods = [ 'get' ] as const;
type method = typeof methods[number];

const noop = () => {};
const reflectors = [
  'toString',
  'valueOf',
  'inspect',
  'constructor',
  Symbol.toPrimitive,
  Symbol.for('nodejs.util.inspect.custom'),
];

function request(method: method, route: string) {
  switch (method) {
    case 'get':
      return axios.get(route).then(res => res.data as Response);
  }
}

type RouteInterface = 
{
  [key in method]: () => ReturnType<typeof request>;
} &
{
  [key: string | number]: RouteInterface;
  (...args: (string | number)[]): RouteInterface;
};

function buildRoute(base: string): RouteInterface {
  const route = [''];
  const handler: ProxyHandler<typeof noop> = {
    get(target, name) {
      if (reflectors.includes(name)) return () => route.join('/');

      if ((methods as readonly any[]).includes(name)) {
        const method = name as method;
        
        return () => request(
          method,
          base + route.join('/'),
        );
      }

      route.push(name.toString());
      return new Proxy(noop, handler);
    },

    apply(target, _, args) {
      route.push(...args.filter(x => x !== null).map(x => x.toString()));
      return new Proxy(noop, handler);
    },
  };
  return new Proxy(noop, handler) as RouteInterface;
}

interface Link {
  href: string;
}
interface Links {
  self: Link;
  [key: string]: Link;
}

interface Relationship {
  data: {
    id: ID;
    type: string;
    meta?: {
      alt?: string;
      title?: string;

      width?: number;
      height?: number;
    }
  };
  links: Links;
}
interface Relationships {
  [key: string]: Relationship;
}

export interface ResponseData {
  type: string;
  id: ID,
  links: Links;
  
  attributes: any;
  relationships: Relationships;
}

export interface Response {
  jsonapi: {
    version: string;
    meta: {
      links: Links;
    }
  },
  data: ResponseData | ResponseData[];
  meta?: {
    count?: number
  },
  links: Links;
}

export default buildRoute;