const env = require('node-env-file');
const path = require('path');
const _ = require('lodash');
const Promise = require('bluebird');
const Cloudant = require('cloudant');

env(path.resolve(__dirname, '../.env'));

const args = process.argv.slice(2);

if (!args[0]) {
  throw Error('No db specified');
}

const db = Promise.promisifyAll(Cloudant({
  url: process.env.DB_URL
}).db.use(args[0]));

function getAllDocs() {
  return db.listAsync({ include_docs: true });
}

function updateDocs(docs) {
  const chunks = _.chunk(docs, 100);

  const promises = chunks.map((chunk) => {
    return db.bulkAsync({
      docs: chunk,
    });
  });

  Promise.all(promises).then(() => {
    console.log(`${docs.length} docs updated`);
  });
}

getAllDocs()
  .then((result) => {
    let docs = result.rows.map(row => row.doc);

    docs = docs.filter((doc) => {
      let updateDoc = false;

      if (doc.type && doc.type === 'entity') {
        // Mutate doc
        updateDoc = true;
      }

      return updateDoc;
    });

    updateDocs(docs);
  });
