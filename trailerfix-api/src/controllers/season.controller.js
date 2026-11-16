import seasonRepository from '../repositories/season.repository.js';

async function getSeriesOr404(req, res) {
  const series = await seasonRepository.findSeries(req.params.contentId);

  if (!series) {
    res.status(404).json({ error: 'Serie no encontrada' });
    return null;
  }

  return series;
}

async function list(req, res) {
  const series = await getSeriesOr404(req, res);

  if (!series) {
    return undefined;
  }

  const seasons = await seasonRepository.findBySeries(series.contentId);
  return res.json(seasons);
}

async function create(req, res) {
  const series = await getSeriesOr404(req, res);

  if (!series) {
    return undefined;
  }

  const season = await seasonRepository.create({
    seriesId: series.contentId,
    ...req.body,
  });

  return res.status(201).json(season);
}

async function update(req, res) {
  const series = await getSeriesOr404(req, res);

  if (!series) {
    return undefined;
  }

  const season = await seasonRepository.findById(req.params.seasonId);

  if (!season || season.seriesId !== series.contentId) {
    return res.status(404).json({ error: 'Temporada no encontrada' });
  }

  const updated = await seasonRepository.update(season, req.body);
  return res.json(updated);
}

async function remove(req, res) {
  const series = await getSeriesOr404(req, res);

  if (!series) {
    return undefined;
  }

  const season = await seasonRepository.findById(req.params.seasonId);

  if (!season || season.seriesId !== series.contentId) {
    return res.status(404).json({ error: 'Temporada no encontrada' });
  }

  await seasonRepository.delete(season);
  return res.status(204).end();
}

export default { list, create, update, remove };
