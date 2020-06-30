const fs = require("fs");

class UsersRepository {
  constructor (filename) {
    if (!filename) {
      throw new Error('Creating a repository requires a filename')
    }
    this.filename = filename;
    try {
      fs.accessSync(this.filename);
    } catch (err) {
      fs.writeFileSync(this.filename, '[]');
    }
  }

  async getAll() {
    // Open the fille named this.filename
    const contents = await fs.promises.readFile(this.filename, { encoding: 'utf8'});

    //parse contents
    const data = JSON.parse(contents)

    //Return parsed data
    return data;
  }
}


const test = async() => {
  const repo = new UsersRepository('users.json');

  await repo.getAll();
};

test();
  