export function serializeContent(content) {
  const data = typeof content.toJSON === 'function' ? content.toJSON() : content;

  if (Array.isArray(data.actors)) {
    data.actors = data.actors
      .map((actor) => {
        const { ContentActor, ...rest } = actor;

        return {
          ...rest,
          fullName: [rest.firstName, rest.lastName].filter(Boolean).join(' ').trim(),
          characterName: ContentActor?.characterName ?? null,
          creditOrder: ContentActor?.creditOrder ?? null,
        };
      })
      .sort((a, b) => {
        if (a.creditOrder === null && b.creditOrder === null) return 0;
        if (a.creditOrder === null) return 1;
        if (b.creditOrder === null) return -1;
        return a.creditOrder - b.creditOrder;
      });
  }

  return data;
}

export function serializeUserContent(entry) {
  const data = typeof entry.toJSON === 'function' ? entry.toJSON() : entry;

  if (data.content) {
    data.content = serializeContent(data.content);
  }

  return data;
}
