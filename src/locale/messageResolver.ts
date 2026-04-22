export type MessageLeaf = string | string[];
export type MessageTree = {
  [key: string]: MessageLeaf | MessageTree;
};

export interface ResolveMessageOptions {
  fallback?: string;
  params?: Record<string, string | number | boolean | null | undefined>;
}

export function resolveMessage(tree: MessageTree, key: string, options: ResolveMessageOptions = {}): MessageLeaf {
  const segments = key.split('.').filter(Boolean);
  let cursor: MessageTree | MessageLeaf | undefined = tree;

  for (const segment of segments) {
    if (!cursor || typeof cursor === 'string' || Array.isArray(cursor)) {
      cursor = undefined;
      break;
    }

    cursor = cursor[segment] as MessageTree | MessageLeaf | undefined;
  }

  if (cursor === undefined) {
    return options.fallback ?? key;
  }

  if (typeof cursor === 'string') {
    return interpolateTemplate(cursor, options.params);
  }

  if (Array.isArray(cursor)) {
    return cursor.map((item) => interpolateTemplate(item, options.params));
  }

  return options.fallback ?? key;
}

export function interpolateTemplate(
  template: string,
  params?: Record<string, string | number | boolean | null | undefined>
): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_match, key) => {
    const value = params[key];
    return value === null || value === undefined ? '' : String(value);
  });
}

export function isMessageTree(value: unknown): value is MessageTree {
  return typeof value === 'object' && value !== null;
}
