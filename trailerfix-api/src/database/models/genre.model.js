import { DataTypes, Model } from 'sequelize';

export default function initGenre(sequelize) {
  class Genre extends Model {}

  Genre.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: 'El nombre del genero es obligatorio' },
          len: {
            args: [1, 50],
            msg: 'El nombre del genero debe tener entre 1 y 50 caracteres',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Genre',
      tableName: 'genres',
      underscored: true,
      timestamps: false,
    },
  );

  return Genre;
}
