import { DataTypes, Model } from 'sequelize';

export default function initMovie(sequelize) {
  class Movie extends Model {}

  Movie.init(
    {
      contentId: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false,
        references: { model: 'content', key: 'id' },
      },
      durationMinutes: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: false,
        validate: {
          min: {
            args: [1],
            msg: 'La duracion debe ser mayor a 0 minutos',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Movie',
      tableName: 'movies',
      underscored: true,
      timestamps: false,
    },
  );

  return Movie;
}
