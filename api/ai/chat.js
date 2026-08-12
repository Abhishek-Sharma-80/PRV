'use strict';

const chatHandler = require('../chat');

module.exports = async function handler(req, res) {
  return chatHandler(req, res);
};
