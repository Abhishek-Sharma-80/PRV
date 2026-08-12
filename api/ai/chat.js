'use strict';

const mainHandler = require('../chat');

module.exports = async function handler(req, res) {
  return mainHandler(req, res);
};
