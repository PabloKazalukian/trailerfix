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
      // Extended fields for movies
      budget: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        comment: 'Production budget in USD',
      },
      revenue: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        comment: 'Box office revenue in USD',
      },
      originalTitle: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Original title in original language',
      },
      runtimeMinutes: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: true,
        validate: {
          min: { args: [1], msg: 'El runtime debe ser mayor a 0 minutos' },
        },
        comment: 'Runtime in minutes (alternative to duration_minutes)',
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
