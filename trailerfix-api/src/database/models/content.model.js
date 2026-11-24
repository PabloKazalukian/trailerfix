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
      // Extended fields
      trailerUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isValidTrailerUrl(value) {
            if (value && !/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/.test(value)) {
              throw new Error('trailerUrl debe ser una URL válida de YouTube');
            }
          },
        },
        comment: 'YouTube trailer URL',
      },
      posterUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: { msg: 'posterUrl debe ser una URL válida' },
        },
        comment: 'Poster image URL (TMDB/IMDb)',
      },
      backdropUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: { msg: 'backdropUrl debe ser una URL válida' },
        },
        comment: 'Backdrop/background image URL (TMDB)',
      },
      rating: {
        type: DataTypes.DECIMAL(3, 1),
        allowNull: true,
        validate: {
          min: { args: [0], msg: 'El rating debe ser mayor o igual a 0' },
          max: { args: [10], msg: 'El rating debe ser menor o igual a 10' },
        },
        comment: 'Average rating (0-10, e.g., IMDb/TMDB score)',
      },
      voteCount: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        comment: 'Number of votes for the rating',
      },
      imdbId: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
        validate: {
          isImdbId(value) {
            if (value && !/^tt\d{7,8}$/.test(value)) {
              throw new Error('imdbId debe tener formato ttXXXXXXX (ej. tt0111161)');
            }
          },
        },
        comment: 'IMDb ID (e.g., tt0111161)',
      },
      tmdbId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        unique: true,
        comment: 'TMDB ID (The Movie Database)',
      },
      originalLanguage: {
        type: DataTypes.STRING(10),
        allowNull: true,
        validate: {
          len: { args: [2, 10], msg: 'originalLanguage debe ser un código ISO 639-1 (ej. en, es)' },
        },
        comment: 'Original language code (ISO 639-1)',
      },
      originCountry: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of origin country codes (ISO 3166-1)',
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
