
class Cleaner {
  
  constructor(period, database) {
    this.timeout = period;
    this.database = database;
  }
  
  run() {
    setTimeout(()=>{this.cleanDatabase(this);},this.timeout);
  }
  
  cleanDatabase(object) { 
  try {
    console.log("will clean database");
  }
  catch (error) {
    console.log('ERROR: cleaner')
  }
  finally {
    setTimeout(()=>{object.cleanDatabase(object);},object.timeout);
  }
}
  
}



module.exports = Cleaner;