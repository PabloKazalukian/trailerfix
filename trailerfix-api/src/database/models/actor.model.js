import { DataTypes, Model } from 'sequelize';

export default function initActor(sequelize) {
  class Actor extends Model {
    get fullName() {
      return `${this.firstName} ${this.lastName}`.trim();
    }
  }

  Actor.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El nombre del actor es obligatorio' },
          len: {
            args: [1, 100],
            msg: 'El nombre del actor debe tener entre 1 y 100 caracteres',
          },
        },
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El apellido del actor es obligatorio' },
          len: {
            args: [1, 100],
            msg: 'El apellido del actor debe tener entre 1 y 100 caracteres',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Actor',
      tableName: 'actors',
      underscored: true,
      timestamps: false,
    },
  );

  return Actor;
}
