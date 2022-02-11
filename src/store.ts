import { get, writable } from "svelte/store";
import { sdk, server } from "./appwrite";

export type Todo = {
  $collection: string;
  $id: string;
  $permissions: {
    read: string[];
    write: string[];
  }
  content: string;
  isComplete: boolean;
}

export type Alert = {
  color: string;
  message: string;
}

const createTodos = () => {
  const { subscribe, update, set } = writable<Todo[]>([]);

  sdk.subscribe(`collections.${server.collection}.documents`, (response) => {
    const todo = <Todo>response.payload;
    console.log(response)

    if(response.event === "database.documents.create") {
      update((n) => [todo, ...n]);
    } else if (response.event === "database.documents.delete") {
      update((n) => n.filter((t) => t.$id !== todo.$id));
    } else if (response.event === "database.documents.update") {
      update((n) => {
        const index = n.findIndex((t) => t.$id === todo.$id);
        n[index] = {
          ...n[index],
          ...todo
        };
        return n;
      });
    }
  });

  return {
    subscribe,
    fetch: async () => {
      const response: any = await sdk.database.listDocuments(server.collection);
      return set(response.documents);
    },
    addTodo: async (content: string) => {
      const permissions = [`user:${get(state).account.$id}`];
      const todo = <Todo><unknown>await sdk.database.createDocument(
        server.collection,
        'unique()',
        {
          content,
          isComplete: false,
        },
        permissions,
        permissions
      );
    },
    removeTodo: async (todo: Todo) => {
      await sdk.database.deleteDocument(server.collection, todo.$id);
    },
    updateTodo: async (todo: Partial<Todo>) => {
      const permissions = [`user:${get(state).account.$id}`];
      await sdk.database.updateDocument(
        server.collection,
        todo.$id,
        todo,
        permissions,
        permissions
      );
    },
  };
};

const createState = () => {
  const { subscribe, set, update } = writable({
    account: null,
    alert: null,
  });

  return {
    subscribe,
    signup: async (email: string, password: string, name: string) => {
      return await sdk.account.create(email, password, name);
    },
    login: async (email: string, password: string) => {
      await sdk.account.createSession(email, password);
      const user = await sdk.account.get();
      state.init(user);
    },
    logout: async () => {
      await sdk.account.deleteSession("current");
    },
    alert: async (alert: Alert) =>
      update((n) => {
        n.alert = alert;
        return n;
      }),
    init: async (account = null) => {
      return set({ account, alert: null });
    },
  };
};

export const todos = createTodos();
export const state = createState();
