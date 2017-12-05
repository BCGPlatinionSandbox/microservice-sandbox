const cassandraDriver = require('cassandra-driver');

class Cassandra {

   constructor(contactPoints, keyspace) {
    this.keyspace = keyspace;
    this.contactPoints = contactPoints;
    var client = new cassandraDriver.Client({contactPoints: contactPoints});
    this.cassandraClient  = client;
    let isNotConnected = true;

function initTable () {
  const _client = client;
  const _keyspace = keyspace;
  console.log('initTable: ', _keyspace);
  _client.execute('DROP TABLE IF EXISTS '+ _keyspace + '.file');
  _client.execute('CREATE TABLE '+ _keyspace + '.file (id text PRIMARY KEY, filename text, data blob, mimetype text)');
}


  function _connect() {
    const _client = client;
    const _keyspace = keyspace;
    _client.connect().then((val)=>{
      console.log('Connected to Cassandra');
      const createQuery = "CREATE KEYSPACE " + _keyspace + " WITH REPLICATION = {'class'  : 'SimpleStrategy', 'replication_factor' : 1 };";
      console.log('createQuery ',createQuery,"\n");
      _client.execute(createQuery).then(initTable,initTable)
    }, (reason)=>{console.log('Waiting for Cassandra to respond');setTimeout(_connect,2000);});
  }

  _connect();

//     function sleep(ms) {
//       return new Promise(resolve => setTimeout(resolve, ms));
//     }
//
// function _connect(client) {
//   client.connect().then((val)=>{console.log('resolve')}, (reason)=>{console.log('reject')}) => {
//
//   };
//   console.log(result);
//   if (result) return true;
//   return false;
// }
//
//
// async function waitForConnection(client) {
//   while (isNotConnected) {
//     console.log('isNotConnected',isNotConnected);
//     isNotConnected = _connect(client);
//     await sleep(1000);
//   }
// }


// waitForConnection(client);







//      .then(() => this.cassandraClient.execute("use " + keyspace + "; DROP TABLE IF EXISTS file; CREATE TABLE file (id text PRIMARY KEY, filename text, data blob, mimetype text);"))
//      .catch((err) => {this.cassandraClient.execute("use " + keyspace + "; DROP TABLE IF EXISTS file; CREATE TABLE file (id text PRIMARY KEY, filename text, data blob, mimetype text);")});

  }



  writeFile(token,filename,data, mime, expiresIn,cb) {
    const query = 'INSERT INTO ' + this.keyspace + '.file (id, filename, data, mimetype) VALUES (?, ?, ?, ?) USING TTL ?';
    //console.log('query',query);
    this.cassandraClient.execute(query, [token, filename, data, mime, expiresIn], { prepare: true })
    .then((result,err) => {
      cb(err);
  });
  }

  readFile(token,cb) {
    const query = 'SELECT filename, data, mimetype FROM ' + this.keyspace + '.file WHERE id = ?';
    this.cassandraClient.execute(query, [ token ], { prepare: true })
    .then((result,err) => {
      if (err) {
        const anError = new Error('Internal Error');
        anError.errno = 500;
        //console.log(anError);
        cb(anError,null);
      }
        else {
          const row = result.first();
          if (row && row.filename && row.data)
            cb(null,{filename:row.filename, data: row.data, mime:row.mimetype});
            else {
              const anError = new Error('No file found');
              anError.errno = 404;
              console.log(anError);
              cb(anError,null);
            }
        }



  });
  }

}



module.exports = Cassandra;
