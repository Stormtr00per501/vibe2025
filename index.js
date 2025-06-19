@@ -11,55 +11,52 @@ const dbConfig = {
    user: 'root',
    password: '',
    database: 'todolist',
  };
};


  async function retrieveListItems() {
async function retrieveListItems() {
    try {
      // Create a connection to the database
      const connection = await mysql.createConnection(dbConfig);

      // Query to select all items from the database
      const query = 'SELECT id, text FROM items';

      // Execute the query
      const [rows] = await connection.execute(query);

      // Close the connection
      await connection.end();

      // Return the retrieved items as a JSON array
      return rows;
        // Create a connection to the database
        const connection = await mysql.createConnection(dbConfig);
        
        // Query to select all items from the database
        const query = 'SELECT id, text FROM items';
        
        // Execute the query
        const [rows] = await connection.execute(query);
        
        // Close the connection
        await connection.end();
        
        // Return the retrieved items as a JSON array
        return rows;
    } catch (error) {
      console.error('Error retrieving list items:', error);
      throw error; // Re-throw the error
        console.error('Error retrieving list items:', error);
        throw error; // Re-throw the error
    }
  }
}

// Stub function for generating HTML rows
async function getHtmlRows() {
    // Example data - replace with actual DB data later
    /*
    const todoItems = [
        { id: 1, text: 'First todo item' },
        { id: 2, text: 'Second todo item' }
    ];*/

    const todoItems = await retrieveListItems();

    // Generate HTML for each item
    return todoItems.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.text}</td>
            <td><button class="delete-btn">×</button></td>
            <td>
                <form action="/delete" method="POST" class="delete-form">
                    <input type="hidden" name="id" value="${item.id}">
                    <button type="submit" class="delete-btn">×</button>
                </form>
            </td>
        </tr>
    `).join('');
}

// Modified request handler with template replacement
async function handleRequest(req, res) {
    if (req.url === '/') {
    if (req.url === '/' && req.method === 'GET') {
        try {
            const html = await fs.promises.readFile(
                path.join(__dirname, 'index.html'), 
@@ -76,6 +73,33 @@ async function handleRequest(req, res) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error loading index.html');
        }
    } else if (req.url === '/delete' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const id = new URLSearchParams(body).get('id');
                if (!id || isNaN(id)) {
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end('Invalid task ID');
                    return;
                }
                const connection = await mysql.createConnection(dbConfig);
                const [result] = await connection.execute('DELETE FROM items WHERE id = ?', [id]);
                await connection.end();
                if (result.affectedRows === 0) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Task not found');
                    return;
                }
                res.writeHead(302, { 'Location': '/' });
                res.end();
            } catch (err) {
                console.error('Error deleting item:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error deleting item');
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Route not found');
