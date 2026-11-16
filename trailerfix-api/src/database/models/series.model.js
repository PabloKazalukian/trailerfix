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
