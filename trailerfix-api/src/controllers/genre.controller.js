import genreRepository from '../repositories/genre.repository.js';

async function list(req, res) {
  const search =
    req.query.search === undefined ? '' : String(req.query.search).trim();
  const genres = await genreRepository.findAll(search || undefined);
  return res.json(genres);
}

async function getById(req, res) {
  const genre = await genreRepository.findById(req.params.id);

  if (!genre) {
    return res.status(404).json({ error: 'Genero no encontrado' });
  }

  return res.json(genre);
}

async function create(req, res) {
  const genre = await genreRepository.create(req.body);
  return res.status(201).json(genre);
}

async function update(req, res) {
  const genre = await genreRepository.findById(req.params.id);

  if (!genre) {
    return res.status(404).json({ error: 'Genero no encontrado' });
  }

  const updated = await genreRepository.update(genre, req.body);
  return res.json(updated);
}

async function remove(req, res) {
  const genre = await genreRepository.findById(req.params.id);

  if (!genre) {
    return res.status(404).json({ error: 'Genero no encontrado' });
  }

  await genreRepository.delete(genre);
  return res.json({ message: 'Se borró el género satisfactoriamente.' });
}

export default { list, getById, create, update, remove };
