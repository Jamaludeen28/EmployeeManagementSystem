// server.js

const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'Desktop/' });
app.use(cors());
app.use(express.json());
const port = 3001;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'EMSystem'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL');
});


app.use(bodyParser.json());

const jwt = require('jsonwebtoken');


app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    let sql = 'INSERT INTO signup (username, email, password) VALUES (?, ?, ?)';
    connection.query(sql, [username, email, password], (err, result) => {
      if (err) throw err;
      console.log(result);
      res.send('User registered successfully.');
      console.log('user registered successfully');
    });
  });

  app.post('/signinadmin', async (req, res) => {
    const { email, password} = req.body;

    const query = `SELECT * FROM signup WHERE email = ? AND password = ?`;
    connection.query(query, [email, password], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const { username } = results[0];

        
        const tokenPayload = { email, username };
      
        const token = jwt.sign(tokenPayload, 'sdfkjlrfdgchkgjfgkjk123asvd', { expiresIn: '1h' });

        
        res.json({ token,username });
    });
});

app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    const queryEmployees = `SELECT * FROM Employees WHERE email = ? AND password = ?`;
    const queryLeaders = `SELECT * FROM Leaders WHERE email = ? AND password = ?`;

    connection.query(queryEmployees, [email, password], (errorEmp, resultsEmp) => {
        if (errorEmp) {
            console.error('Error querying employee database:', errorEmp);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (resultsEmp.length > 0) {
            const { name } = resultsEmp[0];
            const token = jwt.sign({ email, designation: 'Employees', name }, 'your_secret_key', { expiresIn: '1h' });
            return res.json({ token, name, designation: 'Employees' });
        } else {
            connection.query(queryLeaders, [email, password], (errorLead, resultsLead) => {
                if (errorLead) {
                    console.error('Error querying leader database:', errorLead);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                if (resultsLead.length > 0) {
                    const { name } = resultsLead[0];
                    const token = jwt.sign({ email, designation: 'Leaders', name }, 'your_secret_key', { expiresIn: '1h' });
                    return res.json({ token, name, designation: 'Leaders' });
                } else {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }
            });
        }
    });
});



app.post('/addleader', (req, res) => {
    const { name, password, email,department,teamname,mobileno,currency,frequency,amount } = req.body;

    const query = `INSERT INTO Leaders (name, password, email,department,teamname,mobileno,currency,frequency,amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    connection.query(query, [name, password, email,department,teamname,mobileno,currency,frequency,amount], (error, results) => {
        if (error) {
            console.error('Error storing data in MySQL: ' + error.stack);
            res.status(500).json({ error: 'Error storing data' });
            return;
        }

        console.log('Data stored in MySQL:');
        res.status(200).json({ message: 'Data stored successfully' });
    });
});

app.get('/getlead', (req, res) => {

    const query = 'SELECT * FROM Leaders';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching payslips:', error);
            res.status(500).json({ error: 'Failed to fetch payslips' });
            return;
        }

        res.status(200).json(results);
    });
});

app.delete('/deleteLead', (req, res) => {
    const name = req.body.name;
    const query = `DELETE FROM Leaders WHERE name = ?`;

    connection.query(query, [name], (error, results) => {
        if (error) {
            console.error('Error deleting lead:', error);
            res.status(500).json({ error: 'Failed to delete lead' });
            return;
        }

        res.status(200).json({ message: 'Lead deleted successfully' });
    });
});

app.delete('/deleteEmployee', (req, res) => {
    const name = req.body.name;
    const query = `DELETE FROM Employees WHERE name = ?`;

    connection.query(query, [name], (error, results) => {
        if (error) {
            console.error('Error deleting lead:', error);
            res.status(500).json({ error: 'Failed to delete lead' });
            return;
        }

        res.status(200).json({ message: 'Lead deleted successfully' });
    });
});


app.post('/addemployee', (req, res) => {
    const { name, password, email,department,leadname,mobileno,currency,frequency,amount } = req.body;

    const query = `INSERT INTO Employees (name, password, email,department,leadname,mobileno,currency,frequency,amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    connection.query(query, [name, password, email,department,leadname,mobileno,currency,frequency,amount], (error, results) => {
        if (error) {
            console.error('Error storing data in MySQL: ' + error.stack);
            res.status(500).json({ error: 'Error storing data' });
            return;
        }

        console.log('Data stored in MySQL:');
        res.status(200).json({ message: 'Data stored successfully' });
    });
});

app.get('/getEmployee', (req, res) => {

    const query = 'SELECT * FROM Employees';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching payslips:', error);
            res.status(500).json({ error: 'Failed to fetch payslips' });
            return;
        }

        res.status(200).json(results);
    });
});

app.get('/gridemployees', (req, res) => {
    const leadname = req.query.leadname;

    const query = `SELECT * FROM Employees WHERE leadname = ?`;

    connection.query(query, [leadname], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }

        res.json(results);
    });
});

// app.post('/signin', (req, res) => {
//     const { email, password } = req.body;

//     // Check if the email and password match any record in the database
//     const query = `SELECT * FROM Leaders WHERE email = ? AND password = ?`;
//     connection.query(query, [email, password], (error, results) => {
//         if (error) {
//             console.error('Error querying database: ' + error.stack);
//             res.status(500).json({ error: 'Internal server error' });
//             return;
//         }

//         if (results.length > 0) {
//             // If a record is found, send success response
//             res.status(200).json({ message: 'Sign in successful', user: results[0] });
//             console.log("Sigin Successfull");
//         } else {
//             // If no record is found, send error response
//             res.status(401).json({ error: 'Invalid email or password' });
//             console.log("Sigin Not Successfull");
//         }
//     });
// });

app.post('/addpayslip', upload.single('file'), (req, res) => {
    console.log(req.file); 
    console.log(req.body);

    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const { name, employeeId, designation, department, email, salary, month, year } = req.body;
    const fileData = fs.readFileSync(req.file.path);

    
    const query = `INSERT INTO payslips (name, employeeId, designation, department, email, salary, month, year, file) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    connection.query(query, [name, employeeId, designation, department, email, salary, month, year, fileData], (error, results) => {
        if (error) {
            console.error('Error storing data in MySQL: ' + error.stack);
            return res.status(500).json({ error: 'Error storing data' });
        }

        console.log('Data stored in MySQL:');
        res.status(200).json({ message: 'Data stored successfully' });
    });
});


app.get('/getpayslips', (req, res) => {
 
    const query = 'SELECT name, employeeId, designation, department, email, salary, month, year, file FROM payslips'; 
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching payslips:', error);
            res.status(500).json({ error: 'Failed to fetch payslips' });
            return;
        }

        res.status(200).json(results);
    });
});

app.get('/pdf/:name', (req, res) => {
    const name = req.params.name;
    const query = 'SELECT file FROM payslips WHERE name = ?'; 
    connection.query(query, [name], (error, results) => {
        if (error) {
            console.error('Error fetching PDF:', error);
            res.status(500).json({ error: 'Failed to fetch PDF' });
            return;
        }
        
        if (results.length === 0) {
            res.status(404).json({ error: 'PDF not found' });
            return;
        }

        const fileHexData = results[0].file; 
        const fileBuffer = Buffer.from(fileHexData, 'hex'); 

        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename=${name}.pdf`,
        });
        res.end(fileBuffer);
    });
});

app.get('/pdfselect/:name/:month/:year', (req, res) => {
    const name = req.params.name;
    const year = req.params.year;
    const month = req.params.month;

    const query = 'SELECT file FROM payslips WHERE name = ? AND year = ? AND month = ?'; 
    connection.query(query, [name, year, month], (error, results) => {
        if (error) {
            console.error('Error fetching PDF:', error);
            res.status(500).json({ error: 'Failed to fetch PDF' });
            return;
        }
        
        if (results.length === 0) {
            res.status(404).json({ error: 'PDF not found' });
            return;
        }

        const fileHexData = results[0].file; 
        const fileBuffer = Buffer.from(fileHexData, 'hex'); 

   
        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename=${name}_${year}_${month}.pdf`,
        });
        res.end(fileBuffer);
    });
});




app.post('/addinfo', (req, res) => {
    const {regno,incordate, vatno,address} = req.body;


    const query = `INSERT INTO company (regno,incordate, vatno,address) VALUES (?, ?, ?, ?)`;
    connection.query(query, [regno,incordate, vatno,address], (error, results) => {
        if (error) {
            console.error('Error storing data in MySQL: ' + error.stack);
            res.status(500).json({ error: 'Error storing data' });
            return;
        }

        console.log('Data stored in MySQL:');
        res.status(200).json({ message: 'Data stored successfully' });
    });
});


app.get('/getCompinfo', (req, res) => {

    const query = 'SELECT * FROM company';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching payslips:', error);
            res.status(500).json({ error: 'Failed to fetch payslips' });
            return;
        }

        res.status(200).json(results);
    });
});

app.post('/eventform', (req, res) => {
    const { eventname, eventdate } = req.body;

  
    const query = `INSERT INTO Events (eventname, eventdate) VALUES (?, ?)`;
    connection.query(query, [eventname, eventdate], (error, results) => {
        if (error) {
            console.error('Error storing data in MySQL: ' + error.stack);
            res.status(500).json({ error: 'Error storing data' });
            return;
        }

        console.log('Data stored in MySQL:');
        res.status(200).json({ message: 'Data stored successfully' });
    });
});

app.get('/getevents', (req, res) => {
    
    const query = 'SELECT * FROM Events';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching payslips:', error);
            res.status(500).json({ error: 'Failed to fetch payslips' });
            return;
        }

        res.status(200).json(results);
    });
});



app.post('/addholiday', (req, res) => {
    const { leavetype, date, fromdate, todate, noofdays } = req.body;

    const query = `INSERT INTO Holidays (leavetype, date, fromdate, todate, noofdays) VALUES (?, ?, ?, ?, ?)`;
    connection.query(query, [leavetype, date, fromdate, todate, noofdays], (error, results) => {
        if (error) {
            console.error('Error storing data in MySQL: ' + error.stack);
            res.status(500).json({ error: 'Error storing data' });
            return;
        }

        console.log('Data stored in MySQL:');
        res.status(200).json({ message: 'Data stored successfully' });
    });
});

app.get('/getholiday', (req, res) => {

    const query = 'SELECT * FROM Holidays';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching payslips:', error);
            res.status(500).json({ error: 'Failed to fetch payslips' });
            return;
        }

        res.status(200).json(results);
    });
});

app.post('/applyLeave', (req, res) => {
    const { name, leavetype, fromdate, todate, noofdays, reason, tlstatus, adminstatus } = req.body;
    const query = `INSERT INTO Leaves (name, leavetype, fromdate, todate, noofdays, reason, tlstatus, adminstatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    connection.query(query, [name, leavetype, fromdate, todate, noofdays, reason, tlstatus, adminstatus], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send('Leave application submitted successfully');
        }
    });
});
app.post('/applyLeavetl', (req, res) => {
    const { name, leavetype, fromdate, todate, noofdays, reason, adminstatus } = req.body;
    const query = `INSERT INTO Leavestl (name, leavetype, fromdate, todate, noofdays, reason, adminstatus) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    connection.query(query, [name, leavetype, fromdate, todate, noofdays, reason, adminstatus], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send('Leave application submitted successfully');
        }
    });
});

app.put('/updateLeave/:id', (req, res) => {
    const requestId = req.params.id;
    const { adminstatus } = req.body;
  
  
    const sql = `UPDATE Leavestl SET adminstatus = ? WHERE id = ?`;
    connection.query(sql, [adminstatus, requestId], (err, result) => {
      if (err) {
        console.error('Error updating leave:', err);
        res.status(500).json({ error: 'Failed to update leave request' });
        return;
      }
      console.log('Leave request updated successfully');
      res.json({ success: true });
    });
  });
  app.put('/updateLeaveemp/:id', (req, res) => {
    const requestId = req.params.id;
    const { adminstatus } = req.body;

  
    const sql = `UPDATE Leaves SET adminstatus = ? WHERE id = ?`;
    connection.query(sql, [adminstatus, requestId], (err, result) => {
      if (err) {
        console.error('Error updating leave:', err);
        res.status(500).json({ error: 'Failed to update leave request' });
        return;
      }
      console.log('Leave request updated successfully');
      res.json({ success: true });
    });
  });


  app.put('/updateLeaveemptl/:id', (req, res) => {
    const requestId = req.params.id;
    const { tlstatus } = req.body;
  

    const sql = `UPDATE Leaves SET tlstatus = ? WHERE id = ?`;
    connection.query(sql, [tlstatus, requestId], (err, result) => {
      if (err) {
        console.error('Error updating leave:', err);
        res.status(500).json({ error: 'Failed to update leave request' });
        return;
      }
      console.log('Leave request updated successfully');
      res.json({ success: true });
    });
  });

  app.get('/getLeave', (req, res) => {

    const query = 'SELECT * FROM Leaves';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching leaves:', error);
            res.status(500).json({ error: 'Failed to fetch leaves' });
            return;
        }

        res.status(200).json(results);
    });
});

app.get('/getLeavetl', (req, res) => {

    const query = 'SELECT * FROM Leavestl';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching leaves:', error);
            res.status(500).json({ error: 'Failed to fetch leaves' });
            return;
        }

        res.status(200).json(results);
    });
});


app.post('/applyResign', (req, res) => {
    const { name, noticeperiod, applydate, reason } = req.body;
    const query = `INSERT INTO Resignations (name, noticeperiod, applydate, reason) VALUES (?, ?, ?, ?)`;
    connection.query(query, [name, noticeperiod, applydate, reason], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send('Resignation application submitted successfully');
        }
    });
});

app.post('/applyResigntl', (req, res) => {
    const { name, noticeperiod, applydate, reason } = req.body;
    const query = `INSERT INTO Resignationstl (name, noticeperiod, applydate, reason) VALUES (?, ?, ?, ?)`;
    connection.query(query, [name, noticeperiod, applydate, reason], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send('Resignation application submitted successfully');
        }
    });
});

app.get('/getResign', (req, res) => {

    const query = 'SELECT * FROM Resignations';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching resignations:', error);
            res.status(500).json({ error: 'Failed to fetch resignations' });
            return;
        }

        res.status(200).json(results);
    });
});

app.get('/getResigntl', (req, res) => {

    const query = 'SELECT * FROM Resignationstl';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching resignations:', error);
            res.status(500).json({ error: 'Failed to fetch resignations' });
            return;
        }

        res.status(200).json(results);
    });
});

app.put('/updateResign/:id', (req, res) => {
    const requestId = req.params.id;
    const { adminstatus } = req.body;

    const sql = `UPDATE Resignationstl SET adminstatus = ? WHERE id = ?`;
    connection.query(sql, [adminstatus, requestId], (err, result) => {
      if (err) {
        console.error('Error updating resignation:', err);
        res.status(500).json({ error: 'Failed to update resignation request' });
        return;
      }
      console.log('Resignation request updated successfully');
      res.json({ success: true });
    });
  });
  app.put('/updateResignemp/:id', (req, res) => {
    const requestId = req.params.id;
    const { adminstatus } = req.body;

    const sql = `UPDATE Resignations SET adminstatus = ? WHERE id = ?`;
    connection.query(sql, [adminstatus, requestId], (err, result) => {
      if (err) {
        console.error('Error updating resignation:', err);
        res.status(500).json({ error: 'Failed to update resignation request' });
        return;
      }
      console.log('Resignation request updated successfully');
      res.json({ success: true });
    });
  });

app.put('/updateResignemptl/:id', (req, res) => {
    const requestId = req.params.id;
    const { tlstatus } = req.body;
  

    const sql = `UPDATE Resignations SET tlstatus = ? WHERE id = ?`;
    connection.query(sql, [tlstatus, requestId], (err, result) => {
      if (err) {
        console.error('Error updating resignation:', err);
        res.status(500).json({ error: 'Failed to update resignation request' });
        return;
      }
      console.log('Resignation request updated successfully');
      res.json({ success: true });
    });
  });

  app.post('/sendQuery', (req, res) => {
    const { name, subject, queries } = req.body;
    const query = `INSERT INTO Queries (name, subject, queries) VALUES (?, ?, ?)`;
    connection.query(query, [name, subject, queries], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send('Query sent successfully');
        }
    });
});

app.get('/getQuery', (req, res) => {

    const query = 'SELECT * FROM Queries';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching queries:', error);
            res.status(500).json({ error: 'Failed to fetch queries' });
            return;
        }

        res.status(200).json(results);
    });
});

app.post('/sendReply', (req, res) => {
    const { subject, replies } = req.body;
    const query = `INSERT INTO Replies (subject, replies) VALUES (?, ?)`;
    connection.query(query, [subject, replies], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send('Reply sent successfully');
        }
    });
});
app.get('/getReply', (req, res) => {

    const query = 'SELECT * FROM Replies';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching replies:', error);
            res.status(500).json({ error: 'Failed to fetch replies' });
            return;
        }

        res.status(200).json(results);
    });
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
