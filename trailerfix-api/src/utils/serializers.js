export function serializeContent(content, userStatusMap = null) {
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

  // Flatten movie and series fields into content for easier frontend consumption
  if (data.movie) {
    data.durationMinutes = data.movie.durationMinutes;
    data.budget = data.movie.budget;
    data.revenue = data.movie.revenue;
    data.originalTitle = data.movie.originalTitle;
    data.runtimeMinutes = data.movie.runtimeMinutes;
    delete data.movie;
  }

  if (data.series) {
    data.endYear = data.series.endYear;
    data.status = data.series.status;
    data.numberOfSeasons = data.series.numberOfSeasons;
    data.numberOfEpisodes = data.series.numberOfEpisodes;
    data.firstAirDate = data.series.firstAirDate;
    data.lastAirDate = data.series.lastAirDate;
    data.networks = data.series.networks;
    data.inProduction = data.series.inProduction;
    data.seasons = data.series.seasons;
    delete data.series;
  }

  // Ensure rating is a number (not string) if present
  if (data.rating !== null && data.rating !== undefined) {
    data.rating = Number(data.rating);
  }

  if (userStatusMap && data.id) {
    data.userStatus = userStatusMap.get(data.id) ?? null;
  }

  return data;
}

export function serializeContentList(contents, userId, userContentRepository) {
  if (!userId || contents.length === 0) {
    return contents.map((c) => serializeContent(c));
  }

  const contentIds = contents.map((c) => c.id);
  return userContentRepository
    .findStatusesByUserAndContentIds(userId, contentIds)
    .then((statuses) => {
      const userStatusMap = new Map(statuses.map((s) => [s.contentId, s.status]));
      return contents.map((c) => serializeContent(c, userStatusMap));
    });
}

export function serializeUserContent(entry) {
  const data = typeof entry.toJSON === 'function' ? entry.toJSON() : entry;

  if (data.content) {
    data.content = serializeContent(data.content);
  }

  return data;
}
