import sequelize from '../../config/database.js';
import initActor from './actor.model.js';
import initContent from './content.model.js';
import initContentActor from './contentActor.model.js';
import initContentGenre from './contentGenre.model.js';
import initGenre from './genre.model.js';
import initMovie from './movie.model.js';
import initSeason from './season.model.js';
import initSeries from './series.model.js';
import initUser from './user.model.js';
import initUserContent from './userContent.model.js';

const User = initUser(sequelize);
const Content = initContent(sequelize);
const Movie = initMovie(sequelize);
const Series = initSeries(sequelize);
const Genre = initGenre(sequelize);
const ContentGenre = initContentGenre(sequelize);
const Actor = initActor(sequelize);
const ContentActor = initContentActor(sequelize);
const Season = initSeason(sequelize);
const UserContent = initUserContent(sequelize);

Content.hasOne(Movie, { foreignKey: 'contentId', as: 'movie' });
Movie.belongsTo(Content, { foreignKey: 'contentId', as: 'content' });

Content.hasOne(Series, { foreignKey: 'contentId', as: 'series' });
Series.belongsTo(Content, { foreignKey: 'contentId', as: 'content' });

Series.hasMany(Season, { foreignKey: 'seriesId', as: 'seasons' });
Season.belongsTo(Series, { foreignKey: 'seriesId', as: 'series' });

Content.belongsToMany(Genre, {
  through: ContentGenre,
  foreignKey: 'contentId',
  otherKey: 'genreId',
  as: 'genres',
});
Genre.belongsToMany(Content, {
  through: ContentGenre,
  foreignKey: 'genreId',
  otherKey: 'contentId',
  as: 'contents',
});
ContentGenre.belongsTo(Content, { foreignKey: 'contentId', as: 'content' });
ContentGenre.belongsTo(Genre, { foreignKey: 'genreId', as: 'genre' });

Content.belongsToMany(Actor, {
  through: ContentActor,
  foreignKey: 'contentId',
  otherKey: 'actorId',
  as: 'actors',
});
Actor.belongsToMany(Content, {
  through: ContentActor,
  foreignKey: 'actorId',
  otherKey: 'contentId',
  as: 'contents',
});
ContentActor.belongsTo(Content, { foreignKey: 'contentId', as: 'content' });
ContentActor.belongsTo(Actor, { foreignKey: 'actorId', as: 'actor' });

Content.hasMany(UserContent, { foreignKey: 'contentId', as: 'userEntries' });
UserContent.belongsTo(Content, { foreignKey: 'contentId', as: 'content' });
User.hasMany(UserContent, { foreignKey: 'userId', as: 'contentEntries' });
UserContent.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.belongsToMany(Content, {
  through: UserContent,
  foreignKey: 'userId',
  otherKey: 'contentId',
  as: 'contents',
});
Content.belongsToMany(User, {
  through: UserContent,
  foreignKey: 'contentId',
  otherKey: 'userId',
  as: 'users',
});

export {
  sequelize,
  User,
  Content,
  Movie,
  Series,
  Genre,
  ContentGenre,
  Actor,
  ContentActor,
  Season,
  UserContent,
};

export default {
  sequelize,
  User,
  Content,
  Movie,
  Series,
  Genre,
  ContentGenre,
  Actor,
  ContentActor,
  Season,
  UserContent,
};
