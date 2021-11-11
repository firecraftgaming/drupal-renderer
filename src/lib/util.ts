export type Constructable<T> = abstract new (...args: any[]) => T;
export class Collection<K, V> extends Map<K, V> {
  map<T>(fn: (value: V, key: K, collection: Collection<K, V>) => T): T[] {
    const results: T[] = [];
    
    const keys = this.keys();
    for (const key of keys) results.push(fn(this.get(key)!, key, this));

    return results;
  }
  find(fn: (value: V, key: K, collection: Collection<K, V>) => boolean): V | undefined {
    const keys = this.keys();
    for (const key of keys) if (fn(this.get(key)!, key, this)) return this.get(key)!;
  }
}
export type ID = string;