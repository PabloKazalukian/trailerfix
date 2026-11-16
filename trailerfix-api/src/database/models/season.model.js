import { DataTypes, Model } from 'sequelize';

export default function initSeason(sequelize) {
  class Season extends Model {}

  Season.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      seriesId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      seasonNumber: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: false,
        validate: {
          min: {
            args: [1],
            msg: 'El numero de temporada debe ser mayor a 0',
          },
        },
      },
      releaseYear: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: true,
      },
      episodeCount: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Season',
      tableName: 'seasons',
      underscored: true,
      timestamps: false,
      indexes: [
        {
          name: 'uq_season_number',
          unique: true,
          fields: ['seriesId', 'seasonNumber'],
        },
      ],
    },
  );

  return Season;
}
