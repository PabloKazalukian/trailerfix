import { DataTypes, Model } from 'sequelize';

export const SERIES_STATUSES = ['ONGOING', 'COMPLETED', 'CANCELLED'];

export default function initSeries(sequelize) {
  class Series extends Model {}

  Series.init(
    {
      contentId: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false,
        references: { model: 'content', key: 'id' },
      },
      endYear: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(...SERIES_STATUSES),
        allowNull: false,
        defaultValue: 'ONGOING',
        validate: {
          isIn: {
            args: [SERIES_STATUSES],
            msg: `El estado debe ser uno de: ${SERIES_STATUSES.join(', ')}`,
          },
        },
      },
      // Extended fields for series
      numberOfSeasons: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        comment: 'Total number of seasons',
      },
      numberOfEpisodes: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        comment: 'Total number of episodes',
      },
      firstAirDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'First air date',
      },
      lastAirDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Last air date',
      },
      networks: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of network names',
      },
      inProduction: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
        comment: 'Whether the series is still in production',
      },
    },
    {
      sequelize,
      modelName: 'Series',
      tableName: 'series',
      underscored: true,
      timestamps: false,
    },
  );

  return Series;
}
