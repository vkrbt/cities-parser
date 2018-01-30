'use strict';

const request = require('request-promise-native');
const cheerio = require('cheerio');
const fs = require('fs');

const letters = 'А Б В Г Д Е Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ы Э Ю Я'.split(' ');
const url = 'http://geo.koltyrin.ru/spisok_gorodov_mira.php?letter='

const getOptions = letter => ({
  uri: `${url}${encodeURIComponent(letter)}`,
  transform: function (body) {
    return cheerio.load(body);
  }
});

const firstLine = 'module.exports = {\n';
const lastLine = '};\n'
const lettersPath = './letters/letters.js'

const generateLine = (letter, cities) => `'${letter.toLowerCase()}': ${JSON.stringify(cities)},\n`;

const clearCities = (cities, letter) => cities.filter((city) => city.length > 1 && letter.toLowerCase() === city[0].toLowerCase());

const getCities = (letters) => {
  if (letters.length === 0) {
    const file = fs.readFileSync(lettersPath, 'utf8');
    fs.writeFileSync(
      lettersPath,
      file + lastLine,
    );
  } else {
    const currentLetter = letters.pop();
    request(getOptions(currentLetter))
      .then(($) => {
        const cities = $('.bg_white').text().trim().slice(1).split(' ');

        const file = fs.readFileSync(lettersPath, 'utf8');

        const clearedCities = generateLine(currentLetter, cities);

        fs.writeFileSync(
          lettersPath,
          `${file}${clearedCities}`
        );

        getCities(letters);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

fs.writeFileSync(
  lettersPath,
  firstLine,
);

getCities(letters);
