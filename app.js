const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
// Ajoutez cette section avant les autres routes
const messages = []; // Stockage temporaire des messages (remplacez par une base de données en production)

// Routes pour le chat
app.get('/api/chat/messages', (req, res) => {
  try {
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

app.post('/api/chat/messages', (req, res) => {
  try {
    const { author, content } = req.body;
    if (!author || !content) {
      return res.status(400).json({ error: 'Author and content are required' });
    }

    const newMessage = {
      id: Date.now(),
      author,
      content,
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    messages.push(newMessage);
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes'); // 
const taskRoutes = require('./routes/taskRoutes');
const factureRoutes = require('./routes/factures');
const projectRoutes = require('./routes/projectRoutes');
const managerRoutes = require('./routes/managerRoutes');
const teamRoutes = require('./routes/teamRoutes')
const equipeRoutes = require('./routes/managers')
const employeeRoutes = require('./routes/employees');
const employeeTaskse = require('./routes/employeeTaskse');


const employeeTasksRoutes = require('./routes/employeeTasks');
const dailyFeedbackRoutes = require('./routes/dailyFeedback'); 


// Ajouter cette ligne après les autres imports
const teamsRouter = require('./routes/teams');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Et cette ligne après les autres app.use()
app.use('/api/teams', teamsRouter);

dotenv.config();


const port = process.env.PORT || 5000;
// Configuration des dossiers de données
const DATA_DIR = path.join(__dirname, 'data');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');
const DOCUMENTS_FILE = path.join(DATA_DIR, 'documents.json');

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialiser le fichier notes.json s'il n'existe pas
if (!fs.existsSync(NOTES_FILE)) {
  const initialNotes = [
    {
      id: 1,
      title: "Réunion stratégique",
      preview: "Points clés discutés lors du briefing...",
      lastModified: "Modifié aujourd'hui",
      content: `# Réunion stratégique\n\n## Points clés...`
    },
    {
      id: 2,
      title: "Idées pour le projet",
      preview: "Liste des fonctionnalités à implémenter...",
      lastModified: "Modifié hier",
      content: "# Idées pour le projet\n\n..."
    }
  ];
  fs.writeFileSync(NOTES_FILE, JSON.stringify(initialNotes, null, 2), 'utf8');
}

// Initialiser le fichier documents.json s'il n'existe pas
if (!fs.existsSync(DOCUMENTS_FILE)) {
  const initialDocuments = [
    {
      id: 1,
      name: "Cahier des charges",
      type: "PDF",
      size: "2.5 MB",
      owner: "Jean Dupont",
      modifiedAt: new Date().toISOString()
    },
    {
      id: 2,
      name: "Plan de projet",
      type: "DOC",
      size: "1.2 MB",
      owner: "Marie Martin",
      modifiedAt: new Date().toISOString()
    }
  ];
  fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(initialDocuments, null, 2), 'utf8');
}

// Middleware
app.use(morgan('dev'));
app.use(helmet());


// Helper functions pour les notes
const readNotes = () => {
  try {
    return JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading notes:', err);
    return [];
  }
};

const saveNotes = (notes) => {
  try {
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
    return true;
  } catch (err) {
    console.error('Error saving notes:', err);
    return false;
  }
};

// Helper functions pour les documents
const readDocuments = () => {
  try {
    return JSON.parse(fs.readFileSync(DOCUMENTS_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading documents:', err);
    return [];
  }
};

const saveDocuments = (documents) => {
  try {
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(documents, null, 2));
    return true;
  } catch (err) {
    console.error('Error saving documents:', err);
    return false;
  }
};

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes); // 
app.use('/api/tasks', taskRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/employee-tasks', employeeTaskse);


app.use('/api/projects', projectRoutes);
app.use('/api/managers', managerRoutes);
app.use('/api/team-members', teamRoutes);
app.use('/api/equipes', equipeRoutes);
app.use('/api/employees', employeeRoutes);

app.use('/api/employee-tasks', employeeTasksRoutes);
app.use('/api/daily-feedback', dailyFeedbackRoutes);
app.use('/api', dashboardRoutes);
// Routes pour les notes
app.get('/api/notes', (req, res) => {
  try {
    const notes = readNotes();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load notes' });
  }
});

app.post('/api/notes', (req, res) => {
  try {
    const notes = readNotes();
    const now = new Date();
    const formattedDate = now.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    const newNote = {
      id: Date.now(),
      title: req.body.title || "Nouvelle note",
      preview: "Ajoutez du contenu...",
      lastModified: "Modifié maintenant",
      content: `# ${req.body.title || "Nouvelle note"}\nCrée le ${formattedDate} • Dernière modification maintenant\n\nAjoutez du contenu ici...`
    };

    notes.unshift(newNote);
    saveNotes(notes);
    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.get('/api/notes/:id', (req, res) => {
  try {
    const notes = readNotes();
    const note = notes.find(n => n.id === parseInt(req.params.id));
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get note' });
  }
});

app.put('/api/notes/:id', (req, res) => {
  try {
    const notes = readNotes();
    const noteIndex = notes.findIndex(n => n.id === parseInt(req.params.id));
    
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const updatedNote = {
      ...notes[noteIndex],
      ...req.body,
      lastModified: "Modifié maintenant"
    };

    // Générer un preview à partir du contenu
    if (req.body.content) {
      updatedNote.preview = req.body.content
        .replace(/[#*_`]/g, '')
        .replace(/\n/g, ' ')
        .substring(0, 50) + '...';
    }

    notes[noteIndex] = updatedNote;
    saveNotes(notes);
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

app.delete('/api/notes/:id', (req, res) => {
  try {
    const notes = readNotes();
    const filteredNotes = notes.filter(n => n.id !== parseInt(req.params.id));
    
    if (filteredNotes.length === notes.length) {
      return res.status(404).json({ error: 'Note not found' });
    }

    saveNotes(filteredNotes);
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

app.get('/api/notes/search', (req, res) => {
  try {
    const searchTerm = req.query.q?.toLowerCase() || '';
    const notes = readNotes();
    
    const results = notes.filter(note => {
      return (
        note.title.toLowerCase().includes(searchTerm) ||
        note.content.toLowerCase().includes(searchTerm)
      );
    });
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Routes pour les documents
app.get('/api/documents', (req, res) => {
  try {
    const documents = readDocuments();
    res.json(documents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load documents' });
  }
});

app.post('/api/documents', (req, res) => {
  try {
    const documents = readDocuments();
    const newDocument = {
      id: Date.now(),
      name: req.body.name,
      type: req.body.type,
      size: req.body.size,
      owner: req.body.owner,
      modifiedAt: new Date().toISOString()
    };

    documents.unshift(newDocument);
    saveDocuments(documents);
    res.status(201).json(newDocument);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create document' });
  }
});

app.get('/api/documents/:id', (req, res) => {
  try {
    const documents = readDocuments();
    const document = documents.find(d => d.id === parseInt(req.params.id));
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get document' });
  }
});

app.put('/api/documents/:id', (req, res) => {
  try {
    const documents = readDocuments();
    const documentIndex = documents.findIndex(d => d.id === parseInt(req.params.id));
    
    if (documentIndex === -1) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const updatedDocument = {
      ...documents[documentIndex],
      ...req.body,
      modifiedAt: new Date().toISOString()
    };

    documents[documentIndex] = updatedDocument;
    saveDocuments(documents);
    res.json(updatedDocument);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update document' });
  }
});

app.delete('/api/documents/:id', (req, res) => {
  try {
    const documents = readDocuments();
    const filteredDocuments = documents.filter(d => d.id !== parseInt(req.params.id));
    
    if (filteredDocuments.length === documents.length) {
      return res.status(404).json({ error: 'Document not found' });
    }

    saveDocuments(filteredDocuments);
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

app.get('/api/documents/search', (req, res) => {
  try {
    const searchTerm = req.query.q?.toLowerCase() || '';
    const documents = readDocuments();
    
    const results = documents.filter(document => {
      return (
        document.name.toLowerCase().includes(searchTerm) ||
        document.owner.toLowerCase().includes(searchTerm) ||
        document.type.toLowerCase().includes(searchTerm)
      );
    });
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});
app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
  console.log(`Notes stored in: ${NOTES_FILE}`);
  console.log(`Documents stored in: ${DOCUMENTS_FILE}`);
});


