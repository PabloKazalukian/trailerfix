import { DataTypes, Model } from 'sequelize';

export default function initContent(sequelize) {
  class Content extends Model {}

  Content.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El titulo es obligatorio' },
          len: {
            args: [1, 255],
            msg: 'El titulo debe tener entre 1 y 255 caracteres',
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      releaseYear: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM('MOVIE', 'SERIES'),
        allowNull: false,
        validate: {
          isIn: {
            args: [['MOVIE', 'SERIES']],
            msg: 'El tipo debe ser MOVIE o SERIES',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Content',
      tableName: 'content',
      underscored: true,
      timestamps: true,
      updatedAt: false,
    },
  );

  return Content;
}
