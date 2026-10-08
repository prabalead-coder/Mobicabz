import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({name: 'test.db', location: 'default'});

export const initializeDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS my_table (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, value TEXT)',
      [],
      () => console.log('Table created successfully'),
      (_, error) => console.error('Error creating table: ', error),
    );

    // Insert initial data into the table
    tx.executeSql(
      'INSERT INTO my_table (name, value) VALUES (?, ?)',
      ['Item 1', 'Value 1'],
      () => console.log('Data inserted successfully'),
      (_, error) => console.error('Error inserting data: ', error),
    );
    tx.executeSql(
      'INSERT INTO my_table (name, value) VALUES (?, ?)',
      ['Item 2', 'Value 2'],
      () => console.log('Data inserted successfully'),
      (_, error) => console.error('Error inserting data: ', error),
    );
  });
};

export const insertData = (name, value) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO my_table (name, value) VALUES (?, ?)',
      [name, value],
      () => console.log('Data inserted successfully'),
      (_, error) => console.error('Error inserting data: ', error),
    );
  });
};

export const fetchData = callback => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM my_table',
      [],
      (_, {rows}) => {
        const data = rows.raw();
        callback(data);
      },
      (_, error) => {
        console.error('Error fetching data: ', error);
        callback([]); // Provide an empty array as a fallback
      },
    );
  });
};
