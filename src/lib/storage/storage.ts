import type Id from "src/models/Id";

export interface StorageService<T> {
  get(id: Id): Promise<T>;
  set(id: Id, state: T): Promise<void>;
}
